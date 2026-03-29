"""
Agent run management.
POST /api/runs/trigger — create a run record (agents pick it up via ADK)
GET  /api/runs/:id     — full trace with messages
GET  /api/runs         — list runs for current user
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from agent_runner import run_coordinator_for_run
from database import get_db
from models.agents import AgentMessage, AgentRun
from models.user import User
from schemas.agents import AgentMessageOut, AgentRunOut, RunTraceOut, TriggerRunRequest


class RunUpdate(BaseModel):
    status: Optional[str] = None        # pending|running|completed|failed
    risk_level: Optional[str] = None
    completed_at: Optional[datetime] = None


class AgentMessageCreate(BaseModel):
    run_id: int
    agent_name: str
    agent_type: str = "local"           # local|a2a|parallel|loop
    input: Dict[str, Any] = {}
    output: Dict[str, Any] = {}
    iteration: int = 0
    duration_ms: Optional[int] = None

router = APIRouter(prefix="/api/runs", tags=["runs"])


@router.post("/trigger", response_model=AgentRunOut, status_code=201)
async def trigger_run(
    body: TriggerRunRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    run = AgentRun(
        user_id=user.id,
        normalized_event_id=body.normalized_event_id,
        status="pending",
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    background_tasks.add_task(
        run_coordinator_for_run,
        user_id=user.id,
        run_id=run.id,
        auth_header=request.headers.get("authorization", ""),
        api_base_url=str(request.base_url).rstrip("/"),
        scenario="live",
    )
    return run


@router.get("", response_model=List[AgentRunOut])
async def list_runs(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentRun).where(AgentRun.user_id == user.id).order_by(AgentRun.started_at.desc()).limit(50)
    )
    return result.scalars().all()


@router.put("/{run_id}", response_model=AgentRunOut)
async def update_run(
    run_id: int,
    body: RunUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AgentRun).where(AgentRun.id == run_id, AgentRun.user_id == user.id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if body.status is not None:
        run.status = body.status
    if body.risk_level is not None:
        run.risk_level = body.risk_level
    if body.completed_at is not None:
        run.completed_at = body.completed_at
    elif body.status in ("completed", "failed"):
        run.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(run)
    return run


@router.post("/messages", response_model=AgentMessageOut, status_code=201)
async def create_agent_message(
    body: AgentMessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg = AgentMessage(
        run_id=body.run_id,
        agent_name=body.agent_name,
        agent_type=body.agent_type,
        input=body.input,
        output=body.output,
        iteration=body.iteration,
        duration_ms=body.duration_ms,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.get("/{run_id}", response_model=RunTraceOut)
async def get_run_trace(
    run_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AgentRun).where(AgentRun.id == run_id, AgentRun.user_id == user.id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    msgs_result = await db.execute(
        select(AgentMessage).where(AgentMessage.run_id == run_id).order_by(AgentMessage.created_at)
    )
    messages = msgs_result.scalars().all()
    return RunTraceOut(run=run, messages=messages)

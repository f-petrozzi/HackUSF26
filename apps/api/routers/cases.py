from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_admin, get_current_user
from database import get_db
from models.agents import Case
from models.user import User
from schemas.agents import CaseOut, CaseStatusUpdate


class CaseCreate(BaseModel):
    user_id: int
    run_id: Optional[int] = None
    risk_level: str = "low"

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("", response_model=CaseOut, status_code=201)
async def create_case(
    body: CaseCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case = Case(
        user_id=body.user_id,
        run_id=body.run_id,
        risk_level=body.risk_level,
        status="open",
    )
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return case


@router.get("", response_model=List[CaseOut])
async def list_cases(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Members see their own; admins see all (handled below via role check)
    query = select(Case).order_by(Case.created_at.desc()).limit(100)
    if user.role != "admin":
        query = query.where(Case.user_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{case_id}", response_model=CaseOut)
async def get_case(
    case_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if user.role != "admin" and case.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return case


@router.put("/{case_id}/status", response_model=CaseOut)
async def update_case_status(
    case_id: int,
    body: CaseStatusUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if user.role != "admin" and case.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    from datetime import datetime, timezone
    case.status = body.status
    case.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(case)
    return case

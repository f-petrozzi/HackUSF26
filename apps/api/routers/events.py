"""
Event ingestion and wearable simulator.
POST /api/events/ingest — accepts a single signal event
POST /api/events/simulate — generates a realistic bundle for a named scenario
"""
from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.events import BehaviorEvent, NormalizedEvent, WearableEvent
from models.user import User
from schemas.events import IngestEventRequest, NormalizedEventOut, SimulateRequest, WearableEventOut

router = APIRouter(prefix="/api/events", tags=["events"])

# ---------------------------------------------------------------------------
# Scenario bundles for the simulator
# ---------------------------------------------------------------------------

_SCENARIOS: dict[str, list[dict]] = {
    "stressed_student": [
        {"signal_type": "sleep_hours", "value": "4.5", "unit": "hours"},
        {"signal_type": "sleep_quality", "value": "2", "unit": "1-10"},
        {"signal_type": "stress_level", "value": "8", "unit": "1-10"},
        {"signal_type": "steps", "value": "800", "unit": "steps"},
        {"signal_type": "check_in_mood", "value": "anxious", "unit": ""},
        {"signal_type": "check_in_note", "value": "Finals week, haven't slept properly in days", "unit": ""},
    ],
    "exhausted_caregiver": [
        {"signal_type": "sleep_hours", "value": "5", "unit": "hours"},
        {"signal_type": "sleep_quality", "value": "3", "unit": "1-10"},
        {"signal_type": "stress_level", "value": "9", "unit": "1-10"},
        {"signal_type": "activity_level", "value": "1", "unit": "1-10"},
        {"signal_type": "check_in_mood", "value": "exhausted", "unit": ""},
        {"signal_type": "check_in_note", "value": "completely drained, been caring for mom all week", "unit": ""},
    ],
    "older_adult": [
        {"signal_type": "steps", "value": "1200", "unit": "steps"},
        {"signal_type": "sleep_hours", "value": "5.5", "unit": "hours"},
        {"signal_type": "sleep_quality", "value": "4", "unit": "1-10"},
        {"signal_type": "heart_rate", "value": "88", "unit": "bpm"},
        {"signal_type": "check_in_mood", "value": "confused", "unit": ""},
        {"signal_type": "check_in_note", "value": "Missed morning routine, joints aching", "unit": ""},
    ],
}


def _build_summary(signals: dict[str, Any]) -> str:
    parts = []
    if "sleep_hours" in signals:
        parts.append(f"sleep {signals['sleep_hours']}h")
    if "stress_level" in signals:
        parts.append(f"stress {signals['stress_level']}/10")
    if "steps" in signals:
        parts.append(f"{signals['steps']} steps")
    if "check_in_mood" in signals:
        parts.append(f"mood: {signals['check_in_mood']}")
    return "; ".join(parts) if parts else "health check-in"


@router.get("/recent", response_model=List[WearableEventOut])
async def recent_events(
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the N most recent wearable events for this user. Used by get_recent_signals_tool."""
    result = await db.execute(
        select(WearableEvent)
        .where(WearableEvent.user_id == user.id)
        .order_by(WearableEvent.recorded_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/ingest", response_model=WearableEventOut, status_code=201)
async def ingest_event(
    body: IngestEventRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = body.recorded_at or datetime.now(timezone.utc)
    event = WearableEvent(
        user_id=user.id,
        source=body.source,
        signal_type=body.signal_type,
        value=body.value,
        unit=body.unit,
        recorded_at=now,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.post("/simulate", response_model=NormalizedEventOut, status_code=201)
async def simulate(
    body: SimulateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    bundle = _SCENARIOS.get(body.scenario)
    if not bundle:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario '{body.scenario}'. Available: {list(_SCENARIOS)}",
        )

    now = datetime.now(timezone.utc)
    signals: dict[str, Any] = {}

    for sig in bundle:
        event = WearableEvent(
            user_id=user.id,
            source="simulated",
            signal_type=sig["signal_type"],
            value=sig["value"],
            unit=sig["unit"],
            recorded_at=now,
        )
        db.add(event)
        signals[sig["signal_type"]] = sig["value"]

    norm = NormalizedEvent(
        user_id=user.id,
        signals=signals,
        summary=_build_summary(signals),
    )
    db.add(norm)
    await db.commit()
    await db.refresh(norm)
    return norm

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import DEMO_PRIVILEGED_EMAILS, get_real_user
from database import get_db
from models.user import User

router = APIRouter(prefix="/api/demo", tags=["demo"])

DEMO_USER_EMAILS = [
    "student@caremesh.demo",
    "student2@caremesh.demo",
    "student3@caremesh.demo",
    "caregiver@caremesh.demo",
    "caregiver2@caremesh.demo",
    "older_adult@caremesh.demo",
    "older_adult2@caremesh.demo",
    "accessibility@caremesh.demo",
    "coordinator@caremesh.demo",
    "admin@caremesh.demo",
]

DEMO_LABELS: dict[str, str] = {
    "student@caremesh.demo": "Student — stressed",
    "student2@caremesh.demo": "Student — female",
    "student3@caremesh.demo": "Student — recovering",
    "caregiver@caremesh.demo": "Caregiver — exhausted (F)",
    "caregiver2@caremesh.demo": "Caregiver — exhausted (M)",
    "older_adult@caremesh.demo": "Older Adult — disrupted",
    "older_adult2@caremesh.demo": "Older Adult — stable",
    "accessibility@caremesh.demo": "Accessibility Focused",
    "coordinator@caremesh.demo": "Coordinator (staff)",
    "admin@caremesh.demo": "Admin (staff)",
}


@router.get("/users")
async def list_demo_users(
    user: User = Depends(get_real_user),
    db: AsyncSession = Depends(get_db),
):
    """List available demo accounts. Only accessible to internal privileged accounts."""
    if user.email not in DEMO_PRIVILEGED_EMAILS:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for demo access")

    result = await db.execute(select(User).where(User.email.in_(DEMO_USER_EMAILS)))
    users = result.scalars().all()

    by_email = {u.email: u for u in users}
    return [
        {
            "id": by_email[email].id,
            "email": email,
            "role": by_email[email].role,
            "label": DEMO_LABELS.get(email, email),
        }
        for email in DEMO_USER_EMAILS
        if email in by_email
    ]

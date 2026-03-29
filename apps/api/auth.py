from __future__ import annotations

from typing import Optional

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from clerk_auth import get_or_create_clerk_user, verify_clerk_session_token
from database import get_db
from models.user import User

bearer_scheme = HTTPBearer(auto_error=False)
STAFF_ROLES = {"coordinator", "admin"}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session_cookie: Optional[str] = Cookie(default=None, alias="__session"),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials if credentials is not None else session_cookie
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")

    claims = verify_clerk_session_token(token)
    return await get_or_create_clerk_user(claims, db)


def is_admin(user: User) -> bool:
    return user.role == "admin"


def is_staff(user: User) -> bool:
    return user.role in STAFF_ROLES


async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not is_admin(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user


async def get_current_coordinator(user: User = Depends(get_current_user)) -> User:
    if not is_staff(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Coordinator or admin required")
    return user

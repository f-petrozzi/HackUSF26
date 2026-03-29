from __future__ import annotations

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://caremesh:caremesh@localhost:5432/caremesh"

    # Clerk
    clerk_secret_key: str = ""
    clerk_jwt_key: str = ""
    clerk_frontend_api_url: str = ""
    clerk_jwks_url: str = ""
    clerk_authorized_parties: str = ""

    # Gemini
    gemini_api_key: str = ""

    # Garmin
    garmin_enabled: bool = False
    garmin_username: str = ""
    garmin_password: str = ""
    garmin_token_dir: str = "./garmin_tokens"
    garmin_sync_interval_min: int = 45
    garmin_sync_days_back: int = 30


settings = Settings()

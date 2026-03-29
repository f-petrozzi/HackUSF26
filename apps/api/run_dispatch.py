from __future__ import annotations

import os

from fastapi import Request


def coordinator_api_base_url(request: Request) -> str:
    configured = os.getenv("API_BASE_URL", "").strip()
    if configured:
        return configured.rstrip("/")
    return str(request.base_url).rstrip("/")

from __future__ import annotations

from typing import Any, Dict

from services.tools._client import api_request


def get_user_profile(*, api_base_url: str, auth_header: str) -> Dict[str, Any]:
    profile = api_request(
        method="GET",
        path="/api/profile",
        api_base_url=api_base_url,
        auth_header=auth_header,
    )
    accessibility = api_request(
        method="GET",
        path="/api/profile/accessibility",
        api_base_url=api_base_url,
        auth_header=auth_header,
    )
    profile["accessibility"] = accessibility
    return profile

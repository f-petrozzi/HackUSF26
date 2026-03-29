from __future__ import annotations

from typing import Any, Dict, Optional

from services.tools._client import api_request


def create_intervention(
    *,
    user_id: int,
    run_id: Optional[int],
    meal_suggestion: str,
    activity_suggestion: str,
    wellness_action: str,
    empathy_message: str,
    api_base_url: str,
    auth_header: str,
) -> Dict[str, Any]:
    return api_request(
        method="POST",
        path="/api/interventions",
        api_base_url=api_base_url,
        auth_header=auth_header,
        json_payload={
            "user_id": user_id,
            "run_id": run_id,
            "meal_suggestion": meal_suggestion,
            "activity_suggestion": activity_suggestion,
            "wellness_action": wellness_action,
            "empathy_message": empathy_message,
        },
    )

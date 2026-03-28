"""Tool: create a care case record in the API."""
from google.adk.tools import FunctionTool
from ._http import post


def create_case(user_id: int, run_id: int, risk_level: str, token: str) -> dict:
    """
    Create a new care case for a user.

    Args:
        user_id: ID of the user.
        run_id: ID of the agent run that triggered the case.
        risk_level: One of "low", "moderate", "high", "critical".
        token: JWT access token.

    Returns:
        Case dict or error dict.
    """
    try:
        return post(
            "/api/cases",
            body={"user_id": user_id, "run_id": run_id, "risk_level": risk_level},
            token=token,
        )
    except Exception as exc:
        return {"error": str(exc)}


create_case_tool = FunctionTool(create_case)

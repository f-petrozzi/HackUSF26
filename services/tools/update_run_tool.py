"""Tool: update an agent run's status and risk level."""
from typing import Optional
from google.adk.tools import FunctionTool
from ._http import put


def update_run(
    run_id: int,
    token: str,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
) -> dict:
    """
    Update the status and/or risk level of an agent run.

    Args:
        run_id: ID of the agent run to update.
        token: JWT access token.
        status: New status — one of "pending", "running", "completed", "failed".
        risk_level: Risk level — one of "low", "moderate", "high", "critical".

    Returns:
        Updated AgentRun dict or error dict.
    """
    body = {}
    if status is not None:
        body["status"] = status
    if risk_level is not None:
        body["risk_level"] = risk_level
    try:
        return put(f"/api/runs/{run_id}", body=body, token=token)
    except Exception as exc:
        return {"error": str(exc)}


update_run_tool = FunctionTool(update_run)

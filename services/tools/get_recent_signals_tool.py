"""Tool: fetch recent wearable events for the current user."""
from google.adk.tools import FunctionTool
from ._http import get


def get_recent_signals(token: str, limit: int = 20) -> dict:
    """
    Fetch recent wearable/manual signal events for the authenticated user.

    Args:
        token: JWT access token.
        limit: Maximum number of events to return (default 20).

    Returns:
        List of WearableEvent dicts wrapped in {"events": [...]} or error dict.
    """
    try:
        data = get("/api/events/recent", params={"limit": limit}, token=token)
        return {"events": data}
    except Exception as exc:
        return {"error": str(exc)}


get_recent_signals_tool = FunctionTool(get_recent_signals)

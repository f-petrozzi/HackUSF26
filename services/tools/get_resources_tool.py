"""Tool: fetch support resources filtered by persona type."""
from google.adk.tools import FunctionTool
from ._http import get


def get_resources(persona: str, token: str) -> dict:
    """
    Fetch recommended resources for a given persona type.

    Args:
        persona: One of "student", "caregiver", "older_adult", "accessibility_focused".
        token: JWT access token.

    Returns:
        Dict with {"resources": [...]} or error dict.
    """
    try:
        data = get("/api/resources", params={"persona": persona}, token=token)
        return {"resources": data}
    except Exception as exc:
        return {"error": str(exc)}


get_resources_tool = FunctionTool(get_resources)

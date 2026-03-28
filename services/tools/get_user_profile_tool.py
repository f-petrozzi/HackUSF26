"""Tool: fetch the current user's profile from the API."""
from google.adk.tools import FunctionTool
from ._http import get


def get_user_profile(token: str) -> dict:
    """
    Fetch the authenticated user's profile.

    Args:
        token: JWT access token for the user.

    Returns:
        UserProfile dict or error dict.
    """
    try:
        return get("/api/profile", token=token)
    except Exception as exc:
        return {"error": str(exc)}


get_user_profile_tool = FunctionTool(get_user_profile)

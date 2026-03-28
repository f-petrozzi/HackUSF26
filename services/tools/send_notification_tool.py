"""Tool: send a notification to a user via the API."""
from google.adk.tools import FunctionTool
from ._http import post


def send_notification(user_id: int, notification_type: str, content: str, token: str) -> dict:
    """
    Send a notification to the user.

    Args:
        user_id: ID of the user to notify.
        notification_type: Notification type, e.g. "intervention_ready".
        content: Human-readable notification body.
        token: JWT access token.

    Returns:
        Notification dict or error dict.
    """
    try:
        return post(
            "/api/notifications",
            body={"user_id": user_id, "type": notification_type, "content": content},
            token=token,
        )
    except Exception as exc:
        return {"error": str(exc)}


send_notification_tool = FunctionTool(send_notification)

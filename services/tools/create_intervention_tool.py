"""Tool: persist the final intervention plan to the API."""
from google.adk.tools import FunctionTool
from ._http import post


def create_intervention(
    user_id: int,
    run_id: int,
    meal_suggestion: str,
    activity_suggestion: str,
    wellness_action: str,
    empathy_message: str,
    token: str,
) -> dict:
    """
    Persist the intervention plan produced by the agent pipeline.

    Args:
        user_id: ID of the user.
        run_id: ID of the agent run.
        meal_suggestion: Meal recommendation text.
        activity_suggestion: Activity recommendation text.
        wellness_action: Wellness action text.
        empathy_message: User-facing empathy message.
        token: JWT access token.

    Returns:
        Intervention dict or error dict.
    """
    try:
        return post(
            "/api/interventions",
            body={
                "user_id": user_id,
                "run_id": run_id,
                "meal_suggestion": meal_suggestion,
                "activity_suggestion": activity_suggestion,
                "wellness_action": wellness_action,
                "empathy_message": empathy_message,
            },
            token=token,
        )
    except Exception as exc:
        return {"error": str(exc)}


create_intervention_tool = FunctionTool(create_intervention)

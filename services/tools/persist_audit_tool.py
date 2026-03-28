"""Tool: write an audit log entry and optionally a run message to the API."""
from typing import Any, Dict, Optional
from google.adk.tools import FunctionTool
from ._http import post


def persist_audit(
    action: str,
    entity_type: str,
    entity_id: str,
    metadata: Dict[str, Any],
    token: str,
    run_id: Optional[int] = None,
    agent_name: Optional[str] = None,
    agent_type: Optional[str] = None,
    input_data: Optional[Dict[str, Any]] = None,
    output_data: Optional[Dict[str, Any]] = None,
    iteration: int = 0,
    duration_ms: Optional[int] = None,
) -> dict:
    """
    Persist an audit log entry. Optionally also records an AgentMessage for trace view.

    Args:
        action: Audit action label, e.g. "agent_completed".
        entity_type: Type of entity, e.g. "agent_run".
        entity_id: String ID of the entity.
        metadata: Arbitrary metadata dict.
        token: JWT access token.
        run_id: If provided, also writes a run message record.
        agent_name: Agent name for run message (required if run_id set).
        agent_type: One of "local", "a2a", "parallel", "loop".
        input_data: Agent input dict.
        output_data: Agent output dict.
        iteration: Loop iteration count (default 0).
        duration_ms: Elapsed milliseconds.

    Returns:
        Dict with {"audit": ..., "message": ...} or error dict.
    """
    try:
        audit = post(
            "/api/audit-logs",
            body={
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "metadata": metadata,
            },
            token=token,
        )
        result: Dict[str, Any] = {"audit": audit}

        if run_id is not None and agent_name is not None:
            message = post(
                "/api/runs/messages",
                body={
                    "run_id": run_id,
                    "agent_name": agent_name,
                    "agent_type": agent_type or "local",
                    "input": input_data or {},
                    "output": output_data or {},
                    "iteration": iteration,
                    "duration_ms": duration_ms,
                },
                token=token,
            )
            result["message"] = message

        return result
    except Exception as exc:
        return {"error": str(exc)}


persist_audit_tool = FunctionTool(persist_audit)

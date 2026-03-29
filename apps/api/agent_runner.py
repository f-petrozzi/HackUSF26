from __future__ import annotations

from datetime import datetime, timezone
import logging
import os
from pathlib import Path
import sys
from typing import Optional

logger = logging.getLogger(__name__)


def _discover_repo_root() -> Path:
    env_root = os.getenv("CAREMESH_REPO_ROOT")
    if env_root:
        return Path(env_root).resolve()

    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "services" / "agents").exists():
            return parent

    # Common Docker volume-mount fallback (/workspace is mounted in docker-compose)
    workspace = Path("/workspace")
    if (workspace / "services" / "agents").exists():
        return workspace

    raise RuntimeError(
        "Cannot locate agents directory. "
        "Set CAREMESH_REPO_ROOT to the repository root (the directory containing services/agents)."
    )


def _ensure_agents_importable() -> None:
    repo_root = _discover_repo_root()
    agents_dir = repo_root / "services" / "agents"
    for path in (str(agents_dir), str(repo_root)):
        if path not in sys.path:
            sys.path.insert(0, path)


def run_coordinator_for_run(
    *,
    user_id: int,
    run_id: int,
    auth_header: str,
    api_base_url: str,
    scenario: str = "live",
) -> None:
    _ensure_agents_importable()

    from config import load_settings
    from coordinator.agent import CareCoordinatorPipeline
    from tooling import ToolProvider

    settings = load_settings()
    tool_provider = ToolProvider(
        use_stubs=False,
        api_base_url=api_base_url,
        auth_header=auth_header,
    )

    try:
        tool_provider.update_run({"run_id": run_id, "status": "running"})
        pipeline = CareCoordinatorPipeline(settings=settings, tool_provider=tool_provider)
        result = pipeline.run(user_id=str(user_id), scenario=scenario, run_id=run_id)
        tool_provider.update_run(
            {
                "run_id": run_id,
                "status": "completed",
                "risk_level": result["risk_assessment"]["risk_level"],
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    except Exception as exc:
        logger.exception("Coordinator run failed for run_id=%s user_id=%s", run_id, user_id)
        tool_provider.persist_audit(
            {
                "user_id": user_id,
                "action": "agent_failed",
                "entity_type": "agent_run",
                "entity_id": str(run_id),
                "metadata": {"error": f"{type(exc).__name__}: {exc}", "scenario": scenario},
            }
        )
        tool_provider.update_run(
            {
                "run_id": run_id,
                "status": "failed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        )

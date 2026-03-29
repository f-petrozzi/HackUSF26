from __future__ import annotations

from dataclasses import dataclass
import importlib
from pathlib import Path
import sys
from typing import Any, Callable, Dict, List, Optional

try:
    from services.agents.config import REPO_ROOT
    from services.agents.dev_stubs import (
        get_recent_signals_stub,
        get_resources_stub,
        get_user_profile_stub,
    )
except ImportError:
    from config import REPO_ROOT
    from dev_stubs import get_recent_signals_stub, get_resources_stub, get_user_profile_stub


if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


def _load_callable(module_name: str, attr_name: str) -> Optional[Callable[..., Any]]:
    try:
        module = importlib.import_module(module_name)
        return getattr(module, attr_name)
    except Exception:
        return None


@dataclass
class ToolProvider:
    use_stubs: bool = True
    api_base_url: str = "http://localhost:8000"
    auth_header: str = ""

    def get_user_profile(self, persona_type: str = "student") -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.get_user_profile_tool", "get_user_profile")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header)
        return get_user_profile_stub(persona_type=persona_type)

    def get_recent_signals(self, scenario: str = "stressed_student") -> List[Dict[str, Any]]:
        if not self.use_stubs:
            func = _load_callable("services.tools.get_recent_signals_tool", "get_recent_signals")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header)
        return get_recent_signals_stub(scenario=scenario)

    def get_resources(self, persona: str) -> List[Dict[str, Any]]:
        if not self.use_stubs:
            func = _load_callable("services.tools.get_resources_tool", "get_resources")
            if func:
                return func(
                    persona=persona,
                    api_base_url=self.api_base_url,
                    auth_header=self.auth_header,
                )
        return get_resources_stub(persona)

    def create_case(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.create_case_tool", "create_case")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header, **payload)
        return {"id": 1, **payload, "status": "open"}

    def create_intervention(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.create_intervention_tool", "create_intervention")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header, **payload)
        return {"id": 1, **payload}

    def send_notification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.send_notification_tool", "send_notification")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header, **payload)
        return {"id": 1, **payload, "status": "queued"}

    def persist_audit(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.persist_audit_tool", "persist_audit")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header, **payload)
        return {"id": 1, **payload}

    def persist_run_message(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.persist_run_message_tool", "persist_run_message")
            if func:
                return func(api_base_url=self.api_base_url, auth_header=self.auth_header, **payload)
        return {"id": payload.get("run_id", 0), **payload}

    def update_run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_stubs:
            func = _load_callable("services.tools.update_run_tool", "update_run")
            if func:
                run_id = payload.pop("run_id")
                return func(
                    run_id=run_id,
                    api_base_url=self.api_base_url,
                    auth_header=self.auth_header,
                    **payload,
                )
        return {"id": payload.get("run_id", 0), **payload}

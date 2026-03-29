from __future__ import annotations

from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from services.agents.config import Settings
from services.agents.coordinator.agent import CareCoordinatorPipeline
from services.agents.tooling import ToolProvider
from services.agents.validation_loop.agent import ValidationLoopAgent


def _full_plan() -> dict:
    return {
        "meal_suggestion": {
            "title": "Supportive Meal",
            "description": "A balanced meal.",
            "rationale": "Stable energy.",
        },
        "activity_suggestion": {
            "title": "Gentle Reset",
            "description": "Take a short walk.",
            "duration_minutes": 15,
            "intensity": "low",
            "rationale": "Manageable movement.",
        },
        "wellness_action": {
            "title": "Check-In",
            "description": "Pause for breathing.",
            "rationale": "Reduce stress.",
        },
        "generation_mode": "llm",
        "generation_error": "",
        "resources": ["Campus counseling"],
        "notes": "Initial notes.",
        "meal_constraints": ["high_protein"],
    }


def test_validation_loop_merges_partial_revised_plan_and_preserves_it_on_approval(monkeypatch):
    agent = ValidationLoopAgent()
    responses = iter(
        [
            {
                "approved": False,
                "issues": [
                    {
                        "type": "accessibility_mismatch",
                        "description": "Trim effort.",
                        "suggested_fix": "Reduce duration.",
                    }
                ],
                "revised_plan": {
                    "activity_suggestion": {"duration_minutes": 5},
                    "notes": "Validation updated the plan.",
                },
                "halt": False,
            },
            {
                "approved": True,
                "issues": [],
                "revised_plan": None,
                "halt": False,
            },
        ]
    )
    monkeypatch.setattr(agent, "_generate_with_llm", lambda **_kwargs: next(responses))

    result, iterations = agent.validate(
        findings=[],
        risk_level="moderate",
        intervention_plan=_full_plan(),
        empathy_message="You can do this.",
        user_profile={"accessibility": None},
    )

    assert result["approved"] is True
    assert result["revised_plan"]["meal_suggestion"]["description"] == "A balanced meal."
    assert result["revised_plan"]["activity_suggestion"]["duration_minutes"] == 5
    assert result["revised_plan"]["activity_suggestion"]["description"] == "Take a short walk."
    assert result["revised_plan"]["notes"] == "Validation updated the plan."
    assert iterations[0]["output"]["revised_plan"]["wellness_action"]["description"] == "Pause for breathing."


def test_coordinator_run_handles_partial_validation_patch_without_crashing(monkeypatch):
    pipeline = CareCoordinatorPipeline(Settings(), ToolProvider(use_stubs=True))

    monkeypatch.setattr(
        pipeline.tool_provider,
        "get_user_profile",
        lambda persona_type="student": {
            "user_id": 12,
            "goal": "stress_reduction",
            "dietary_style": "balanced",
            "allergies": [],
            "persona_type": "student",
            "accessibility": None,
        },
    )
    monkeypatch.setattr(
        pipeline.tool_provider,
        "get_recent_signals",
        lambda scenario="stressed_student": [
            {"signal_type": "stress_level", "value": 8},
            {"signal_type": "sleep_hours", "value": 5.5},
        ],
    )
    monkeypatch.setattr(
        pipeline.tool_provider,
        "get_resources",
        lambda persona: [{"title": "Campus counseling"}],
    )
    monkeypatch.setattr(
        pipeline.signal_agent,
        "run",
        lambda **_kwargs: {
            "findings": [{"type": "stress", "severity": "high", "confidence": 0.9, "evidence": "check-in"}],
            "summary": "High stress day.",
            "generation_mode": "llm",
            "generation_error": "",
        },
    )
    monkeypatch.setattr(
        pipeline.risk_agent,
        "run",
        lambda **_kwargs: {
            "risk_level": "moderate",
            "urgency": "today",
            "escalation_needed": False,
            "coordinator_review": False,
            "confidence": 0.8,
            "rationale": "Elevated stress.",
            "generation_mode": "llm",
            "generation_error": "",
        },
    )
    monkeypatch.setattr(pipeline.intervention_agent, "run", lambda **_kwargs: _full_plan())
    monkeypatch.setattr(
        pipeline,
        "_run_specialist",
        lambda **_kwargs: {
            "enriched_context": "",
            "resources": [],
            "intervention_adjustments": [],
            "generation_mode": "llm",
            "generation_error": "",
        },
    )
    monkeypatch.setattr(
        pipeline.empathy_agent,
        "run",
        lambda **_kwargs: {
            "empathy_message": "Take it one step at a time.",
            "generation_mode": "llm",
            "generation_error": "",
        },
    )
    monkeypatch.setattr(
        pipeline.validation_loop,
        "validate",
        lambda **_kwargs: (
            {
                "approved": True,
                "issues": [],
                "revised_plan": {
                    "notes": "Validation updated the plan.",
                    "activity_suggestion": {"duration_minutes": 5},
                },
                "halt": False,
                "generation_mode": "llm",
                "generation_error": "",
            },
            [],
        ),
    )

    result = pipeline.run(user_id="12", scenario="stressed_student", run_id=9)

    assert result["final_plan"]["meal_suggestion"] == "A balanced meal."
    assert result["final_plan"]["activity_suggestion"] == "Take a short walk."
    assert result["final_plan"]["notes"] == "Validation updated the plan."
    assert result["intervention_record"]["meal_suggestion"] == "A balanced meal."

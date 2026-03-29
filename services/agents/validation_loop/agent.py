from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, List, Tuple

try:
    from services.agents.adk_compat import LlmAgent, LoopAgent
    from services.agents.llm_utils import GeminiJsonClient, build_json_prompt
    from services.agents.prompts import VALIDATION_LOOP_PROMPT
    from services.agents.schemas import ValidationResult
except ImportError:
    from adk_compat import LlmAgent, LoopAgent
    from llm_utils import GeminiJsonClient, build_json_prompt
    from prompts import VALIDATION_LOOP_PROMPT
    from schemas import ValidationResult


class ValidationLoopAgent:
    def __init__(self) -> None:
        self.validator = LlmAgent(name="ValidationAgent", instruction=VALIDATION_LOOP_PROMPT)
        self.definition = LoopAgent(
            name="ValidationLoop",
            sub_agent=self.validator,
            max_iterations=3,
        )
        self._llm = GeminiJsonClient()

    def validate(
        self,
        *,
        findings: List[Dict[str, Any]],
        risk_level: str,
        intervention_plan: Dict[str, Any],
        empathy_message: str,
        user_profile: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        current_plan = deepcopy(intervention_plan)
        iterations: List[Dict[str, Any]] = []
        low_energy_mode = user_profile.get("accessibility", {}).get("low_energy_mode", False)

        for iteration in range(1, 4):
            llm_result = self._generate_with_llm(
                findings=findings,
                risk_level=risk_level,
                intervention_plan=current_plan,
                empathy_message=empathy_message,
                user_profile=user_profile,
                low_energy_mode=low_energy_mode,
            )
            if llm_result and "approved" in llm_result:
                result = llm_result
            else:
                result = self._fallback_validate(
                    current_plan=current_plan,
                    risk_level=risk_level,
                    low_energy_mode=low_energy_mode,
                    iteration=iteration,
                    generation_error=(llm_result or {}).get("generation_error", ""),
                )
            iterations.append(
                {
                    "iteration": iteration,
                    "input": {
                        "findings": findings,
                        "risk_level": risk_level,
                        "intervention_plan": current_plan,
                        "empathy_message": empathy_message,
                    },
                    "output": result,
                }
            )
            if result["approved"] or result["halt"]:
                return result, iterations
            if result.get("revised_plan"):
                current_plan = deepcopy(result["revised_plan"])

        return result, iterations

    def _generate_with_llm(
        self,
        *,
        findings: List[Dict[str, Any]],
        risk_level: str,
        intervention_plan: Dict[str, Any],
        empathy_message: str,
        user_profile: Dict[str, Any],
        low_energy_mode: bool,
    ) -> Dict[str, Any] | None:
        prompt = build_json_prompt(
            instruction=VALIDATION_LOOP_PROMPT,
            response_schema={
                "approved": True,
                "issues": [
                    {
                        "type": "contradiction | accessibility_mismatch | policy_violation | low_confidence | missing_evidence",
                        "description": "issue description",
                        "suggested_fix": "how to fix",
                    }
                ],
                "revised_plan": {"notes": "optional revised plan object"} ,
                "halt": False,
            },
            payload={
                "findings": findings,
                "risk_level": risk_level,
                "intervention_plan": intervention_plan,
                "empathy_message": empathy_message,
                "user_profile": user_profile,
                "low_energy_mode": low_energy_mode,
            },
        )
        result = self._llm.generate_json(prompt)
        if not result.payload:
            return {"generation_error": result.error}

        try:
            issues = [
                {
                    "type": str(issue.get("type", "")).strip(),
                    "description": str(issue.get("description", "")).strip(),
                    "suggested_fix": str(issue.get("suggested_fix", "")).strip(),
                }
                for issue in result.payload.get("issues", [])
                if str(issue.get("type", "")).strip()
            ]
            revised_plan = result.payload.get("revised_plan")
            if revised_plan is not None and not isinstance(revised_plan, dict):
                raise ValueError("revised_plan must be an object or null.")

            return ValidationResult(
                approved=bool(result.payload.get("approved", False)),
                issues=issues,
                revised_plan=revised_plan,
                halt=bool(result.payload.get("halt", False)),
                generation_mode="llm",
                generation_error="",
            ).model_dump()
        except Exception as exc:
            return {"generation_error": f"{type(exc).__name__}: {exc}"}

    def _fallback_validate(
        self,
        *,
        current_plan: Dict[str, Any],
        risk_level: str,
        low_energy_mode: bool,
        iteration: int,
        generation_error: str,
    ) -> Dict[str, Any]:
        issues = []
        activity = current_plan["activity_suggestion"]
        if risk_level in {"high", "critical"} and activity["intensity"] not in {"very_low", "low"}:
            issues.append(
                {
                    "type": "contradiction",
                    "description": "Activity intensity is too high for the current strain level.",
                    "suggested_fix": "Lower the activity intensity and shorten the duration.",
                }
            )
        if low_energy_mode and activity["duration_minutes"] > 15:
            issues.append(
                {
                    "type": "accessibility_mismatch",
                    "description": "Plan exceeds low-energy preference.",
                    "suggested_fix": "Reduce duration to 10-15 minutes and simplify instructions.",
                }
            )

        approved = not issues
        halt = bool(iteration == 3 and issues)
        revised_plan = None
        if issues and not halt:
            current_plan["activity_suggestion"]["intensity"] = "low"
            current_plan["activity_suggestion"]["duration_minutes"] = min(
                current_plan["activity_suggestion"]["duration_minutes"], 10
            )
            current_plan["notes"] = (
                current_plan.get("notes", "") + " Validation reduced effort for safety."
            ).strip()
            revised_plan = deepcopy(current_plan)

        return ValidationResult(
            approved=approved,
            issues=issues,
            revised_plan=revised_plan,
            halt=halt,
            generation_mode="fallback",
            generation_error=generation_error,
        ).model_dump()

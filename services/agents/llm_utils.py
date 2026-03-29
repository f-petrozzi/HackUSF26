from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional


DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"


@dataclass
class LlmResult:
    payload: Optional[Dict[str, Any]]
    error: str = ""


class GeminiJsonClient:
    def __init__(self, model_name: Optional[str] = None) -> None:
        self.model_name = model_name or os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)

    def generate_json(self, prompt: str) -> LlmResult:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return LlmResult(payload=None, error="GEMINI_API_KEY is not set.")

        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return LlmResult(payload=self._extract_json(getattr(response, "text", "")))
        except Exception as genai_exc:
            try:
                import google.generativeai as legacy_genai

                legacy_genai.configure(api_key=api_key)
                model = legacy_genai.GenerativeModel(self.model_name)
                response = model.generate_content(prompt)
                return LlmResult(payload=self._extract_json(getattr(response, "text", "")))
            except Exception as legacy_exc:
                return LlmResult(
                    payload=None,
                    error=(
                        f"google.genai: {type(genai_exc).__name__}: {genai_exc}; "
                        f"google.generativeai: {type(legacy_exc).__name__}: {legacy_exc}"
                    ),
                )

    @staticmethod
    def _extract_json(text: str) -> Dict[str, Any]:
        candidate = text.strip()
        if candidate.startswith("```"):
            lines = candidate.splitlines()
            if len(lines) >= 3:
                candidate = "\n".join(lines[1:-1]).strip()
        start = candidate.find("{")
        end = candidate.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise ValueError("No JSON object found in model response.")
        return json.loads(candidate[start : end + 1])


def build_json_prompt(*, instruction: str, response_schema: Dict[str, Any], payload: Dict[str, Any]) -> str:
    return (
        f"{instruction}\n\n"
        "Return only valid JSON with no markdown fences.\n"
        f"Response schema:\n{json.dumps(response_schema, indent=2)}\n\n"
        f"Input:\n{json.dumps(payload, indent=2)}"
    )

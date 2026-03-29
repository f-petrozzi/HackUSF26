from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


ROOT_DIR = Path(__file__).resolve().parent
REPO_ROOT = ROOT_DIR.parent.parent
ENV_PATH = ROOT_DIR / ".env"


def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = ""
    api_base_url: str = "http://localhost:8000"
    student_specialist_url: str = "http://localhost:8001"
    caregiver_specialist_url: str = "http://localhost:8002"


def load_settings() -> Settings:
    _load_dotenv(ENV_PATH)
    return Settings(
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        api_base_url=os.getenv("API_BASE_URL", "http://localhost:8000"),
        student_specialist_url=os.getenv(
            "STUDENT_SPECIALIST_URL", "http://localhost:8001"
        ),
        caregiver_specialist_url=os.getenv(
            "CAREGIVER_SPECIALIST_URL", "http://localhost:8002"
        ),
    )

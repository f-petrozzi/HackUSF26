# CareMesh

A multi-agent care coordination platform that turns wearable signals and behavioral patterns into adaptive, empathetic, actionable support — built on Google ADK for HackUSF 2026.

---

## What it does

CareMesh monitors your health signals (sleep, stress, steps, mood) and runs a team of AI agents in parallel to produce a personalized support plan. Based on your persona — stressed student, exhausted caregiver, older adult — it routes to the right specialist, validates the plan, and delivers empathy-first recommendations with a full traceable audit trail.

**Competing in:** Google Cloud Challenge (ADK/A2A multi-agent) + Oracle Challenge (Technology in Service of Humanity)

---

## Repo structure

```
apps/
  api/              ← FastAPI backend (Fab)
  web/              ← Next.js frontend (Person 4)
services/
  agents/           ← Google ADK local agent pipeline (Person 2)
  tools/            ← ADK tool layer — HTTP wrappers for the API (Person 3)
  remote_specialists/ ← A2A specialist servers (Person 3)
packages/
  shared-types/     ← Pydantic v2 models shared across all services
infra/
  seed/             ← Database seed script
scripts/
  garmin_bootstrap.py ← One-time Garmin OAuth setup
docs/
  api-contracts.md  ← All endpoint shapes — read this before building
  setup/            ← Per-person setup guides
    backend.md
    agents.md
    specialists.md
    frontend.md
```

---

## Quick start (local)

**Prerequisites:** Docker, Python 3.11+, Node 18+

```bash
# 1. Clone and copy env
git clone https://github.com/f-petrozzi/HackUSF26.git
cd HackUSF26
cp .env.example apps/api/.env
# Fill in GEMINI_API_KEY and JWT_SECRET in apps/api/.env

# 2. Start PostgreSQL
docker compose up db -d

# 3. Start the API
cd apps/api
pip install -r requirements.txt
alembic upgrade head
python ../../infra/seed/seed.py
uvicorn main:app --reload --port 8000

# 4. Verify
curl http://localhost:8000/health
# → {"status": "ok", "service": "caremesh-api"}
```

API docs available at `http://localhost:8000/docs` once running.

**Demo users (created by seed):**
| Email | Password | Role |
|---|---|---|
| student@caremesh.demo | demo1234 | member |
| caregiver@caremesh.demo | demo1234 | member |
| admin@caremesh.demo | admin1234 | admin |

---

## For each team member

---

### Fab — Backend, Garmin, Recipes (`apps/api/`)

**Status: done — merge `feat/backend` → `main` first.**

Everything in `apps/api/` is built and ready:
- All 17 DB tables + Alembic migration
- Full FastAPI router coverage (auth, profile, events, cases, interventions, health, recipes, scenarios, audit)
- Garmin OAuth sync engine
- Recipe URL + text parsing (Gemini)
- Seed script, Docker, shared types

**Your remaining tasks:**
1. Push `feat/backend` → `main` so everyone else can branch off it
2. Share `API_BASE_URL=http://localhost:8000` with the team
3. Wire `POST /api/runs/trigger` to actually call the ADK coordinator once Person 2 merges (the run record is created now; the agent invocation is Person 2's job)

**Setup guide:** `docs/setup/backend.md`

---

### Person 2 — Google ADK Local Agents (`services/agents/`)

**Branch off `main` after Fab merges. Work in `services/agents/`.**

**What you're building:**
- `coordinator/` — SequentialAgent root that orchestrates the full pipeline
- `signal_interpretation/` — LlmAgent analyzing signals → structured findings
- `risk_stratification/` — LlmAgent → risk level (low/moderate/high/critical) + confidence
- `intervention_planning/` — LlmAgent → meal, activity, wellness action
- `empathy_checkin/` — LlmAgent → supportive user-facing language
- `validation_loop/` — LoopAgent (max 3 iterations) checking for contradictions

**Architecture rules (non-negotiable for judging):**
- `ParallelAgent` must wrap signal_interpretation, risk_stratification, and intervention_planning — not sequential calls
- `LoopAgent` must be a real ADK LoopAgent — not a Python `for` loop
- `RemoteA2aAgent` must be used for specialist calls — not direct imports
- No agent imports SQLAlchemy — all DB access goes through tool calls (Person 3's layer)

**How to start without the backend running:**
Use stubs — create `services/agents/dev_stubs.py` with hardcoded fixtures. See `docs/setup/agents.md` for the exact stub pattern. Swap for real tools at integration.

**Data shapes:** See `packages/shared-types/models.py` and `docs/api-contracts.md`
**Agent prompts:** See `docs/prompts.md`
**Setup guide:** `docs/setup/agents.md`

**Merge order:** after Fab and Person 3 have merged.

---

### Person 3 — Tool Layer + A2A Specialists (`services/tools/`, `services/remote_specialists/`)

**Branch off `main` after Fab merges. Work in `services/tools/` and `services/remote_specialists/`.**

**What you're building:**

**Tool layer** (`services/tools/`) — Python functions exposed as ADK `FunctionTool` objects. Each tool makes one HTTP call to the FastAPI backend. These are what the local agents use to read/write all data.

| Tool file | API endpoint it calls |
|---|---|
| `get_user_profile_tool.py` | `GET /api/profile` |
| `get_recent_signals_tool.py` | `GET /api/events/recent` |
| `create_case_tool.py` | `POST /api/cases` |
| `create_intervention_tool.py` | `POST /api/interventions` |
| `send_notification_tool.py` | `POST /api/notifications` |
| `get_resources_tool.py` | `GET /api/resources?persona=...` |
| `persist_audit_tool.py` | `POST /api/audit-logs` |

All shapes are in `docs/api-contracts.md`. Every tool must: accept typed params, call the API via `httpx`, retry once on connection error, be wrapped as `FunctionTool(your_function)`.

**A2A specialists** (`services/remote_specialists/`):
- `student_support/` — LlmAgent for academic stress + campus resources, exposed on port 8001
- `caregiver_burnout/` — LlmAgent for caregiver burden + respite routing, exposed on port 8002

Each specialist needs an `agent_card.json` so the coordinator can discover it.

```bash
# Run specialists
cd services/remote_specialists/student_support
adk api_server --a2a --port 8001

cd services/remote_specialists/caregiver_burnout
adk api_server --a2a --port 8002
```

**How to start without the backend running:**
Return hardcoded fixture responses in tools while developing. Wrap API calls in try/except with fallback data.

**System prompts:** See `docs/prompts.md` → "Student Support Specialist" and "Caregiver Burnout Specialist"
**Setup guide:** `docs/setup/specialists.md`

**Merge order:** after Fab, before Person 2.

---

### Person 4 — Frontend (`apps/web/`)

**Branch off `main` after Fab merges. Work in `apps/web/`.**

**What you're building (Next.js + React Query + Tailwind):**

| Screen | Priority | Notes |
|---|---|---|
| Login / Register | P0 | JWT stored in localStorage or cookie |
| Onboarding form | P0 | Single page → redirects to dashboard on submit |
| Member dashboard | P0 | Signal summary, support plan (meal/activity/wellness cards), empathy message, risk badge |
| Scenario runner | P0 | Dropdown, trigger button, live polling → auto-redirect to trace |
| Trace view | P0 | Agent run messages — **parallel, A2A, loop visually distinct** — this is 20% of Google judging score |
| Care coordinator dashboard | P0 | Open cases table with persona type, risk level, status |
| Health dashboard | P1 | Overview cards (steps, sleep, HR, stress), sleep history, activity feed |
| Recipe list + detail | P1 | Search, tag chips, grouped ingredients, grouped instructions |
| Recipe import form | P1 | URL tab + paste text tab, review-before-save step |
| Manual check-in form | P1 | Mood, sleep hours, stress, note → triggers agent run |

**How to start without the backend running:**
Use MSW (Mock Service Worker) to mock API responses against the shapes in `docs/api-contracts.md`. All response shapes are documented there.

```bash
cd apps/web
npx create-next-app . --typescript --tailwind --app
npm install @tanstack/react-query msw axios
```

**Setup guide:** `docs/setup/frontend.md`

**Merge order:** last — after everyone else.

---

## Merge order

```
1. feat/backend  → main   (Fab — already done)
2. feat/specialists → main (Person 3 — tools + A2A servers)
3. feat/agents   → main   (Person 2 — ADK pipeline, needs real tools)
4. feat/frontend → main   (Person 4 — UI, needs real API)
```

Before each merge: run your piece against the real API and confirm it works.

---

## Environment variables

Copy `.env.example` to `apps/api/.env` and fill in:

```
DATABASE_URL=postgresql+asyncpg://caremesh:caremesh@localhost:5432/caremesh
JWT_SECRET=<random string>
GEMINI_API_KEY=<from Google AI Studio — free tier works>
GARMIN_ENABLED=false       # set true only if bootstrapping a real Garmin account
```

Each service also has its own `.env` — see the relevant setup doc.

---

## Key docs

| Doc | Who needs it |
|---|---|
| `docs/api-contracts.md` | Everyone — all endpoint shapes and request/response bodies |
| `docs/prompts.md` | Person 2 + 3 — system prompts for each agent |
| `docs/technical-requirements.md` | Everyone — full feature requirements and DB schema |
| `docs/setup/backend.md` | Fab |
| `docs/setup/agents.md` | Person 2 |
| `docs/setup/specialists.md` | Person 3 |
| `docs/setup/frontend.md` | Person 4 |
| `packages/shared-types/models.py` | Person 2 + 3 — Pydantic models for typed agent I/O |

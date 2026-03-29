# Tech Stack — CareMesh

All choices are optimized for hackathon velocity: well-documented, AI-friendly, and parallelizable across 4 Codex instances.

---

## Frontend

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, RSC for coordinator/trace dashboards |
| Language | TypeScript | Strong typing for agent message shapes |
| Styling | Tailwind CSS | Fast, no design system setup needed |
| Components | shadcn/ui | Pre-built accessible components, copy-paste friendly |
| State | React Query (TanStack Query) | Polling for run status on scenario runner |
| Charts | Recharts | Signal trend display on member dashboard |

---

## Backend

| Layer | Choice | Notes |
|---|---|---|
| Framework | FastAPI (Python 3.11+) | Async, Pydantic-native, fast to write |
| ORM | SQLAlchemy 2.0 (async) | Works with both SQLite and PostgreSQL |
| Schema validation | Pydantic v2 | Shared with ADK agent I/O schemas |
| Migrations | Alembic | Simple one-command migrations |
| Auth | Clerk + PyJWT verification | Clerk-hosted sign-in with backend session token verification |
| Database | PostgreSQL (default) / SQLite (local fallback) | PostgreSQL preferred; SQLite acceptable for demo day |

---

## Agent Framework

| Layer | Choice | Notes |
|---|---|---|
| Agent SDK | Google ADK for Python | Required for Google challenge alignment |
| LLM | Gemini 2.0 Flash | Via ADK's LiteLLM or Vertex AI integration |
| Local agents | ADK `Agent`, `ParallelAgent`, `LoopAgent` | Real ADK primitives — no custom orchestration |
| Remote specialists | ADK A2A protocol (`adk api_server --a2a`) | Student Support + Caregiver Burnout specialists exposed as A2A servers |
| A2A client | `RemoteA2aAgent` (ADK) | Coordinator discovers and invokes remote specialists |
| Tool pattern | ADK `FunctionTool` wrapping FastAPI service calls | Agents never touch the DB directly |

---

## Infrastructure

| Layer | Choice | Notes |
|---|---|---|
| Local dev | Docker Compose | One `docker compose up` starts everything |
| Services in Compose | `api` (FastAPI), `web` (Next.js), `db` (PostgreSQL), `specialist-student` (A2A server), `specialist-caregiver` (A2A server) | |
| Environment | Doppler or `.env` with Clerk, Gemini, and DB settings | |
| Cloud target | Google Cloud Run (deployment-ready structure) | Not required for hackathon demo but directory structure should support it |

---

## Observability

| Layer | Choice | Notes |
|---|---|---|
| Logging | `structlog` (Python) | JSON-formatted structured logs |
| Agent tracing | `agent_runs` + `agent_messages` tables | Custom trace persistence in PostgreSQL |
| Trace UI | Custom Next.js trace dashboard | Shows parallel branches, loop iterations, A2A calls |

---

## Not in this stack (and why)

| What | Why not |
|---|---|
| Redis / Celery | Agent runs are synchronous for MVP; no background queue needed |
| LangChain / LangGraph | ADK is the framework; mixing orchestration layers creates confusion |
| Pinecone / pgvector | No semantic search in MVP; plain SQL is sufficient |
| NextAuth / Auth0 | Clerk is already the chosen auth provider for the product |
| Prisma | SQLAlchemy is already in Python backend; no need for a second ORM |

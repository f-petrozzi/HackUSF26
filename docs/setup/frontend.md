# Setup — Frontend

Current frontend location: `frontend/`

The active app is the Vite + React frontend under `frontend/`. The older `apps/web/` references are architectural placeholders, not the current implementation target.

---

## What is wired now

- Vite + React + TypeScript
- React Router
- Tailwind + shadcn/ui
- React Query data layer
- Clerk auth in the frontend when the publishable key is present
- Local auth fallback when Clerk is not configured
- Mock API mode and live API mode

---

## Secrets and env

Use Doppler in normal development so secrets are injected at runtime:

```bash
cd frontend
doppler run -- npm run dev
```

Required frontend secret:

```bash
VITE_CLERK_PUBLISHABLE_KEY=<your Clerk publishable key>
```

Optional frontend vars:

```bash
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=true
```

If you need local env files temporarily, copy `frontend/.env.example` to `frontend/.env.local`.

---

## Running locally

```bash
cd frontend
npm install
doppler run -- npm run dev
```

The Vite dev server runs on `http://localhost:8080`.

---

## Auth behavior

- If `VITE_CLERK_PUBLISHABLE_KEY` is set, login and registration use Clerk components.
- Onboarding completion is written into Clerk `unsafeMetadata`.
- If Clerk is not configured, the app falls back to the legacy local auth flow.

Live API mode with Clerk now requires matching backend secrets:

```bash
CLERK_JWT_KEY=
CLERK_FRONTEND_API_URL=
CLERK_AUTHORIZED_PARTIES=http://localhost:8080
CLERK_SECRET_KEY=
```

Notes:

- `CLERK_SECRET_KEY` is needed for first-time local user provisioning unless your Clerk session token includes an email claim.
- Mock API mode still works independently of backend auth and remains the easiest UI-development path.

---

## Frontend architecture rules

- `src/lib/api.ts`
  Single API boundary. No page should call `fetch` or `axios` directly.
- `src/lib/api-contracts.ts`
  Backend DTOs.
- `src/lib/types.ts`
  UI view models.
- `src/lib/api-mappers.ts`
  Translation between DTOs and UI models.
- `src/contexts/AuthContext.tsx`
  Auth abstraction layer across Clerk and local fallback auth.

---

## Validation

Use these before handing off frontend auth or route changes:

```bash
npm run typecheck
npm run test
npm run build
```

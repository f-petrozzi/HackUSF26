# CareMesh Frontend

This folder is the active CareMesh experience-layer implementation.

## Auth modes

The frontend now supports two auth paths:

- Clerk auth when `VITE_CLERK_PUBLISHABLE_KEY` is present
- Local fallback auth when Clerk is not configured

Clerk is the intended path going forward. The local fallback exists so the repo still runs before secrets are injected.

## Environment

Use Doppler in normal development:

```bash
doppler run -- npm run dev
```

If you need a local file, copy `.env.example` to `.env.local` and set:

```bash
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=true
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

## Current integration state

- Clerk is wired into the frontend shell, route guards, and onboarding state.
- Onboarding state is stored in Clerk user `unsafeMetadata`.
- API data can still run in mock mode independently of auth.
- The FastAPI backend now accepts Clerk session tokens when Clerk backend secrets are configured.
- First-time Clerk users are synced into the local `users` table automatically.
- For first-time user provisioning, either set `CLERK_SECRET_KEY` on the backend or add an email claim to the Clerk session token.

## Backend secrets

The frontend publishable key is not enough for full live mode. The backend should also receive:

```bash
CLERK_JWT_KEY=
CLERK_FRONTEND_API_URL=
CLERK_AUTHORIZED_PARTIES=http://localhost:8080
CLERK_SECRET_KEY=
```

`CLERK_SECRET_KEY` is used only when the backend needs to fetch a Clerk user's email during first-time provisioning.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
```

## Integration rule

Keep backend DTOs in `src/lib/api-contracts.ts`, UI models in `src/lib/types.ts`, and translation logic in `src/lib/api-mappers.ts`.

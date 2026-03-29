# CareMesh Frontend

This folder is the active CareMesh experience-layer implementation.

It is intentionally set up to support two modes:

- Mock mode for UI development and demos without backend dependencies
- Live mode for FastAPI integration through a single API facade

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
```

## Environment

Copy `.env.example` to `.env.local` or `.env` and set:

```bash
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=true
```

Set `VITE_USE_MOCK_API=false` when you want the app to call the FastAPI backend.

## Integration Rule

Keep backend DTOs in `src/lib/api-contracts.ts`, UI models in `src/lib/types.ts`, and translation logic in `src/lib/api-mappers.ts`.

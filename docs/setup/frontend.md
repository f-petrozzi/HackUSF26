# Setup — Frontend (Person 4)

You own: `apps/web/`
Your branch: `feat/frontend`

---

## What you're building

The full Next.js frontend. Every screen the user sees. You do not touch Python, agents, or the database.

Screens to build:
- Login / Register
- Onboarding (single-page form)
- Member dashboard (support plan, signals, empathy message)
- Health dashboard (Garmin data: steps, sleep, HR, stress, trends)
- Garmin connect UI
- Recipe list, recipe detail, recipe import (URL + paste)
- Care coordinator dashboard (open cases)
- Trace / admin dashboard (agent run detail with message tree)
- Scenario runner
- Manual check-in form

---

## Prerequisites

```bash
node 18+
npm or pnpm
```

---

## Environment variables you need

Create `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000    # Fab's backend
```

That's it. The frontend only talks to the API — no direct DB or agent access.

---

## Running locally without the backend

You don't need Fab's backend running to build UI. Use MSW (Mock Service Worker) to intercept API calls and return fixture data:

```bash
cd apps/web
npm install msw --save-dev
```

Create `src/mocks/handlers.ts` with mock responses matching the shapes in `docs/api-contracts.md`. This lets you build and test every screen without waiting for the backend.

When Fab's backend is ready, set `NEXT_PUBLIC_API_URL` to the real URL and remove the mock handlers.

---

## Running the app

```bash
cd apps/web
npm install
npm run dev
# opens at http://localhost:3000
```

---

## Key libraries

| Library | Purpose |
|---|---|
| `next` 14 (App Router) | Framework |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `shadcn/ui` | Pre-built accessible components |
| `@tanstack/react-query` | Data fetching, caching, polling |
| `recharts` | Health trend charts |
| `next-pwa` | PWA support (installable on phone) |
| `msw` | API mocking during development |

Install shadcn/ui components as needed: `npx shadcn-ui@latest add button card table badge`

---

## PWA setup

Add to `apps/web/public/manifest.json`:
```json
{
  "name": "CareMesh",
  "short_name": "CareMesh",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
```

Install `next-pwa` and configure in `next.config.js`. Test install on a real phone by visiting the deployed URL in Chrome or Safari.

---

## API contract

All API response shapes are in `docs/api-contracts.md`. Build your TypeScript types from those shapes. The `lib/api.ts` file should export one typed function per endpoint — no raw `fetch` calls scattered across components.

---

## Trace dashboard design notes

The trace view is important for the hackathon demo. Judges need to see the multi-agent system at a glance. Design it so:

- Parallel agents appear side-by-side, not stacked
- A2A calls have a distinct visual treatment (different color or icon)
- Loop iterations are numbered and collapsible
- Final action (intervention + case) is highlighted at the bottom

---

## Testing on your phone

While running `npm run dev`:
1. Find your laptop IP: `ipconfig` (Windows) or `ifconfig` / `ip addr` (Mac/Linux)
2. Open `http://YOUR_LAPTOP_IP:3000` in your phone's browser (same WiFi)
3. Test touch interactions, layout, and the "Add to Home Screen" PWA prompt

---

## Your branch workflow

```bash
git checkout main
git pull
git checkout -b feat/frontend

# work...

git add apps/web/
git commit -m "your message"
git push origin feat/frontend
```

You can merge anytime — frontend has no Python dependencies. Swap mock handlers for the real API URL once Fab's backend is running.

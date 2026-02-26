# Dashboard Wiring Environment

## Required Environment Variables

Set these in `arche_dev/.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key for the dashboard UI.
- `CLERK_SECRET_KEY` — Clerk server secret for Next.js middleware and server auth.
- `API_BASE_URL` — Base URL for `arche_api` (default: `http://localhost:8000`).

## Notes
- Tokens are never exposed to the browser. The dashboard uses Next.js Route Handlers (`/app/api/*`) as a BFF proxy.
- Clerk authentication is enforced for `/dashboard/*` and `/api/*` by `middleware.ts`.

# Arche Developer Portal

## Local Run
1. Install dependencies: `npm install`
2. Configure env vars (see below)
3. Start dev server: `npm run dev`

## Env Vars
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key.
- `AUTH_DISABLED_FOR_DEV`: `true` to bypass auth locally (default should be `false`).
- `NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV`: set to `true` only when using auth bypass in UI.
- `NEXT_PUBLIC_PORTAL_MOCK`: `true` enables deterministic local mock data + persistence.
- `NEXT_PUBLIC_PORTAL_ENV_TOGGLE`: `true` to show environment selector in top nav.

## Mock Mode
When `NEXT_PUBLIC_PORTAL_MOCK=true`:
- Data is served from deterministic fixtures in `lib/mock/fixtures.ts`.
- Mutations (project create, key create/revoke, webhook updates) persist in `localStorage`.
- Full API key/webhook secret values are returned only on creation/regeneration and never persisted for later display.

## Route Map
Public:
- `/login`

Authenticated:
- `/`
- `/onboarding`
- `/projects`
- `/projects/[projectId]`
- `/projects/[projectId]/api-keys`
- `/projects/[projectId]/usage`
- `/projects/[projectId]/webhooks`
- `/billing`
- `/settings`
- `/security`
- `/support`

## Deployment Notes
- Keep `AUTH_DISABLED_FOR_DEV=false` in deployed environments.
- Set `NEXT_PUBLIC_PORTAL_MOCK=false` to use live portal APIs.
- Live mode expects BFF endpoints under `/api/portal/*` to be available.

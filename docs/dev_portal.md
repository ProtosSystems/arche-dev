# Arche Developer Portal

## Local Run
1. `npm install`
2. Set env vars in `.env.local`
3. `npm run dev`

## Env Vars
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key.
- `AUTH_DISABLED_FOR_DEV`: `true` enables local auth bypass. Default `false`.
- `NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV`: set to `true` only when bypassing auth locally.
- `NEXT_PUBLIC_PORTAL_MOCK`: `true` enables deterministic mock mode.
- `API_BASE_URL`: backend base URL for existing BFF routes.

## Environment Model
- Global environment context: `sandbox` or `production`.
- Environment is selected in top nav and persisted in localStorage.
- Environment controls:
  - displayed API base URL (`https://sandbox.api.arche.fi` vs `https://api.arche.fi`)
  - API keys shown/managed
  - usage rows shown
  - webhook config + deliveries shown

## Mock Mode
When `NEXT_PUBLIC_PORTAL_MOCK=true`:
- Data is served from deterministic fixtures under `lib/mock/*`.
- Mutations persist in localStorage for realism.
- API key and webhook secrets are copy-once only.

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

## Verification
- `npm run lint`
- `npm run build`
- `npm run smoke:portal`

## Deployment Notes
- Keep `AUTH_DISABLED_FOR_DEV=false` in deployed environments.
- Keep `NEXT_PUBLIC_PORTAL_MOCK=false` in deployed environments.
- Live mode expects `/api/portal/*` BFF endpoints to be available.

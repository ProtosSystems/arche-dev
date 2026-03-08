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

## Canonical Auth Path (External Developers)
- Use `X-Api-Key` for API calls.
- Use `X-Request-ID` for request tracing.
- Do not use `Authorization: Bearer` as the quickstart path.

## Core Route Map
Public:
- `/login`

Authenticated core:
- `/`
- `/onboarding`
- `/keys`
- `/usage`
- `/billing`
- `/account`

Internal legacy/detail routes (not in core nav):
- `/projects`
- `/projects/[projectId]`
- `/projects/[projectId]/api-keys`
- `/projects/[projectId]/usage`

## Verification
- `npm run lint`
- `npm run build`
- `npm run smoke:portal`
- `npm run check:docs-contract`

## Deployment Notes
- Keep `AUTH_DISABLED_FOR_DEV=false` in deployed environments.
- Keep `NEXT_PUBLIC_PORTAL_MOCK=false` in deployed environments.

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
- `API_BASE_URL`: backend base URL for BFF routes.

## Canonical Access Model
- Paddle handles checkout and subscription portal actions.
- Arche API stores canonical customer/org entitlements and API-key lifecycle state.
- Portal authorization decisions come from Arche API control-plane responses (`/v1/account/entitlements` via `/api/self-serve/access`).
- Data-plane auth remains API key based (`X-Api-Key`) and does not depend on live Paddle checks.

## Canonical Auth Path (External Developers)
- Use `X-Api-Key` for API calls.
- Use `X-Request-ID` for request tracing.
- Do not use `Authorization: Bearer` as the quickstart path.

## Debugging Affordances
- Portal error states surface `Request ID` when available from API/BFF failures.
- Troubleshooting link: `https://docs.arche.fi/troubleshooting/request-ids`
- Billing/entitlements no longer silently fall back to synthetic success payloads.

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

Internal:
- `/internal/dev-metrics` (admin only)
- `/internal/webhooks/paddle` (Paddle ingress)

## Verification
- `npm run lint`
- `npm run build`
- `npm run smoke:portal`
- `npm run check:docs-contract`
- `npm run check:self-serve-flow`
- `npm run test:dev-flow`

## Deployment Notes
- Keep `AUTH_DISABLED_FOR_DEV=false` in deployed environments.
- Keep `NEXT_PUBLIC_PORTAL_MOCK=false` in deployed environments.

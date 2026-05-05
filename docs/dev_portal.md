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
- Portal users authenticate with Clerk only.
- Paddle webhooks are public on `/internal/webhooks/paddle`, validated by Paddle signature headers, and relayed server-to-server without Clerk.
- Multi-org users must select an org context before authenticated portal BFF routes can proceed.
- Sandbox and production are explicit portal environments; the portal always forwards the selected environment instead of relying on backend sandbox defaults.
- Data-plane auth remains API key based (`X-Api-Key`) and does not depend on live Paddle checks.
- Integration reference: [integration_model.md](./integration_model.md)

## Canonical Auth Path (External Developers)
- Use `X-Api-Key` for API calls.
- Use `X-Request-ID` for request tracing.
- Do not use `Authorization: Bearer` as the quickstart path.

## Debugging Affordances
- Portal error states surface `Request ID` when available from API/BFF failures.
- Overview integration health is sourced from backend `GET /v1/account/integration-health` via `/api/integration-health`.
- Live runtime rate-limit state is sourced from backend `GET /v1/account/rate-limit-state` via `/api/rate-limit-state`.
- First successful API call, latest request timestamp/endpoint/status/request ID, and recent 4xx/5xx entries come from durable backend request activity rows.
- Runtime tier, remaining requests, reset time, and backend (`memory` or `redis`) come from the active limiter implementation rather than inferred usage aggregates.
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
- `npm run test:integration-contracts`

## Deployment Notes
- Keep `AUTH_DISABLED_FOR_DEV=false` in deployed environments.
- Keep `NEXT_PUBLIC_PORTAL_MOCK=false` in deployed environments.

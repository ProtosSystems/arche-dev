# Dashboard Wiring Discovery

Date: 2026-02-10
Branch: dashboard-wiring

## arche_api Control-Plane Endpoints

### Usage (found)
- `GET /v1/protected/usage/summary`
  - Router: `arche_api/src/arche_api/adapters/routers/protected_router.py`
  - Auth scope: `usage:read` (via `get_principal(required_scopes=("usage:read",), mode="required")`)
  - Org scoping: `principal.org_id` required; 403 if missing; passed to controller `get_summary`.
  - Request: query params from `UsageQuery`: `window` (24h|7d|30d), `group_by_class` (bool), `project_id`, `environment_id`, `api_key_id` (UUIDs).
  - Response envelope: `SuccessEnvelope[UsageSummaryHTTP]`.

- `GET /v1/protected/usage/timeseries`
  - Router: `arche_api/src/arche_api/adapters/routers/protected_router.py`
  - Auth scope: `usage:read`
  - Org scoping: `principal.org_id` required; 403 if missing; passed to controller `get_timeseries`.
  - Request: same `UsageQuery` as above.
  - Response envelope: `SuccessEnvelope[UsageTimeseriesHTTP]`.

- `GET /v1/protected/usage/by-endpoint`
  - Router: `arche_api/src/arche_api/adapters/routers/protected_router.py`
  - Auth scope: `usage:read`
  - Org scoping: `principal.org_id` required; 403 if missing; passed to controller `get_by_endpoint`.
  - Request: same `UsageQuery` as above.
  - Response envelope: `SuccessEnvelope[UsageByEndpointHTTP]`.

### API Keys (missing)
No HTTP endpoints found for API key create/list/revoke in `arche_api/src/arche_api/adapters/routers` or the API router aggregator.

### Orgs / Projects / Environments (missing)
No HTTP endpoints found for organization, project, or environment CRUD/list in `arche_api/src/arche_api/adapters/routers` or the API router aggregator.

### Team / Members (missing)
No HTTP endpoints found for membership list/add/remove in `arche_api/src/arche_api/adapters/routers` or the API router aggregator.

### Entitlements (missing)
No HTTP endpoints found for entitlements read in `arche_api/src/arche_api/adapters/routers` or the API router aggregator.

## arche_dev App

- Next.js App Router: present (`arche_dev/app` with `layout.tsx`).
- Catalyst shell: present (`arche_dev/app/dashboard/layout.tsx` uses `AppShell`).
- Clerk installed: not present (no Clerk packages in `arche_dev/package.json`, no Clerk usage in code).

## Overview Signals (2026-02-27)

- `app/(portal)/page.tsx` now assembles a customer-safe Overview from BFF endpoints in parallel:
  - `GET /api/usage/summary?window=24h|7d`
  - `GET /api/usage/timeseries?window=24h|7d`
  - `GET /api/usage/by-endpoint?window=24h|7d`
  - `GET /api/keys?env_id=<uuid>`
  - `GET /api/entitlements`
  - `GET /api/billing/subscription`
- Header forwarding was updated in `lib/arche-api.server.ts` to pass `X-Env-Id` to backend requests. The Overview frontend includes `x-env-id` on env-sensitive BFF calls after resolving the selected project environment UUID.
- Overview KPI intent:
  - Is it working? `Requests`, `Error rate`, chart trend.
  - Am I rate-limited/erroring? `Rate-limited` KPI + endpoint table.
  - What next? contextual CTA (`Create API key` vs `View docs`) + quick actions + onboarding checklist for new users.

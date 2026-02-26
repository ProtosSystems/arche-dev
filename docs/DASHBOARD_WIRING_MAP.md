# Dashboard Wiring Map

## Dashboard → BFF → FastAPI

Note: When a user belongs to multiple orgs, the backend requires `X-Org-Id` on all control-plane and usage requests. The dashboard sets this via the org selector, persisting the choice in a cookie forwarded by the BFF.

- `/dashboard`
  - `/api/usage/summary` → `GET /v1/protected/usage/summary`
  - `/api/entitlements` → `GET /v1/protected/entitlements`
  - `/api/billing/subscription` → `GET /v1/protected/billing/subscription`
  - `/api/team/members` → `GET /v1/protected/team/members`
  - `/api/keys` → `GET /v1/protected/api-keys`

- `/dashboard/usage`
  - `/api/usage/timeseries` → `GET /v1/protected/usage/timeseries`
  - `/api/usage/by-endpoint` → `GET /v1/protected/usage/by-endpoint`

- `/dashboard/api-keys`
  - `/api/keys` → `GET /v1/protected/api-keys`
  - `/api/keys` → `POST /v1/protected/api-keys`
  - `/api/keys/[keyId]/revoke` → `POST /v1/protected/api-keys/{api_key_id}/revoke`

- `/dashboard/entitlements`
  - `/api/entitlements` → `GET /v1/protected/entitlements`
  - `/api/billing/checkout` → `POST /v1/protected/billing/checkout`
  - `/api/billing/portal` → `POST /v1/protected/billing/portal`

- `/dashboard/team`
  - `/api/team/members` → `GET /v1/protected/team/members`
  - `/api/team/invite` → `POST /v1/protected/team/invite`
  - `/api/team/members/[memberId]/remove` → `POST /v1/protected/team/members/{member_id}/remove`

- `/dashboard/orgs`
  - `/api/orgs` → `GET /v1/protected/orgs`
  - `/api/orgs/projects` → `GET /v1/protected/orgs/{org_id}/projects`
  - `/api/projects/[projectId]/environments` → `GET /v1/protected/projects/{project_id}/environments`

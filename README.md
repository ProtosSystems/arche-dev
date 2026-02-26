# Protos Dev Dashboard

## Local Development

### 1) Run the backend (arche_api)

```bash
cd ../arche_api
uvicorn arche_api.main:app --reload --port 8000
```

### 2) Run the dashboard (arche_dev)

```bash
pnpm install
pnpm dev
```

Dashboard: `http://localhost:3000`
Backend API: `http://localhost:8000`

## Required Environment Variables

Create `arche_dev/.env.local` with:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
API_BASE_URL=http://localhost:8000
```

## Dashboard Route Map

- `/dashboard`
  - `/api/usage/summary` → `GET /v1/protected/usage/summary`
  - `/api/entitlements` → `GET /v1/protected/entitlements`
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

- `/dashboard/team`
  - `/api/team/members` → `GET /v1/protected/team/members`
  - `/api/team/invite` → `POST /v1/protected/team/invite`
  - `/api/team/members/[memberId]/remove` → `POST /v1/protected/team/members/{member_id}/remove`

- `/dashboard/orgs`
  - `/api/orgs` → `GET /v1/protected/orgs`
  - `/api/orgs/projects` → `GET /v1/protected/orgs/{org_id}/projects`
  - `/api/projects/[projectId]/environments` → `GET /v1/protected/projects/{project_id}/environments`

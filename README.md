# Arche Developer Portal

## Local Development

### 1) Run backend (`arche-api`)

```bash
cd ../arche-api
uvicorn arche_api.main:app --reload --port 8000
```

### 2) Run portal (`arche_dev`)

```bash
pnpm install
pnpm dev
```

Portal: `http://localhost:3000`
Backend API: `http://localhost:8000`

## Required Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
API_BASE_URL=http://localhost:8000
```

## Core Portal Routes

- `/`
- `/onboarding`
- `/keys`
- `/usage`
- `/billing`
- `/account`

## Auth Guidance

External onboarding examples use:

- `X-Api-Key`
- `X-Request-ID`

Portal users authenticate with Clerk. Runtime Arche API calls use `X-Api-Key`; they do not use the Clerk session cookie or `Authorization: Bearer` as the public quickstart path.

## SDK-First Integration

After validating connectivity with cURL, use the Python SDK as the primary integration path.

Published customer-facing documentation is canonical and lives in `arche-docs`
(`https://docs.arche.fi`). The files under `docs/` here are the portal's own
contract fixtures, checked by `pnpm check:docs-contract`:

| Topic | Canonical | Fixture |
| --- | --- | --- |
| Python SDK | `https://docs.arche.fi/sdks/python` | `docs/python_sdk.md` |
| Quickstart | `https://docs.arche.fi/quickstart` | `docs/quickstart.md` |
| Request IDs | `https://docs.arche.fi/troubleshooting/request-ids` | `docs/troubleshooting/request-ids.md` |

## Validation Commands

```bash
pnpm lint
pnpm build
pnpm smoke:portal
pnpm check:docs-contract
```

`check:docs-contract` validates every documented example against the full
published OpenAPI contract in `docs/contracts/openapi.json` (69 operations).
Refresh that file from the same schema `arche-docs` publishes at
`/openapi.json`; override the path with `OPENAPI_PATH` when testing against a
different build.

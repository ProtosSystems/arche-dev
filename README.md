# Arche Developer Portal

## Local Development

### 1) Run backend (`arche_api`)

```bash
cd ../arche_api
uvicorn arche_api.main:app --reload --port 8000
```

### 2) Run portal (`arche_dev`)

```bash
npm install
npm run dev
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

## SDK-First Integration

After validating connectivity with cURL, use the Python SDK as the primary integration path:

- `docs/python_sdk.md`

## Validation Commands

```bash
npm run lint
npm run build
npm run smoke:portal
npm run check:docs-contract
```

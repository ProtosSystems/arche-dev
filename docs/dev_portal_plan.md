# Developer Portal MVP Plan

## Phase 0 Discovery
- Next.js App Router is used from the repo root `app/`.
- UI kit is Catalyst + Tailwind components in `components/catalyst`.
- Clerk is present and used for auth middleware and login UI.

## Canonical Route Map
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

## Implementation Plan
1. Build a single authenticated shell with project picker + environment toggle.
2. Enforce auth gating via middleware (`/login` only public).
3. Implement typed API layer with retries/timeout/error normalization.
4. Implement deterministic mock mode with localStorage persistence.
5. Build required pages with empty/error/loading states and copy-once secret UX.
6. Run lint/build and document testing gaps.

## Testing Status
- No dedicated frontend unit/integration test framework is configured in this repo.
- Added `scripts/portal-smoke.mjs` + `npm run smoke:portal` as a minimal structural check.
- Follow-up needed if full middleware/component tests are required.

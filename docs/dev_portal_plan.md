# Developer Portal MVP Plan

## Discovery Summary
- Next.js App Router is used (`app/` directory).
- Existing UI primitives come from Catalyst/Tailwind components in `components/catalyst`.
- Clerk is already integrated and now used with middleware route protection.
- Existing `/dashboard/*` IA was removed in favor of canonical portal IA.

## Canonical Route Map Implemented
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

## Delivery Plan
1. Routing/layout/navigation shell with global project picker and consistent page shells.
2. Auth middleware with Clerk + explicit dev bypass (`AUTH_DISABLED_FOR_DEV=true`).
3. Typed client layer (`lib/api/*`) and deterministic mock layer (`NEXT_PUBLIC_PORTAL_MOCK=true`).
4. MVP pages for onboarding, projects, API keys, usage, webhooks, billing, settings, security, support.
5. Quality gate: lint/build checks and documentation.

## Testing Notes
- This repo currently has no preconfigured unit/integration test runner for frontend route/middleware tests.
- Required minimum tests are documented as a follow-up gap until test tooling is added.

# Developer Portal MVP Plan (Self-Serve API Keys)

## Outcomes
- Core navigation stays limited to high-value surfaces.
- Self-serve onboarding now follows the real pre-launch contract:
  - sign in
  - entitlement check from Arche canonical state
  - purchase via Paddle when required
  - create API key directly in portal
  - copy key once
  - call API using `X-Api-Key`
- Project creation is not user-facing and not required for key creation.
- Request-aware error UX remains in place with request ID surfacing.
- Synthetic billing/entitlements fallback behavior removed in BFF routes.

## Canonical Route Map
Public:
- `/login`

Authenticated core:
- `/`
- `/onboarding`
- `/keys`
- `/usage`
- `/billing`
- `/account`

## Guardrails Added
- `scripts/portal-smoke.mjs`
  - validates core nav items
  - rejects removed nav items
  - rejects project-dependent onboarding copy
  - validates onboarding canonical endpoint + auth header
- `scripts/validate-self-serve-flow.mjs`
  - validates canonical self-serve access endpoint wiring
  - validates key-create body contract without project/env fields
  - validates purchase-required gating copy and one-time secret UX
- `scripts/validate-docs-contract.mjs`
  - validates quickstart/golden-path documented endpoints against OpenAPI
  - rejects non-canonical auth examples
  - rejects docs path drift under `/docs`

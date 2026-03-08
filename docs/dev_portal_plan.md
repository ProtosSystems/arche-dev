# Developer Portal MVP Plan (Phase 1 Complete)

## Outcomes
- Core navigation reduced to high-value surfaces only.
- Placeholder and non-functional portal flows removed from the core user journey.
- Real onboarding path implemented:
  - sign in
  - select project context
  - create API key
  - copy/paste real request
  - call real API endpoint
- Auth guidance unified around `X-Api-Key` for external onboarding.
- Request-aware error UX added with request ID surfacing and troubleshooting links.
- Synthetic billing/entitlements fallback behavior removed in BFF routes.
- Python SDK promoted as primary post-cURL integration path.

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
  - rejects placeholder copy in core pages
  - validates onboarding canonical endpoint + auth header
- `scripts/validate-docs-contract.mjs`
  - validates quickstart/golden-path documented endpoints against OpenAPI
  - rejects non-canonical auth examples
  - rejects docs path drift under `/docs`

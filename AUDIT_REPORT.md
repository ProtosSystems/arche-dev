# Environment Isolation Audit (arche-api + arche-dev)

**Re-audited:** 2026-09-06 against `arche-api` main `0dbb6b8b` and `arche-dev` main `88d07f9`.
Supersedes the original audit, whose P0 findings have been remediated in code.

## Executive Summary (Go/No-Go)

**Verdict: NO-GO (for publicly claiming "sandbox is fully isolated").**

The verdict is unchanged, but the reasons are entirely different and more
urgent. The original audit found that the code could not separate environments.
That is fixed. What the code now supports, the deployment does not deliver, and
two portal paths collapse production into sandbox:

1. **The deployment wires only the legacy Paddle variables.** `infra/production`
   injects `PADDLE_API_KEY` and `PADDLE_WEBHOOK_SECRET` and nothing else. The
   per-environment variables the code expects appear nowhere outside
   `.env.example`. This has two consequences, below.
2. **Production billing is inert.** `get_billing_service` deliberately ignores
   the legacy `paddle_api_key`, so with only that variable set the client map is
   empty and every checkout or billing-portal call raises
   `paddle_not_configured_for_env`.
3. **Both webhook routes validate against the same secret.** Per-environment
   secret selection falls back to the legacy shared secret when the specific one
   is absent, which is the deployed configuration.
4. **The portal's webhook relay records every event as sandbox.** It posts to
   `/internal/webhooks/paddle`, which hardcodes `EnvironmentKind.SANDBOX`.
5. **The billing subscription read ignores the selected environment.** It sends
   `X-Environment`, but the protected billing resolver reads only `X-Env-Id`, so
   it silently reports the sandbox subscription. Checkout and billing-portal on
   the same page do send `X-Env-Id` and target the right environment.

Findings 2, 4, and 5 are not isolation gaps in the abstract. They are live
defects in the production billing path.

---

## Status of the Original Findings

| Original item | Status | Evidence |
| --- | --- | --- |
| P0: split webhook secrets by environment | **Closed in code** | `dependencies/paddle.py::_select_webhook_secret` branches on `EnvironmentKind` and raises `501 paddle_webhook_secret_not_configured_for_env` |
| P0: dual-environment billing clients | **Closed in code** | `dependencies/billing.py` builds `paddle_clients` per `EnvironmentKind` from `PADDLE_API_KEY_SANDBOX` / `PADDLE_API_KEY_PRODUCTION` |
| P1: enforce explicit env selection for billing | **Open** | `control_plane_router.py:161-163` still returns `SANDBOX` when `X-Env-Id` is absent |
| P1: add contract/integration tests | **Closed** | see Test Coverage below |
| P2: customer webhook isolation | **No longer applicable** | the customer-facing webhook stubs the original audit quoted are gone; `lib/api/portal.ts` has zero webhook references. The Paddle billing relay at `app/internal/webhooks/paddle` is a separate concern — see Finding 4 |

The original audit's evidence for the environment source of truth is also stale:
`PortalProvider` now stores the selection in a cookie (`ENV_COOKIE_NAME`), not
`localStorage`.

---

## Finding 1: The deployment does not wire per-environment secrets

### Evidence

`arche-api/infra/production/main.tf`
```hcl
{ name = "PADDLE_ENV", value = "production" },
...
{ name = "PADDLE_API_KEY",        valueFrom = var.paddle_api_key_secret_arn },
{ name = "PADDLE_WEBHOOK_SECRET", valueFrom = var.paddle_webhook_secret_arn }
```

`arche-api/infra/production/variables.tf` *requires* both legacy ARNs:
```hcl
condition     = var.paddle_api_key_secret_arn != null
error_message = "paddle_api_key_secret_arn must be set for production billing."
```

No `.tf`, `.yml`, `.yaml`, or `.json` file in the repository references
`PADDLE_API_KEY_SANDBOX`, `PADDLE_API_KEY_PRODUCTION`,
`PADDLE_WEBHOOK_SECRET_SANDBOX`, or `PADDLE_WEBHOOK_SECRET_PRODUCTION`. They
appear only in `.env.example`. `infra/staging/main.tf` has the same shape.

The application already knows this is wrong and says so at startup
(`config/settings/__init__.py`):
```py
logger.warning(
    "Legacy Paddle env vars in use; prefer per-environment secrets/keys.",
    extra={
        "uses_legacy_paddle_webhook_secret": using_legacy_webhook_secret,
        "uses_legacy_paddle_api_key": using_legacy_api_key,
    },
)
```

### Assessment

The code migration landed; the infrastructure migration did not. Everything
below follows from this one gap.

### Caveat

This is read from Terraform at `origin/main`, not from the live ECS task
definition. If the per-environment secrets were added out of band, Finding 2
does not bite. **Verify against the running service before acting.**

---

## Finding 2: Production billing is inert

### Evidence

`arche-api/src/arche_api/dependencies/billing.py` consults only the
per-environment settings — there is no legacy fallback:
```py
paddle_api_key_sandbox = getattr(settings, "paddle_api_key_sandbox", None)
paddle_api_key_production = getattr(settings, "paddle_api_key_production", None)

sandbox_api_key = env_sandbox_api_key or (
    paddle_api_key_sandbox.get_secret_value() if paddle_api_key_sandbox else None
)
production_api_key = env_production_api_key or (
    paddle_api_key_production.get_secret_value() if paddle_api_key_production else None
)

if not any(api_key is not None for _, api_key in resolved_api_keys):
    return BillingService(uow=uow, config=config, paddle_clients=paddle_clients)  # empty
```

This is deliberate and asserted by
`tests/unit/dependencies/test_billing_dependencies.py`:
```py
def test_get_billing_service_ignores_legacy_key_fields(...):
    ...
    paddle_api_key=SecretStr("legacy_key"),
    paddle_env="sandbox",
    ...
    assert service._paddle_clients == {}
```

`BillingService` then raises on a missing client
(`application/services/billing_service.py:47`):
```py
super().__init__("paddle_not_configured_for_env")
```

### Assessment

With the deployed configuration — legacy key only — `paddle_clients` is empty
for **both** environments. Checkout and billing-portal calls fail in production,
not just in sandbox.

`.env.example` documents the opposite and is wrong:
> `PADDLE_API_KEY` is used only when a per-env API key is missing.
> With `PADDLE_ENV` set, legacy `PADDLE_API_KEY` fallback is scoped to that env.

No such fallback exists in `billing.py`.

---

## Finding 3: One webhook secret validates both environments

### Evidence

`arche-api/src/arche_api/dependencies/paddle.py`
```py
if environment == EnvironmentKind.SANDBOX:
    return sandbox_secret or legacy_secret
if environment == EnvironmentKind.PRODUCTION:
    return production_secret or legacy_secret
```

The fallback is intentional and tested
(`test_resolve_webhook_secret_legacy_fallback`). Combined with Finding 1, both
`/v1/webhooks/paddle/sandbox` and `/v1/webhooks/paddle/production` resolve to
the same `PADDLE_WEBHOOK_SECRET` in the deployed service.

### Assessment

The original P0 abuse scenario survives, one layer further out: a leaked secret
still yields validly signed events against both environment routes. The
difference is that this is now a configuration state rather than a code
constraint, and it is fixable without a deploy of new code.

---

## Finding 4: The portal's webhook relay records every event as sandbox

### Evidence

`arche-dev/app/internal/webhooks/paddle/route.ts`
```ts
const WEBHOOK_PATH = '/internal/webhooks/paddle'
const upstream = await fetch(`${API_BASE_URL}${WEBHOOK_PATH}`, { ... })
```

`arche-api/src/arche_api/adapters/routers/webhooks_router.py`
```py
internal_router = APIRouter(prefix="/internal/webhooks", include_in_schema=False)

@internal_router.post("/paddle", ...)
async def paddle_webhook_internal(...):
    return await _handle_paddle_webhook(
        ...,
        environment=EnvironmentKind.SANDBOX,
    )
```

The public backward-compatible route has the same property:
```py
@router.post("/paddle", summary="Ingest Paddle sandbox webhook events", ...)
    environment=EnvironmentKind.SANDBOX,
```

### Assessment

Every Paddle event relayed through the portal is persisted with
`environment = SANDBOX` and upserts the sandbox entitlement row
(`uq_entitlements_org_env` is on `(org_id, environment)`). A production purchase
delivered through this path never updates the production entitlement.

Only the explicit `/paddle/sandbox` and `/paddle/production` routes carry the
correct environment. The relay does not use them.

---

## Finding 5: The billing subscription read ignores the selected environment

### Evidence

Two resolvers with different header contracts exist in `control_plane_router.py`:

```py
def _resolve_account_environment(request: Request) -> EnvironmentKind:   # line 112
    raw = (request.headers.get("X-Environment") or "").strip().lower()

async def _resolve_billing_environment(...) -> EnvironmentKind:          # line 155
    env_id_header = request.headers.get("X-Env-Id")
    if env_id_header is None or not env_id_header.strip():
        return EnvironmentKind.SANDBOX
```

The portal's protected billing routes do not agree on which headers to send:

| Portal route | Backend path | Sends `X-Env-Id`? | Resolves correctly? |
| --- | --- | --- | --- |
| `POST /api/billing/checkout` | `/v1/protected/billing/checkout` | yes, from `body.environment_id`; `400 environment_id_required` if absent | yes |
| `POST /api/billing/portal` | `/v1/protected/billing/portal` | yes, same contract | yes |
| `GET /api/billing/subscription` | `/v1/protected/billing/subscription` | **no** — `X-Environment` only | **no**, defaults to sandbox |
| `GET`/`POST /api/keys` | `/v1/api-keys` | yes, via `lookupPortalEnvironmentId` | yes (account resolver) |
| `/api/entitlements`, `/api/account/entitlements` | `/v1/account/entitlements` | n/a | yes (account resolver) |

`app/api/billing/subscription/route.ts`
```ts
const res = await archeApiRequest(request, '/v1/protected/billing/subscription', {
  headers: { 'X-Environment': environment.data },
})
```

`_resolve_billing_environment` does not read `X-Environment`, so this header has
no effect and the call falls through to the sandbox default.

### Assessment

The Billing page displays the **sandbox** subscription regardless of the
selected environment, while the checkout and manage-billing buttons on that same
page correctly act on the selected one. A developer on production sees sandbox
subscription state next to controls that modify production.

This is narrower than the original audit's "silent sandbox fallback" risk, but
it is the same root cause: an implicit default converts a missing header into a
plausible wrong answer instead of an error. One inconsistent caller was enough
to surface it, and the default is what let it ship unnoticed.

---

## What Is Genuinely Isolated

These held up under re-audit and need no further work.

### Keys

- `ApiKey` carries both `env_id` (FK to `environments`) and `environment`.
- Key material is HMAC-SHA256 (`hash_api_key`); raw keys are not stored.
- Auth resolves key → environment → project → org and rejects a mismatch
  between the key row and the environment row.
- `_enforce_environment_headers` returns `403` when a supplied `X-Env-Id` or
  `X-Environment` disagrees with the principal's environment.

### Entitlements and billing customer mapping

- `UniqueConstraint("org_id", "environment", name="uq_entitlements_org_env")`
- `UniqueConstraint("org_id", "environment", name="uq_billing_customer_map_org_env")`

### Usage

- The usage ledger only writes when `environment_id` is present on request state.
- Both unique bucket identities include `environment_id`:
  `uq_usage_buckets_identity_with_key` and `uq_usage_buckets_identity_no_key`.
- Usage and request-activity reads filter on `environment_id`; quota
  aggregation joins `environments` and filters on `kind`.

### Webhook event partitioning

- `Index("uq_paddle_events_paddle_event_id", "environment", "paddle_event_id", unique=True, ...)`
  so idempotency is per environment.

---

## Test Coverage

The original P1 request for contract and integration tests is satisfied:

| Test | Covers |
| --- | --- |
| `tests/integration/control_plane/test_api_key_environment_isolation.py::test_api_key_env_header_mismatch_is_forbidden` | sandbox key + production env header → `403` |
| `tests/integration/webhooks/test_paddle_webhook.py::test_paddle_webhook_secret_isolation_by_environment` | per-environment webhook secret validation |
| `tests/integration/webhooks/test_paddle_webhook.py::test_paddle_webhook_idempotent_on_duplicate_event_id` | idempotency |
| `tests/unit/dependencies/test_paddle_dependencies.py::test_resolve_webhook_secret_env_precedence` / `..._missing_for_env_raises` / `..._legacy_fallback` | secret selection, including the legacy fallback |
| `tests/unit/dependencies/test_billing_dependencies.py::test_get_billing_service_with_both_paddle_clients` / `..._ignores_legacy_key_fields` | dual-environment client map |

**Gap:** no test asserts that the portal's relay path preserves environment, and
none asserts that a billing request without `X-Env-Id` is rejected rather than
defaulted. Findings 4 and 5 are both invisible to the current suite.

---

## Risks

1. **Production purchases do not grant production access.** Finding 4: relayed
   events write the sandbox entitlement row.
2. **Production checkout fails outright.** Finding 2: no billing client is
   constructed from the deployed configuration.
3. **Billing state is reported from the wrong environment.** Finding 5: the
   subscription read always returns sandbox, shown beside controls that act on
   production.
4. **Cross-environment webhook blast radius.** Finding 3: one leaked secret is
   valid on both routes.
5. **Operational drift is invisible.** The startup warning about legacy Paddle
   variables is the only signal, and nothing fails on it.

---

## Remediation Plan (Prioritized)

### P0 — Route the portal relay to an environment-explicit endpoint

`arche-dev/app/internal/webhooks/paddle/route.ts` must select
`/v1/webhooks/paddle/sandbox` or `/v1/webhooks/paddle/production`. If a single
public ingress is required, keep one path and derive the environment from the
verified payload rather than hardcoding it.

Then retire the two `SANDBOX`-hardcoded routes, or make them return `501` rather
than silently choosing an environment.

### P0 — Make the two environment resolvers agree, and remove the default

Teach `_resolve_billing_environment` to accept `X-Environment` as
`_resolve_account_environment` already does, and have
`app/api/billing/subscription/route.ts` send `X-Env-Id` the way checkout and
portal do. Then remove the implicit sandbox default and return
`400 missing_env_id`.

Do all three. Fixing only the caller leaves the next omission silent, and fixing
only the resolver leaves two header contracts for one concept.

### P0 — Wire per-environment Paddle secrets in infrastructure

Add `PADDLE_API_KEY_SANDBOX`, `PADDLE_API_KEY_PRODUCTION`,
`PADDLE_WEBHOOK_SECRET_SANDBOX`, and `PADDLE_WEBHOOK_SECRET_PRODUCTION` to
`infra/production` and `infra/staging`, with matching secret ARNs and variable
validation. Confirm against the live task definition first — see the caveat in
Finding 1.

Once wired, drop the legacy fallback in `_select_webhook_secret` so a
misconfiguration fails loudly instead of quietly sharing a secret.

### P1 — Correct `.env.example`

It documents a legacy `PADDLE_API_KEY` fallback that `billing.py` does not
implement. Either implement the fallback or delete the claim; today it will lead
an operator to configure a deployment that cannot bill.

### P1 — Close the test gaps

- The portal relay preserves environment end to end.
- A protected billing request without an environment header is rejected.
- Every portal BFF route that reaches a protected endpoint transmits the
  selected environment; `subscription` was the one that did not.
- Startup fails, or a health check degrades, when legacy Paddle variables are
  the only ones configured in a non-test environment.

### P2 — Promote the legacy-variable warning

A startup `logger.warning` nobody reads is how Finding 1 survived. Surface it in
a readiness check or a deployment gate.

---

## Isolation Decision

- **Core partitioning is real and verified.** Keys, entitlements, usage, and
  webhook event storage are all environment-scoped, with tests.
- **The billing and webhook paths are not.** The webhook relay collapses
  production into sandbox, the subscription read reports sandbox, and the
  deployed configuration cannot construct a billing client at all.
- **Recommendation: NO-GO until the three P0 items are complete**, with Findings
  2 and 4 treated as production incidents rather than audit items — they affect
  paying customers today, independently of any isolation claim.

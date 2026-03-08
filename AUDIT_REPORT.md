# Environment Isolation Audit (arche_dev + arche_api)

## Executive Summary (Go/No-Go)
**Verdict: NO-GO (for publicly claiming “sandbox is fully isolated”).**

The implementation has **real isolation primitives** for API keys, entitlements, and usage metering (environment-scoped DB fields + filters + auth context binding). However, it does **not yet meet the full hard-boundary definition** because:

1. **Paddle webhook secret is shared across sandbox/production webhook services** in one deployment.
2. **Billing client wiring supports only one Paddle environment (`PADDLE_ENV`) at a time**, making one side of the toggle non-functional for checkout/portal in a shared deployment.
3. **Project webhook management/delivery streams are not implemented** (portal API returns empty / not available), so webhook isolation for customer webhooks cannot be validated.

---

## Environment Source of Truth

### Findings
- In `arche_dev`, environment source is client state (`PortalProvider`) persisted to localStorage (`portal_environment`).
- UI resolves environment **kind** (`sandbox|production`) to a concrete backend **environment UUID** (`env.id`) before calling BFF endpoints.
- BFF forwards `x-env-id` to backend as `X-Env-Id`; query params are forwarded transparently.

### Evidence

`arche_dev/components/portal/PortalProvider.tsx`
```ts
const ENV_KEY = 'portal_environment'
const [environment, setEnvironmentState] = useState<Environment>('sandbox')
...
if (env === 'sandbox' || env === 'production') {
  setEnvironmentState(env)
}
...
const setEnvironment = useCallback((value: Environment) => {
  setEnvironmentState(value)
  setStoredValue(ENV_KEY, value)
}, [])
```

`arche_dev/lib/api/portal.ts`
```ts
const selected = envs.data.items.find((item) => item.kind === environment)
...
const headers = { 'x-env-id': envId }
apiClient.get(`/api/usage/summary?window=24h&environment_id=${envId}`, headers)
apiClient.get(`/api/keys?env_id=${envId}`, headers)
```

`arche_dev/lib/arche-api.server.ts`
```ts
const envId = request.headers.get('x-env-id')
if (envId) {
  headers.set('X-Env-Id', envId)
}
```

`arche_dev/app/api/usage/summary/route.ts`
```ts
const query = url.searchParams.toString()
const path = `/v1/protected/usage/summary${query ? `?${query}` : ''}`
```

---

## Keys Isolation

### Findings
- API keys are persisted with both `env_id` and `environment` (`sandbox|production`) and linked to `environments` table.
- Key material uses HMAC-SHA256 (`CONTROL_PLANE_API_KEY_SECRET`), raw keys not stored.
- During auth, key -> environment -> project -> org chain is resolved; environment mismatch between key row and env row is rejected.
- Auth principal is stamped with `environment_id` and `environment_kind`.
- If caller supplies `X-Env-Id`/`X-Environment`, headers must match key’s environment, else `403`.

### Evidence

`arche_api/src/arche_api/infrastructure/database/models/control_plane/models.py`
```py
class ApiKey(...):
    env_id = ForeignKey("environments.id", ...)
    environment = SAEnum(EnvironmentKind, ...)
```

`arche_api/src/arche_api/domain/services/control_plane_api_keys.py`
```py
def hash_api_key(raw_key: str, *, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), raw_key.encode("utf-8"), sha256).hexdigest()
```

`arche_api/src/arche_api/infrastructure/auth/api_key_dependency.py`
```py
if matched.environment != env.kind:
    raise HTTPException(status_code=500, detail="API key environment mismatch")
...
request.state.environment_id = principal.environment_id
request.state.environment_kind = principal.environment_kind
...
if principal.environment_id != header_env_id:
    raise HTTPException(status_code=403, detail="Forbidden")
```

`arche_api/src/arche_api/application/services/control_plane_service.py`
```py
env = await env_repo.get_by_id(env_id=env_id)
api_key = await repo.create(env_id=env_id, environment=env.kind, ...)
```

### Assessment
- **Hard boundary present for key identity and environment binding.**
- Key prefix is not env-specific (`ak_`), but enforcement is by DB linkage and auth context, not prefix string.

---

## Entitlements/Billing Isolation

### Findings
- Entitlements and billing customer mapping are environment-scoped in DB with unique constraints per `(org_id, environment)`.
- Control-plane billing/entitlements endpoints resolve environment from `X-Env-Id` (defaults to sandbox when absent).
- Entitlement usage computation queries usage by environment kind.

### Evidence

`arche_api/src/arche_api/infrastructure/database/models/control_plane/models.py`
```py
UniqueConstraint("org_id", "environment", name="uq_entitlements_org_env")
UniqueConstraint("org_id", "environment", name="uq_billing_customer_map_org_env")
```

`arche_api/src/arche_api/adapters/routers/control_plane_router.py`
```py
env_id_header = request.headers.get("X-Env-Id")
if env_id_header is None or not env_id_header.strip():
    return EnvironmentKind.SANDBOX
...
subscription = await controller.get_subscription(org_id=org_id, environment=environment)
```

`arche_api/src/arche_api/application/services/control_plane_service.py`
```py
ent = await repo.get_by_org_id(org_id=org_id, environment=environment)
...
return await usage_repo.total_requests(..., environment=environment)
```

`arche_api/src/arche_api/adapters/repositories/control_plane_repository.py`
```py
upsert_stmt = insert_stmt.on_conflict_do_update(
    index_elements=["org_id", "environment"],
    set_=update_values,
)
```

### Gaps
- **Single-environment billing client wiring** in `dependencies/billing.py`:
```py
if settings.paddle_api_key and settings.paddle_env:
    env_kind = EnvironmentKind(settings.paddle_env.value)
    paddle_clients.setdefault(env_kind, PaddleBillingClient(...))
```
Only one Paddle env client is available per deployment, so the other env path returns `paddle_not_configured`.

---

## Usage Isolation

### Findings
- Usage writes include `environment_id` from authenticated request context.
- Usage bucket uniqueness and indexes include `environment_id`.
- Usage read APIs accept `environment_id` filter and apply it in SQL.
- Quota usage (entitlements dashboard) aggregates by **environment kind** via join with `environments.kind`.

### Evidence

`arche_api/src/arche_api/infrastructure/middleware/usage_ledger.py`
```py
environment_id = getattr(request.state, "environment_id", None)
...
await repo.increment_bucket(..., environment_id=environment_id, ...)
```

`arche_api/src/arche_api/infrastructure/database/models/control_plane/models.py`
```py
"environment_id" included in unique bucket identity indexes
```

`arche_api/src/arche_api/adapters/repositories/control_plane_repository.py`
```py
if environment_id is not None:
    stmt = stmt.where(UsageBucketModel.environment_id == environment_id)
```

`arche_api/src/arche_api/adapters/repositories/control_plane_repository.py`
```py
.join(EnvironmentModel, EnvironmentModel.id == UsageBucketModel.environment_id)
.where(..., EnvironmentModel.kind == environment)
```

### Assessment
- **Metering/query isolation is real**, provided authenticated requests carry correct environment context (which API-key auth does).

---

## Webhook Isolation

### Findings
- Paddle webhook events are environment-tagged and idempotency is keyed by `(environment, paddle_event_id)`.
- Separate webhook routes exist for sandbox and production (`/v1/webhooks/paddle/sandbox`, `/v1/webhooks/paddle/production`).
- **But webhook secret resolution is not environment-specific**: both env handlers use same `PADDLE_WEBHOOK_SECRET` source.
- Project webhook endpoints/delivery streams (non-billing webhooks) are not implemented in portal API surface.

### Evidence

`arche_api/src/arche_api/adapters/routers/webhooks_router.py`
```py
@router.post("/paddle/sandbox")
@router.post("/paddle/production")
```

`arche_api/src/arche_api/dependencies/paddle.py`
```py
def _resolve_webhook_secret(settings, environment):
    _ = environment
    env_secret = os.getenv("PADDLE_WEBHOOK_SECRET")
```

`arche_api/src/arche_api/infrastructure/database/models/control_plane/models.py`
```py
Index("uq_paddle_events_paddle_event_id", "environment", "paddle_event_id", unique=True, ...)
```

`arche_api/src/arche_api/application/services/paddle_webhook_service.py`
```py
... get_by_customer_id(..., environment=self._environment)
... upsert_entitlement(..., environment=self._environment)
```

`arche_dev/lib/api/portal.ts`
```ts
async listWebhooks() { return [] }
async upsertWebhook() { throw new Error('...not available...') }
async listWebhookDeliveries() { return [] }
```

### Assessment
- Billing webhook **data partitioning** is present.
- Webhook **secret isolation boundary is incomplete**.
- Customer webhook isolation is **not auditable** due missing implementation.

---

## Risks & Abuse Scenarios

1. **Cross-environment webhook blast radius**
- If one shared Paddle webhook secret leaks, attacker can submit validly signed events to both sandbox and production webhook routes.

2. **Environment toggle appears broader than actual billing runtime support**
- In a shared deployment, only one `PADDLE_ENV` client is wired; checkout/portal for other environment may fail, creating operational drift and confusing isolation guarantees.

3. **Silent sandbox fallback if `X-Env-Id` omitted**
- Billing/entitlements default to sandbox in router; clients that forget header can read/write against sandbox unintentionally.

4. **Webhook delivery-stream guarantees unavailable**
- Project webhook endpoints are absent, so isolation for per-environment delivery streams/secrets cannot be proven.

---

## Black-Box Test Plan (local/dev)

Assumptions:
- Backend base URL: `http://localhost:8000`
- BFF URL: `http://localhost:3000`
- You have a valid user session cookie (`__session`) for BFF calls.
- You know: `ORG_ID`, `PROJECT_ID`, `SANDBOX_ENV_ID`, `PROD_ENV_ID`.

### 1) Sandbox key cannot be used as production context

Create sandbox key:
```bash
curl -i -X POST "http://localhost:3000/api/keys" \
  -H "Content-Type: application/json" \
  -H "x-org-id: $ORG_ID" \
  -H "x-env-id: $SANDBOX_ENV_ID" \
  -b "__session=$SESSION" \
  --data '{"env_id":"'$SANDBOX_ENV_ID'","name":"audit-sbx-key"}'
```
Expected: `200`, returns raw key once.

Attempt API call with sandbox key but force production env header:
```bash
curl -i "http://localhost:8000/v1/views/metrics?symbol=AAPL" \
  -H "X-Api-Key: $SANDBOX_RAW_KEY" \
  -H "X-Env-Id: $PROD_ENV_ID"
```
Expected: `403 Forbidden` (header env mismatch).

### 2) Sandbox traffic does not affect production usage

Generate sandbox traffic (repeat 20x):
```bash
for i in $(seq 1 20); do
  curl -s -o /dev/null "http://localhost:8000/v1/views/metrics?symbol=AAPL" \
    -H "X-Api-Key: $SANDBOX_RAW_KEY"
done
```

Read usage summary per environment via BFF:
```bash
curl -s "http://localhost:3000/api/usage/summary?window=24h&environment_id=$SANDBOX_ENV_ID" \
  -H "x-org-id: $ORG_ID" -H "x-env-id: $SANDBOX_ENV_ID" -b "__session=$SESSION"

curl -s "http://localhost:3000/api/usage/summary?window=24h&environment_id=$PROD_ENV_ID" \
  -H "x-org-id: $ORG_ID" -H "x-env-id: $PROD_ENV_ID" -b "__session=$SESSION"
```
Expected: sandbox count increases; production remains unchanged.

### 3) Entitlements are environment-scoped

Read entitlements for sandbox vs production:
```bash
curl -s "http://localhost:3000/api/entitlements" \
  -H "x-org-id: $ORG_ID" -H "x-env-id: $SANDBOX_ENV_ID" -b "__session=$SESSION"

curl -s "http://localhost:3000/api/entitlements" \
  -H "x-org-id: $ORG_ID" -H "x-env-id: $PROD_ENV_ID" -b "__session=$SESSION"
```
Expected: response `data.environment` and plan/quota can differ by env; no bleed.

Optional webhook check:
- Post same signed test payload to `/v1/webhooks/paddle/sandbox` and `/v1/webhooks/paddle/production`.
- Confirm records land with different `environment` in `paddle_events`.

---

## Remediation Plan (Prioritized)

### P0 (required before public claim): split webhook secrets by environment
- Add settings:
  - `PADDLE_WEBHOOK_SECRET_SANDBOX`
  - `PADDLE_WEBHOOK_SECRET_PRODUCTION`
- Update `dependencies/paddle.py`:
  - `_resolve_webhook_secret(settings, environment)` must branch by `environment`.
- Keep `/v1/webhooks/paddle/sandbox` and `/v1/webhooks/paddle/production` bound to corresponding secret.

### P0 (required): make billing clients dual-environment
- Add settings:
  - `PADDLE_API_KEY_SANDBOX`
  - `PADDLE_API_KEY_PRODUCTION`
- Update `dependencies/billing.py`:
  - Build `paddle_clients` map for both `EnvironmentKind.SANDBOX` and `EnvironmentKind.PRODUCTION` when configured.
- Keep endpoint behavior deterministic: explicit 501 if env client missing.

### P1: enforce explicit env selection for billing/entitlements
- In `control_plane_router._resolve_billing_environment`, remove implicit default sandbox for ambiguous contexts or gate it behind compatibility flag.
- Return `400 missing_env_id` when required.

### P1: add contract/integration tests
- Tests for:
  - sandbox key + production `X-Env-Id` => `403`
  - usage bucket writes/read filters by `environment_id`
  - webhook secret mismatch between env endpoints
  - billing client map supports both envs

### P2: customer webhook isolation completion (if product scope includes it)
- Implement real project webhook endpoints + delivery persistence with environment-scoped schema:
  - `webhook_endpoints(env_id, secret_hash, ...)`
  - `webhook_deliveries(env_id, endpoint_id, status, ... )`
- Expose BFF routes and remove `portalApi.listWebhooks()/listWebhookDeliveries()` stubs.

---

## Isolation Decision
- **Not cosmetic overall**: core key/entitlement/usage partitioning is real.
- **Not adequate yet for public “sandbox is hard-isolated” claim** due webhook secret/client wiring gaps.
- **Recommendation: NO-GO until P0 remediations are complete.**

---

## If you want a stricter model (Option 2: True Sandbox)

Given current architecture is already environment-partitioned in shared tables, the least disruptive upgrade path is:

1. Keep current logical partitioning (`environment`, `environment_id`) for control-plane tables.
2. Add **per-environment secret/material separation** for billing/webhooks.
3. Optionally split runtime stores:
   - Redis DB/prefix per environment for rate-limit/derived counters.
   - Separate Postgres schema or database for sandbox if regulatory isolation is required.

Concrete code targets:
- `src/arche_api/config/settings/billing.py`
- `src/arche_api/dependencies/billing.py`
- `src/arche_api/dependencies/paddle.py`
- `src/arche_api/adapters/routers/control_plane_router.py` (`_resolve_billing_environment` strictness)
- integration tests under `tests/integration/webhooks/` and `tests/integration/adapters/routers/`

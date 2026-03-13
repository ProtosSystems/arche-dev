# Dashboard Wiring Map

## Dashboard -> BFF -> FastAPI

Note: when a user belongs to multiple orgs, the backend requires `X-Org-Id` on control-plane requests. The BFF forwards this header/cookie context to Arche API.

- `/`
  - `/api/usage/summary` -> `GET /v1/protected/usage/summary`
  - `/api/self-serve/access` -> composed from:
    - `GET /v1/protected/entitlements`
    - `GET /v1/protected/billing/subscription`
    - `GET /v1/protected/api-keys`
  - `/api/keys` -> `GET /v1/protected/api-keys`

- `/usage`
  - `/api/usage/timeseries` -> `GET /v1/protected/usage/timeseries`
  - `/api/usage/by-endpoint` -> `GET /v1/protected/usage/by-endpoint`

- `/keys`
  - `/api/keys` -> `GET /v1/protected/api-keys`
  - `/api/keys` -> `POST /v1/protected/api-keys` (self-serve body: `{ "name": "..." }`)
  - `/api/keys/[keyId]/revoke` -> `POST /v1/protected/api-keys/{api_key_id}/revoke`

- `/billing`
  - `/api/self-serve/access` -> canonical entitlement + billing state
  - `/api/billing/checkout` -> `POST /v1/protected/billing/checkout`
  - `/api/billing/portal` -> `POST /v1/protected/billing/portal`

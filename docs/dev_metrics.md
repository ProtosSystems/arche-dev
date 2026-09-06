# Developer Metrics

## Event schema

Events are written asynchronously and do not block API responses.

Tracked events:

- `developer_signed_up`
- `docs_quickstart_viewed` — recorded when a developer arrives from the docs quickstart (`?ref=quickstart`), not on portal page mount
- `api_key_created`
- `first_api_request`
- `first_successful_api_call`

## Developer activation table

Canonical internal row shape (`developer_activation`):

- `api_key_id`
- `user_id`
- `first_request_at`
- `first_success_at`
- `first_endpoint`

## Activation definition

A developer is activated when `first_successful_api_call` is recorded.

## Docs attribution

`docs_to_api_latency_ms` is only meaningful if `docs_quickstart_viewed` marks an
actual docs view. The quickstart at `https://docs.arche.fi/quickstart` links into
the portal with `?ref=quickstart`, and `components/portal/DocsReferralTracker.tsx`
records the event once per session on arrival. Attribution happens portal-side
because that is where the Clerk identity exists; docs and portal are separate
origins and do not share a session cookie.

## Funnel metrics

- `signups`
- `keys_created`
- `activated_developers`
- `activation_rate`
- `median_time_to_first_call_ms`
- `docs_to_api_latency_ms`
- `key_to_call_latency_ms`
- `failed_first_call_rate`

## Query patterns

Example activation rate:

```sql
SELECT
  COUNT(*) FILTER (WHERE first_success_at IS NOT NULL)::float
  / NULLIF(COUNT(*) FILTER (WHERE signed_up_at IS NOT NULL), 0) AS activation_rate
FROM developer_activation;
```

Example failed first-call rate:

```sql
SELECT
  COUNT(*) FILTER (WHERE first_status_code IN (401,403,404,422,429,500))::float
  / NULLIF(COUNT(*) FILTER (WHERE first_request_at IS NOT NULL), 0) AS failed_first_call_rate
FROM developer_activation;
```

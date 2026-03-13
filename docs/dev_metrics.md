# Developer Metrics

## Event schema

Events are written asynchronously and do not block API responses.

Tracked events:

- `developer_signed_up`
- `docs_quickstart_viewed`
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

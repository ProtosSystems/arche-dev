# Quickstart

Arche docs are rooted at `https://docs.arche.fi`.

## First successful request

1. Sign in to `https://app.arche.fi`
2. Open `Onboarding`
3. Create an API key
4. Copy and run this request

<!-- contract: GET /v1/views/metrics -->
```bash
curl -X GET 'https://api.arche.fi/v1/views/metrics' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: quickstart_001' \
  -H 'Accept: application/json'
```

Expected: HTTP `200` with deterministic point-in-time metrics for the selected symbol.

## Authentication

External developer onboarding uses one canonical auth mechanism:

- `X-Api-Key: <YOUR_API_KEY>`

For full auth guidance, see [authentication.md](./authentication.md).

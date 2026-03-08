# Golden Path

This path demonstrates Arche's core value: deterministic, point-in-time, version-aware financial data access.

## Step 1: Establish a stable baseline view

<!-- contract: GET /v1/views/metrics -->
```bash
curl -X GET 'https://api.arche.fi/v1/views/metrics' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: golden_001' \
  -H 'Accept: application/json'
```

## Step 2: Pull deterministic derived time-series data

<!-- contract: GET /v1/edgar/derived-metrics/time-series -->
```bash
curl -X GET 'https://api.arche.fi/v1/edgar/derived-metrics/time-series?ciks=0000320193&statement_type=income_statement' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: golden_002' \
  -H 'Accept: application/json'
```

Both calls should be reproducible for the same inputs and environment.

For a full as-of and version-sequence workflow, see [reproducibility.md](./reproducibility.md).

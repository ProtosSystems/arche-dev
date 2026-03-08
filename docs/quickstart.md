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

## Python SDK (recommended for production integrations)

Install:

```bash
pip install arche-sdk
```

Then run:

```python
from arche_sdk import ArcheClient

with ArcheClient(api_key="YOUR_API_KEY") as client:
    company = client.companies.get("0000320193")
    print(company.name)
```

Continue with [python_sdk.md](./python_sdk.md) for typed workflows across companies, filings, and statements.
For deterministic finance workflows, use [reproducibility.md](./reproducibility.md).

## Authentication

External developer onboarding uses one canonical auth mechanism:

- `X-Api-Key: <YOUR_API_KEY>`

For full auth guidance, see [authentication.md](./authentication.md).

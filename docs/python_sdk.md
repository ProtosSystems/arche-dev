# Python SDK

The Arche Python SDK is the primary integration path for production applications.

## Install

```bash
pip install arche-sdk
```

## Initialize client

```python
from arche_sdk import ArcheClient

with ArcheClient(api_key="YOUR_API_KEY") as client:
    company = client.companies.get("0000320193")
    resolved = client.companies.resolve("AAPL")
    print(company.name, resolved.cik)
```

## Equivalent HTTP contract (company profile)

<!-- contract: GET /v1/edgar/companies/{cik} -->
```bash
curl -X GET 'https://api.arche.fi/v1/edgar/companies/0000320193' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: sdk_001' \
  -H 'Accept: application/json'
```

## Derived metrics time series

```python
from arche_sdk import ArcheClient

with ArcheClient(api_key="YOUR_API_KEY") as client:
    series = client.statements.get_derived_metrics_time_series(
        ciks=["0000320193"],
        statement_type="INCOME_STATEMENT",
        metrics=["GROSS_MARGIN"],
        frequency="annual",
    )
    print(len(series.series))
```

## Equivalent HTTP contract (derived metrics)

<!-- contract: GET /v1/edgar/derived-metrics/time-series -->
```bash
curl -X GET 'https://api.arche.fi/v1/edgar/derived-metrics/time-series?ciks=0000320193&statement_type=income_statement' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: sdk_002' \
  -H 'Accept: application/json'
```

## Error handling and request IDs

```python
from arche_sdk import ArcheClient
from arche_sdk.errors import APIError

try:
    with ArcheClient(api_key="YOUR_API_KEY") as client:
        client.companies.get("0000000000")
except APIError as exc:
    print(exc.status_code, exc.code, exc.request_id, exc.trace_id)
```

Use the reported request ID when contacting support.

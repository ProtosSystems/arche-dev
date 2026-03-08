# Reproducibility Walkthrough

This walkthrough demonstrates Arche's deterministic behavior with explicit date and version semantics.

Goal: reproduce the same financial result with the same inputs, and inspect restatement/version deltas when results change.

## Step 1: Resolve ticker with an explicit as-of date

Use a fixed date so identifier mapping is deterministic.

<!-- contract: GET /v1/edgar/companies:resolve -->
```bash
curl -X GET 'https://api.arche.fi/v1/edgar/companies:resolve?ticker=AAPL&as_of=2024-12-31' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: repro_001' \
  -H 'Accept: application/json'
```

Record the returned CIK (for Apple: `0000320193`).

## Step 2: Query statement versions for a bounded time window

Use a fixed `to_date` and statement type.

<!-- contract: GET /v1/edgar/companies/{cik}/statements -->
```bash
curl -X GET 'https://api.arche.fi/v1/edgar/companies/0000320193/statements?statement_type=INCOME_STATEMENT&to_date=2024-12-31' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: repro_002' \
  -H 'Accept: application/json'
```

This gives the statement versions available as of your selected boundary.

## Step 3: Measure restatement impact between two versions

When a filing restatement occurs, compare explicit version sequences.

<!-- contract: GET /v1/edgar/statements/restatements/delta -->
```bash
curl -X GET 'https://api.arche.fi/v1/edgar/statements/restatements/delta?cik=0000320193&statement_type=INCOME_STATEMENT&fiscal_year=2023&fiscal_period=FY&from_version_sequence=1&to_version_sequence=2' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: repro_003' \
  -H 'Accept: application/json'
```

Now you can explain *why* values changed instead of treating differences as unexplained overwrites.

## Python SDK equivalent

```python
from arche_sdk import ArcheClient

with ArcheClient(api_key="YOUR_API_KEY") as client:
    resolved = client.companies.resolve("AAPL", as_of="2024-12-31")

    versions = client.statements.list(
        resolved.cik,
        statement_type="INCOME_STATEMENT",
        to_date="2024-12-31",
    )

    delta = client.statements.get_restatement_delta(
        resolved.cik,
        statement_type="INCOME_STATEMENT",
        fiscal_year=2023,
        fiscal_period="FY",
        from_version_sequence=1,
        to_version_sequence=2,
    )

    print(len(versions.items), len(delta.metric_deltas))
```

## Why this is different from overwrite-based systems

Overwrite systems usually provide only the latest value, making historical reconciliation fragile.

Arche's explicit as-of and version parameters allow you to:
- rerun the same query and get the same result
- reproduce historical states for audits
- compare version deltas with clear provenance

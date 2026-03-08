# Request IDs

Every Arche API request should include `X-Request-ID`.

```http
X-Request-ID: your_unique_request_id
```

When a request fails, keep the returned request ID and include it in support tickets.

## Portal behavior

The developer portal displays request IDs in failed API interactions when available.

## cURL example

<!-- contract: GET /v1/views/metrics -->
```bash
curl -X GET 'https://api.arche.fi/v1/views/metrics' \
  -H 'X-Api-Key: <YOUR_API_KEY>' \
  -H 'X-Request-ID: troubleshoot_001' \
  -H 'Accept: application/json'
```

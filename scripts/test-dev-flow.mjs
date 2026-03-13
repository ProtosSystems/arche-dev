import fs from 'node:fs'

const failures = []

function read(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing file: ${file}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const keysRoute = read('app/api/keys/route.ts')
const revokeRoute = read('app/api/keys/[keyId]/revoke/route.ts')
const selfServeRoute = read('app/api/self-serve/access/route.ts')
const summaryRoute = read('app/api/usage/summary/route.ts')
const timeseriesRoute = read('app/api/usage/timeseries/route.ts')
const metricsStore = read('lib/dev-metrics/store.ts')
const onboarding = read('app/(portal)/onboarding/page.tsx')
const metricsPage = read('app/internal/dev-metrics/page.tsx')
const webhookRoute = read('app/internal/webhooks/paddle/route.ts')

if (!keysRoute.includes('/v1/api-keys')) {
  failures.push('API key list/create route must use /v1/api-keys canonical endpoint')
}
if (!keysRoute.includes('auto_provision_defaults')) {
  failures.push('API key create route must request internal default provisioning')
}
if (!revokeRoute.includes("method: 'DELETE'") || !revokeRoute.includes('/v1/api-keys/')) {
  failures.push('API key revoke route must use DELETE /v1/api-keys/{key_id}')
}
if (!selfServeRoute.includes('/v1/account/entitlements')) {
  failures.push('Self-serve access route must consume /v1/account/entitlements')
}
if (!selfServeRoute.includes('developer_signed_up')) {
  failures.push('Self-serve access route must instrument developer_signed_up')
}
if (!summaryRoute.includes('first_api_request') || !summaryRoute.includes('first_successful_api_call')) {
  failures.push('Usage summary route must emit first call activation events')
}
if (!timeseriesRoute.includes('first_api_request') || !timeseriesRoute.includes('first_successful_api_call')) {
  failures.push('Usage timeseries route must emit first call activation events')
}

for (const marker of ['api_key_id', 'user_id', 'first_request_at', 'first_success_at', 'first_endpoint']) {
  if (!metricsStore.includes(marker)) {
    failures.push(`Developer activation store missing required field: ${marker}`)
  }
}

for (const marker of ['signups', 'keys_created', 'activated_developers', 'activation_rate']) {
  if (!metricsPage.includes(marker)) {
    failures.push(`Internal metrics dashboard missing required metric: ${marker}`)
  }
}

if (!onboarding.includes('/v1/edgar/companies/AAPL')) {
  failures.push('Onboarding must include the canonical first API call example')
}
if (!onboarding.includes('docs_quickstart_viewed')) {
  failures.push('Onboarding must emit docs_quickstart_viewed instrumentation')
}

if (!webhookRoute.includes('/internal/webhooks/paddle') || !webhookRoute.includes('paddle-signature')) {
  failures.push('Paddle webhook ingress route missing canonical proxy/signature checks')
}

if (failures.length > 0) {
  console.error('Developer flow test failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Developer flow test passed.')

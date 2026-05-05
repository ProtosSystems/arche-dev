import fs from 'node:fs'

const failures = []

function read(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing file: ${file}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const middleware = read('middleware.ts')
const webhookRoute = read('app/internal/webhooks/paddle/route.ts')
const orgContextRoute = read('app/api/org-context/route.ts')
const accessRoute = read('app/api/self-serve/access/route.ts')
const keysRoute = read('app/api/keys/route.ts')
const revokeRoute = read('app/api/keys/[keyId]/revoke/route.ts')
const checkoutRoute = read('app/api/billing/checkout/route.ts')
const portalRoute = read('app/api/billing/portal/route.ts')
const healthRoute = read('app/api/integration-health/route.ts')
const rateLimitRoute = read('app/api/rate-limit-state/route.ts')
const provider = read('components/portal/PortalProvider.tsx')
const header = read('components/app/AppHeader.tsx')
const overview = read('app/(portal)/page.tsx')
const billingActions = read('components/billing/BillingActions.tsx')
const healthPanel = read('components/overview/IntegrationHealthPanel.tsx')

if (!middleware.includes("'/internal/webhooks/paddle'")) {
  failures.push('Middleware must keep only the exact Paddle webhook route public.')
}
if (middleware.includes("/internal/webhooks/paddle(.*)")) {
  failures.push('Middleware must not broaden the Paddle webhook public exception.')
}

for (const marker of ['await request.text()', "fetch(`${API_BASE_URL}${WEBHOOK_PATH}`", 'missing_paddle_signature']) {
  if (!webhookRoute.includes(marker)) {
    failures.push(`Webhook relay missing required behavior marker: ${marker}`)
  }
}
if (webhookRoute.includes('archeApiRequest')) {
  failures.push('Webhook relay must not use authenticated archeApiRequest plumbing.')
}
for (const forbidden of ['__session', 'auth()', '@clerk']) {
  if (webhookRoute.includes(forbidden)) {
    failures.push(`Webhook relay must not depend on Clerk/session auth (${forbidden}).`)
  }
}

for (const marker of ['omitOrgHeader: true', "cookieStore.set('org_id'", "'X-Org-Id': orgId", 'requires_selection']) {
  if (!orgContextRoute.includes(marker)) {
    failures.push(`Org context route missing marker: ${marker}`)
  }
}

if (!accessRoute.includes('/v1/account/entitlements')) {
  failures.push('Self-serve access route must use canonical backend entitlements.')
}
for (const forbidden of ['/api/billing/subscription', '/api/keys', 'api_key_limit = null']) {
  if (accessRoute.includes(forbidden)) {
    failures.push(`Self-serve access route must not infer entitlements from ${forbidden}.`)
  }
}
if (!healthRoute.includes('/v1/account/integration-health')) {
  failures.push('Integration health route must use canonical backend integration health.')
}
if (!rateLimitRoute.includes('/v1/account/rate-limit-state')) {
  failures.push('Rate-limit-state route must use canonical backend runtime rate-limit state.')
}

for (const file of [keysRoute, revokeRoute, checkoutRoute, portalRoute]) {
  if (!file.includes('resolvePortalEnvironment')) {
    failures.push('Environment-aware BFF route is missing resolvePortalEnvironment().')
  }
}
if (keysRoute.includes("'X-Environment': 'sandbox'") || revokeRoute.includes("'X-Environment': 'sandbox'")) {
  failures.push('Key routes must not hardcode sandbox.')
}
if (!checkoutRoute.includes('environment_id_required') || !portalRoute.includes('environment_id_required')) {
  failures.push('Billing routes must require an explicit environment_id.')
}
if (!billingActions.includes('environment_id: environmentId')) {
  failures.push('Billing actions must send the selected environment ID.')
}
if (!keysRoute.includes("'X-Environment': environment.data")) {
  failures.push('API key list/create route must forward the selected environment explicitly.')
}

for (const marker of ['selectedEnvironment', 'switchOrganization', 'orgSelectionRequired']) {
  if (!provider.includes(marker)) {
    failures.push(`Portal provider missing org/environment state marker: ${marker}`)
  }
}
for (const marker of ['Organization', 'Environment', 'setSelectedEnvironment', 'switchOrganization', 'Select organization']) {
  if (!header.includes(marker)) {
    failures.push(`Header missing switcher marker: ${marker}`)
  }
}
if (!provider.includes("error.status === 409") || !provider.includes('org_context_required')) {
  failures.push('Portal provider must handle backend 409 org_context_required responses.')
}
if (!accessRoute.includes("headers: { 'X-Environment': environment.data }")) {
  failures.push('Self-serve access route must forward the explicit selected environment.')
}
for (const marker of ['Integration health', 'Copy request ID', 'Per-key last used', 'Recent 4xx and 5xx errors', 'Current quota or rate-limit state']) {
  if (!overview.includes(marker) && !healthPanel.includes(marker)) {
    failures.push(`Overview health panel missing marker: ${marker}`)
  }
}
for (const marker of ['first_successful_api_call_at', 'latest_request_endpoint', 'latest_request_status', 'latest_request_id']) {
  if (!healthPanel.includes(marker)) {
    failures.push(`Integration health panel missing backend field marker: ${marker}`)
  }
}

if (failures.length > 0) {
  console.error('Integration contract validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Integration contract validation passed.')

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
const webhookRoutes = [
  'app/internal/webhooks/paddle/route.ts',
  'app/internal/webhooks/paddle/sandbox/route.ts',
  'app/internal/webhooks/paddle/production/route.ts',
].map((file) => ({ file, content: read(file) }))
const webhookRelay = read('lib/portal/paddle-ingress.ts')
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
const overview = read('app/(portal)/dashboard/page.tsx')
const billingActions = read('components/billing/BillingActions.tsx')
const healthPanel = read('components/overview/IntegrationHealthPanel.tsx')

for (const route of [
  "'/internal/webhooks/paddle'",
  "'/internal/webhooks/paddle/sandbox'",
  "'/internal/webhooks/paddle/production'",
]) {
  if (!middleware.includes(route)) {
    failures.push(`Middleware must keep the exact Paddle webhook route public: ${route}`)
  }
}
if (middleware.includes("/internal/webhooks/paddle(.*)")) {
  failures.push('Middleware must not broaden the Paddle webhook public exception.')
}

for (const marker of ['await request.text()', 'fetch(`${apiBaseUrl}${path}`', 'missing_paddle_signature']) {
  if (!webhookRelay.includes(marker)) {
    failures.push(`Webhook relay missing required behavior marker: ${marker}`)
  }
}
// The unsuffixed backend routes hardcode sandbox, so relaying to them records a
// production purchase against the sandbox entitlement row.
if (!webhookRelay.includes('resolvePaddleWebhookPath')) {
  failures.push('Webhook relay must resolve an environment-explicit backend path.')
}
if (/['"`]\/v1\/webhooks\/paddle['"`]/.test(webhookRelay)) {
  failures.push('Webhook relay must not target the environment-ambiguous backend route.')
}
if (webhookRelay.includes('archeApiRequest')) {
  failures.push('Webhook relay must not use authenticated archeApiRequest plumbing.')
}
for (const forbidden of ['__session', 'auth()', '@clerk']) {
  for (const { file, content } of [...webhookRoutes, { file: 'lib/portal/paddle-ingress.ts', content: webhookRelay }]) {
    if (content.includes(forbidden)) {
      failures.push(`Webhook relay must not depend on Clerk/session auth (${forbidden}) in ${file}.`)
    }
  }
}
for (const { file, content } of webhookRoutes) {
  if (!content.includes('relayPaddleWebhook')) {
    failures.push(`Paddle ingress route must relay through the shared helper: ${file}`)
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
// Assert the behavior, not one inline spelling of it: the route resolves the
// selected environment, builds an X-Environment header from it, and passes that
// header to the backend call.
const forwardsEnvironment =
  accessRoute.includes('resolvePortalEnvironment(request)') &&
  /'X-Environment':\s*environment\.data/.test(accessRoute) &&
  /archeApiRequest[\s\S]{0,200}headers/.test(accessRoute)
if (!forwardsEnvironment) {
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

// Paddle (and any crawler) must reach a real page at the site root without a
// login wall; the signed-in Overview lives at /dashboard. Regressing either
// half re-breaks Paddle domain verification.
const landing = read('app/page.tsx')
if (!middleware.includes("'/',")) {
  failures.push('Middleware must keep the site root public for unauthenticated visitors.')
}
if (fs.existsSync('app/(portal)/page.tsx')) {
  failures.push('Overview must live at app/(portal)/dashboard/page.tsx, not at the public root.')
}
if (!landing.includes("redirect('/dashboard')")) {
  failures.push('Landing page must send signed-in users to /dashboard.')
}
for (const marker of ["href=\"/login\"", "href=\"/sign-up\""]) {
  if (!landing.includes(marker)) {
    failures.push(`Landing page missing entry point: ${marker}`)
  }
}
for (const file of [
  'components/portal/PortalShell.tsx',
  'components/app/AppHeader.tsx',
  'app/clerk-provider.tsx',
]) {
  const content = read(file)
  if (/(href|Url|url)\s*[:=]\s*['"`]\/['"`]/.test(content)) {
    failures.push(`Portal navigation must point at /dashboard, not the public root: ${file}`)
  }
}

// Paddle's domain review rejects a site that does not show what is sold, the
// terms governing it, how refunds work, and who the seller is. A reachable page
// alone is not enough -- that was the first rejection.
for (const required of [
  'https://arche.fi/pricing',
  'https://arche.fi/legal/terms',
  'https://arche.fi/legal/privacy',
  'https://arche.fi/legal/refund-policy',
]) {
  if (!landing.includes(required)) {
    failures.push(`Landing page must link the payment-provider-required page: ${required}`)
  }
}
// docs.arche.fi answers 307 to /access. A link to it takes a payment-provider
// reviewer from the page under review straight into the login wall that failed
// the first review. Remove this guard when the docs become public.
//
// Comments are stripped first, and the check is on the host rather than on one
// spelling of a link: the page writes hrefs both as JSX attributes and as
// object properties, and matching only `href="..."` missed the second.
const landingCode = landing.replace(/^\s*\/\/.*$/gm, '')
if (landingCode.includes('docs.arche.fi')) {
  failures.push(
    'Landing page must not link docs.arche.fi while it redirects to a login wall.'
  )
}
if (!landing.includes('Protos Systems LLC')) {
  failures.push('Landing page must name the legal selling entity.')
}
if (!/mailto:/.test(landing)) {
  failures.push('Landing page must publish a contact address.')
}

if (failures.length > 0) {
  console.error('Integration contract validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Integration contract validation passed.')

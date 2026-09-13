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

// Paddle rejected this domain twice. The second rejection arrived with a live
// root page and a valid certificate, because a domain review crawls the host
// rather than loading one URL: every path other than `/`, `/login`, and
// `/sign-up` still answered an anonymous visitor with a sign-in redirect, and a
// host whose only public surface is a hero and two auth buttons reads as a
// login wall. These guards keep the public commerce surface public.
const landing = read('app/(public)/page.tsx')
if (fs.existsSync('app/page.tsx')) {
  failures.push('The landing page must live in the (public) route group so it shares the public chrome.')
}
if (fs.existsSync('app/(portal)/page.tsx')) {
  failures.push('Overview must live at app/(portal)/dashboard/page.tsx, not at the public root.')
}
if (!landing.includes("redirect('/dashboard')")) {
  failures.push('Landing page must send signed-in users to /dashboard.')
}
for (const marker of ['href="/login"', 'href="/sign-up"']) {
  if (!landing.includes(marker)) {
    failures.push(`Landing page missing entry point: ${marker}`)
  }
}

// Derive the routes from the files rather than restating them, so adding a page
// under (public) without opening it in middleware fails here instead of
// silently serving a sign-in redirect to the next reviewer.
function publicRoutes(dir = 'app/(public)', prefix = '') {
  const routes = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...publicRoutes(`${dir}/${entry.name}`, `${prefix}/${entry.name}`))
    } else if (entry.name === 'page.tsx') {
      routes.push(prefix === '' ? '/' : prefix)
    }
  }
  return routes
}
const discovered = fs.existsSync('app/(public)') ? publicRoutes() : []
for (const route of discovered) {
  if (!middleware.includes(`'${route}'`)) {
    failures.push(`Route in app/(public) is not public in middleware.ts: ${route}`)
  }
}

// A payment provider's review looks for what is sold and at what price, the
// terms governing it, how data is handled, how refunds work, and who the seller
// legally is. A reachable page alone is not enough -- that was the first
// rejection -- and linking them off-domain leaves the host being verified with
// nothing on it, which was the second.
const REQUIRED_PUBLIC_PAGES = ['/', '/pricing', '/contact', '/legal/terms', '/legal/privacy', '/legal/refund-policy', '/legal/security']
for (const route of REQUIRED_PUBLIC_PAGES) {
  if (!discovered.includes(route)) {
    failures.push(`Payment-provider-required page is missing from app/(public): ${route}`)
  }
}

const publicChrome = read('components/public/PublicChrome.tsx')
if (!publicChrome.includes('LEGAL_ENTITY') || !publicChrome.includes('mailto:')) {
  failures.push('Public footer must name the legal selling entity and publish a contact address.')
}
const publicSite = read('lib/public-site.ts')
if (!publicSite.includes('Protos Systems LLC')) {
  failures.push('Public site constants must name the legal selling entity.')
}
for (const route of REQUIRED_PUBLIC_PAGES) {
  if (route !== '/' && !publicSite.includes(`'${route}'`)) {
    failures.push(`Public footer must link the required page on this domain: ${route}`)
  }
}
if (/https:\/\/arche\.fi\/(pricing|legal)/.test(publicSite) && !publicSite.includes('MARKETING_ORIGIN')) {
  failures.push('Required pages must be served on this domain, not linked to the marketing site.')
}

// A published price that no longer matches Paddle charges a customer an amount
// the page did not quote, so the page carries the price ids it was read from.
const pricingData = read('lib/pricing.ts')
for (const priceId of ['pri_01m22we15513n2bsd3x18ygkdk', 'pri_01m22whkm3nqk3etqvhr6ptw0h', 'pri_01m22wm8tf92ktqacs7vz67gsr']) {
  if (!pricingData.includes(priceId)) {
    failures.push(`Published plan is missing the live Paddle price id it was read from: ${priceId}`)
  }
}
if (!/monthlyUsd: 99\b/.test(pricingData) || !/monthlyUsd: 600\b/.test(pricingData) || !/monthlyUsd: 2500\b/.test(pricingData)) {
  failures.push('Published monthly prices must match the live Paddle prices (99 / 600 / 2500 USD).')
}

// The previous refund policy described a 7-day trial converting to an annual
// license, which is not what checkout charges. Terms that disagree with the
// transaction are the single page a payment review reads most closely.
const refundPolicy = read('app/(public)/legal/refund-policy/page.tsx')
if (/free trial/i.test(refundPolicy) && !/shown at checkout/i.test(refundPolicy)) {
  failures.push('Refund policy must not assert a trial the checkout does not configure.')
}
for (const marker of ['Cancellation', 'Refunds', 'Duplicate payments']) {
  if (!refundPolicy.includes(marker)) {
    failures.push(`Refund policy missing required section: ${marker}`)
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

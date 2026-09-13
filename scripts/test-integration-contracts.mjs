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

// This host is the application; arche.fi is the public site. Pricing, the four
// policies, and contact existed on both for a day, and the two pricing pages
// disagreed -- one listed plans from $0 to $2,500 a month, the other said
// access was granted case by case. Before that they were not served here at
// all: an anonymous request for `/pricing` came back as a Clerk redirect, which
// is what a crawler probing this domain records as a login wall.
//
// The shape these guards hold: each of those paths is a permanent redirect to
// arche.fi, no page file here serves one, and the auth pages link them.
const nextConfig = read('next.config.mjs')
const rootPage = read('app/page.tsx')
const publicSite = read('lib/public-site.ts')
const authFooter = read('components/public/AuthFooter.tsx')
const loginPage = read('app/login/[[...rest]]/page.tsx')
const signUpPage = read('app/sign-up/[[...rest]]/page.tsx')

const forwarded = [...nextConfig.matchAll(/^\s*'(\/[^']*)',$/gm)].map((match) => match[1])
const REQUIRED_FORWARDS = ['/pricing', '/contact', '/legal/terms', '/legal/privacy', '/legal/refund-policy', '/legal/security']
for (const route of REQUIRED_FORWARDS) {
  if (!forwarded.includes(route)) {
    failures.push(`next.config.mjs must forward the public page to arche.fi: ${route}`)
  }
}
if (!/destination:\s*`https:\/\/arche\.fi\$\{source\}`/.test(nextConfig) || !/permanent:\s*true/.test(nextConfig)) {
  failures.push('Forwarded paths must redirect permanently to arche.fi.')
}

// A page file here would shadow the redirect and reintroduce the duplicate.
function routeFilesUnder(dir, prefix = '') {
  const routes = []
  if (!fs.existsSync(dir)) return routes
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name
    if (entry.isDirectory()) {
      const segment = /^\(.*\)$/.test(name) ? '' : `/${name}`
      routes.push(...routeFilesUnder(`${dir}/${name}`, prefix + segment))
    } else if (name === 'page.tsx' && prefix !== '') {
      routes.push(prefix)
    }
  }
  return routes
}
const localRoutes = routeFilesUnder('app')
for (const route of forwarded) {
  if (localRoutes.includes(route)) {
    failures.push(`Page here duplicates a page on arche.fi -- delete it or drop the redirect: ${route}`)
  }
}

// The two lists are written in different files and must not drift apart.
for (const route of forwarded) {
  if (!publicSite.includes(`'${route}'`)) {
    failures.push(`lib/public-site.ts does not know about the forwarded path: ${route}`)
  }
}

// The root decides where to send a visitor rather than rendering anything.
if (!rootPage.includes("redirect(userId ? '/dashboard' : '/login')")) {
  failures.push('The application root must forward signed-out visitors to /login and signed-in visitors to /dashboard.')
}
if (fs.existsSync('app/(portal)/page.tsx')) {
  failures.push('Overview must live at app/(portal)/dashboard/page.tsx, not at the application root.')
}
if (!middleware.includes("'/',")) {
  failures.push('The root must be public, or an anonymous visitor cannot be routed to /login.')
}

// A bare auth widget is then the whole anonymous surface of this domain, so it
// has to name the seller and link what is sold.
for (const [name, content] of [['login', loginPage], ['sign-up', signUpPage]]) {
  if (!content.includes('<AuthFooter />')) {
    failures.push(`The ${name} page must render the public footer.`)
  }
}
if (!authFooter.includes('LEGAL_ENTITY') || !authFooter.includes('mailto:')) {
  failures.push('Auth footer must name the legal selling entity and publish a contact address.')
}
if (!authFooter.includes('marketingUrl(link.path)')) {
  failures.push('Auth footer must link the public pages on arche.fi.')
}
for (const route of REQUIRED_FORWARDS) {
  if (!publicSite.includes(`path: '${route}'`)) {
    failures.push(`Auth footer link list is missing a required public page: ${route}`)
  }
}
if (!publicSite.includes('Protos Systems LLC')) {
  failures.push('Public site constants must name the legal selling entity.')
}

if (failures.length > 0) {
  console.error('Integration contract validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Integration contract validation passed.')

import fs from 'node:fs'

const failures = []

function read(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing required file: ${file}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const keysPage = read('app/(portal)/keys/page.tsx')
const onboarding = read('app/(portal)/onboarding/page.tsx')
const provider = read('components/portal/PortalProvider.tsx')
const apiKeysRoute = read('app/api/keys/route.ts')
const selfServeRoute = read('app/api/self-serve/access/route.ts')
const portalApi = read('lib/api/portal.ts')

if (provider.includes('selectedProject') || provider.includes('listProjects')) {
  failures.push('Portal provider still includes project selection state')
}

const bannedProjectCopy = ['select a project', 'project context', 'create a project to create a key']
for (const marker of bannedProjectCopy) {
  if (keysPage.toLowerCase().includes(marker) || onboarding.toLowerCase().includes(marker)) {
    failures.push(`Found deprecated project-dependent copy: ${marker}`)
  }
}

if (!keysPage.includes('displayed once') && !keysPage.includes('shown once')) {
  failures.push('Keys page no longer states single-display secret behavior')
}

if (!keysPage.toLowerCase().includes('purchase') || !keysPage.includes('BillingActions')) {
  failures.push('Keys page is missing purchase-required gating flow')
}

if (!apiKeysRoute.includes('api_key_name_required')) {
  failures.push('BFF keys POST route does not validate required self-serve key name')
}
if (apiKeysRoute.includes('project_id') || apiKeysRoute.includes('environment_id')) {
  failures.push('BFF keys POST route still exposes project/environment request contract')
}

for (const marker of ['/v1/account/entitlements', '/v1/api-keys']) {
  if (!selfServeRoute.includes(marker)) {
    failures.push(`Self-serve access route missing upstream dependency: ${marker}`)
  }
}

if (!portalApi.includes("'/api/self-serve/access'")) {
  failures.push('Portal API client does not consume canonical self-serve access endpoint')
}

if (failures.length > 0) {
  console.error('Self-serve flow validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Self-serve flow validation passed.')

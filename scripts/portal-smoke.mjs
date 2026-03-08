import fs from 'node:fs'

const required = [
  'app/login/page.tsx',
  'app/(portal)/page.tsx',
  'app/(portal)/onboarding/page.tsx',
  'app/(portal)/keys/page.tsx',
  'app/(portal)/usage/page.tsx',
  'app/(portal)/billing/page.tsx',
  'app/(portal)/account/page.tsx',
  'app/(portal)/settings/page.tsx',
  'components/portal/PortalShell.tsx',
  'components/overview/ConnectionCard.tsx',
  'middleware.ts',
  'lib/api/client.ts',
  'lib/api/types.ts',
  'lib/api/errors.ts',
  'lib/mock/portal.ts',
]

const missing = required.filter((file) => !fs.existsSync(file))
if (missing.length > 0) {
  console.error('Missing required portal files:')
  for (const file of missing) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

const portalNav = fs.readFileSync('components/portal/PortalShell.tsx', 'utf8')
const mustHaveNavLabels = ['Overview', 'Onboarding', 'API Keys', 'Usage', 'Billing', 'Account']
for (const label of mustHaveNavLabels) {
  if (!portalNav.includes(`label: '${label}'`)) {
    console.error(`Portal nav missing expected item: ${label}`)
    process.exit(1)
  }
}

const forbiddenNavLabels = ['Projects', 'Webhooks', 'Security', 'Support']
for (const label of forbiddenNavLabels) {
  if (portalNav.includes(`label: '${label}'`)) {
    console.error(`Portal nav still contains removed item: ${label}`)
    process.exit(1)
  }
}

const onboarding = fs.readFileSync('app/(portal)/onboarding/page.tsx', 'utf8')
if (!onboarding.includes('/v1/views/metrics')) {
  console.error('Onboarding does not include canonical first-success endpoint.')
  process.exit(1)
}
if (!onboarding.includes('X-Api-Key')) {
  console.error('Onboarding does not use canonical X-Api-Key auth guidance.')
  process.exit(1)
}
if (onboarding.includes('Authorization: Bearer')) {
  console.error('Onboarding still contains Authorization: Bearer guidance.')
  process.exit(1)
}
if (!onboarding.includes('https://docs.arche.fi/python_sdk')) {
  console.error('Onboarding does not link to Python SDK docs.')
  process.exit(1)
}

const forbiddenCopyMarkers = ['coming soon', 'mark onboarding complete']
const coreFiles = [
  'app/(portal)/onboarding/page.tsx',
  'app/(portal)/page.tsx',
  'components/portal/PortalShell.tsx',
  'components/overview/ConnectionCard.tsx',
]

for (const file of coreFiles) {
  const content = fs.readFileSync(file, 'utf8').toLowerCase()
  for (const marker of forbiddenCopyMarkers) {
    if (content.includes(marker)) {
      console.error(`Found forbidden copy marker in ${file}: ${marker}`)
      process.exit(1)
    }
  }
}

const bffFiles = ['app/api/entitlements/route.ts', 'app/api/billing/subscription/route.ts']
for (const file of bffFiles) {
  const content = fs.readFileSync(file, 'utf8')
  if (content.includes('x-portal-fallback') || content.includes('DEFAULT_ENTITLEMENTS') || content.includes('DEFAULT_SUBSCRIPTION')) {
    console.error(`Found synthetic fallback behavior in ${file}`)
    process.exit(1)
  }
}

const apiErrorNoticeFiles = [
  'app/(portal)/onboarding/page.tsx',
  'app/(portal)/page.tsx',
  'app/(portal)/billing/page.tsx',
  'app/(portal)/usage/page.tsx',
  'app/(portal)/keys/page.tsx',
]
for (const file of apiErrorNoticeFiles) {
  const content = fs.readFileSync(file, 'utf8')
  if (!content.includes('ApiErrorNotice')) {
    console.error(`Missing ApiErrorNotice usage in ${file}`)
    process.exit(1)
  }
}

const errorPlumbing = fs.readFileSync('lib/api/errors.ts', 'utf8')
if (!errorPlumbing.includes('requestId')) {
  console.error('Normalized API error model is missing requestId support.')
  process.exit(1)
}

const bffErrorPlumbing = fs.readFileSync('lib/arche-api.server.ts', 'utf8')
if (!bffErrorPlumbing.includes('request_id')) {
  console.error('BFF error plumbing does not serialize request_id.')
  process.exit(1)
}
if (!bffErrorPlumbing.includes('x-request-id')) {
  console.error('BFF error plumbing does not propagate x-request-id header.')
  process.exit(1)
}

const apiClient = fs.readFileSync('lib/api/client.ts', 'utf8')
if (!apiClient.includes("res.headers.get('x-request-id')")) {
  console.error('API client does not read x-request-id from responses.')
  process.exit(1)
}

const docsLinkFiles = ['app/(portal)/onboarding/page.tsx', 'components/portal/PortalShell.tsx', 'components/app/AppHeader.tsx']
for (const file of docsLinkFiles) {
  const content = fs.readFileSync(file, 'utf8')
  if (content.includes('arche.fi/docs') || content.includes('docs.arche.fi/docs')) {
    console.error(`Found invalid docs URL pattern in ${file}`)
    process.exit(1)
  }
}

const projectRouteFiles = [
  'app/(portal)/projects/[projectId]/page.tsx',
  'app/(portal)/projects/[projectId]/api-keys/page.tsx',
  'app/(portal)/projects/[projectId]/usage/page.tsx',
]
for (const file of projectRouteFiles) {
  const content = fs.readFileSync(file, 'utf8')
  if (!content.includes('redirect(')) {
    console.error(`Expected project-scoped route to redirect in ${file}`)
    process.exit(1)
  }
}

console.log('Portal smoke check passed.')

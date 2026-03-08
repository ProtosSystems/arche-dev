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

console.log('Portal smoke check passed.')

import fs from 'node:fs'

const required = [
  'app/login/page.tsx',
  'app/(portal)/page.tsx',
  'app/(portal)/onboarding/page.tsx',
  'app/(portal)/projects/page.tsx',
  'app/(portal)/projects/[projectId]/page.tsx',
  'app/(portal)/projects/[projectId]/api-keys/page.tsx',
  'app/(portal)/projects/[projectId]/usage/page.tsx',
  'app/(portal)/projects/[projectId]/webhooks/page.tsx',
  'app/(portal)/billing/page.tsx',
  'app/(portal)/settings/page.tsx',
  'app/(portal)/security/page.tsx',
  'app/(portal)/support/page.tsx',
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

console.log('Portal smoke check passed.')

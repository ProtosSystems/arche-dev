import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('org rename BFF forwards the selected org and trims the submitted name', () => {
  const routeSource = fs.readFileSync(new URL('../../app/api/orgs/[orgId]/route.ts', import.meta.url), 'utf8')

  assert.match(routeSource, /method: 'PATCH'/)
  assert.match(routeSource, /headers: \{ 'X-Org-Id': orgId \}/)
  assert.match(routeSource, /const name = typeof body\?\.name === 'string' \? body\.name\.trim\(\) : ''/)
})

test('account page reads organization names from portal org context and uses renameOrganization', () => {
  const pageSource = fs.readFileSync(new URL('../../app/(portal)/account/page.tsx', import.meta.url), 'utf8')
  const providerSource = fs.readFileSync(new URL('../../components/portal/PortalProvider.tsx', import.meta.url), 'utf8')

  assert.match(pageSource, /orgContext\?\.organizations\.find/)
  assert.match(pageSource, /renameOrganization\(currentOrganization\.id, nextName\)/)
  assert.match(providerSource, /fetch\(`\/api\/orgs\/\$\{encodeURIComponent\(orgId\)\}`/)
})

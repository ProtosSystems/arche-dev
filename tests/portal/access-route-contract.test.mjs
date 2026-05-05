import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('self-serve access route uses canonical backend entitlement fields', () => {
  const source = fs.readFileSync(new URL('../../app/api/self-serve/access/route.ts', import.meta.url), 'utf8')
  const types = fs.readFileSync(new URL('../../lib/api/types.ts', import.meta.url), 'utf8')

  assert.match(source, /\/v1\/account\/entitlements/)
  assert.doesNotMatch(source, /\/api\/billing\/subscription/)
  assert.doesNotMatch(source, /\/api\/keys/)

  for (const field of [
    'entitlement_status',
    'plan_name',
    'allowed_environments',
    'sandbox_access_status',
    'production_access_status',
    'api_key_limit',
    'api_key_count',
    'can_create_sandbox_key',
    'can_create_production_key',
    'blocked_reason_codes',
    'feature_flags',
  ]) {
    assert.ok(types.includes(field))
  }
})

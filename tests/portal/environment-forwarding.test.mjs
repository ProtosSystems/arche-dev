import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import { buildCheckoutPayload, readEnvironmentId } from '../../lib/portal/billing-forwarding.mjs'
import { getEnvironmentAccess } from '../../lib/portal/access-state.mjs'

test('sandbox key requests resolve the sandbox environment id', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'active',
      production_access_status: 'inactive',
      can_create_sandbox_key: true,
      can_create_production_key: false,
      blocked_reason_codes: [],
      environment_ids: { sandbox: 'env-sbx', production: 'env-prd' },
    },
    'sandbox'
  )

  assert.equal(result.environmentId, 'env-sbx')
})

test('production key requests resolve the production environment id', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'active',
      production_access_status: 'active',
      can_create_sandbox_key: true,
      can_create_production_key: true,
      blocked_reason_codes: [],
      environment_ids: { sandbox: 'env-sbx', production: 'env-prd' },
    },
    'production'
  )

  assert.equal(result.environmentId, 'env-prd')
})

test('blocked production requests still expose the selected production environment id', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'active',
      production_access_status: 'inactive',
      can_create_sandbox_key: true,
      can_create_production_key: false,
      blocked_reason_codes: ['entitlement_inactive'],
      environment_ids: { sandbox: 'env-sbx', production: 'env-prd' },
    },
    'production'
  )

  assert.equal(result.canCreateKey, false)
  assert.equal(result.environmentId, 'env-prd')
})

test('billing forwarding keeps environment id out of the checkout body', () => {
  assert.equal(readEnvironmentId(' env-prd '), 'env-prd')
  assert.deepEqual(
    buildCheckoutPayload({
      environment_id: 'env-prd',
      price_id: 'pri_test',
      unexpected: 'ignored',
    }),
    { price_id: 'pri_test' }
  )
})

test('route source forwards selected environment for keys and billing', () => {
  const keysRoute = fs.readFileSync(new URL('../../app/api/keys/route.ts', import.meta.url), 'utf8')
  const checkoutRoute = fs.readFileSync(new URL('../../app/api/billing/checkout/route.ts', import.meta.url), 'utf8')
  const portalRoute = fs.readFileSync(new URL('../../app/api/billing/portal/route.ts', import.meta.url), 'utf8')

  assert.match(keysRoute, /lookupPortalEnvironmentId/)
  assert.match(keysRoute, /'X-Environment': environment\.data/)
  assert.match(checkoutRoute, /'X-Env-Id': envId/)
  assert.match(checkoutRoute, /buildCheckoutPayload/)
  assert.match(portalRoute, /'X-Env-Id': envId/)
})

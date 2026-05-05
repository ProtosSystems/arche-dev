import test from 'node:test'
import assert from 'node:assert/strict'

import { describeKeyLimit, getEnvironmentAccess } from '../../lib/portal/access-state.mjs'

test('no entitlement defaults to inactive sandbox access', () => {
  const result = getEnvironmentAccess(null, 'sandbox')
  assert.deepEqual(result, {
    entitlementStatus: 'inactive',
    canCreateKey: false,
    environmentId: null,
    blockedReasonCodes: [],
  })
})

test('trialing sandbox entitlement allows key creation when backend says trial', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'trial',
      production_access_status: 'inactive',
      can_create_sandbox_key: true,
      can_create_production_key: false,
      blocked_reason_codes: [],
      environment_ids: { sandbox: 'env-sbx', production: null },
    },
    'sandbox'
  )

  assert.equal(result.entitlementStatus, 'trial')
  assert.equal(result.canCreateKey, true)
  assert.equal(result.environmentId, 'env-sbx')
})

test('active sandbox entitlement exposes active environment access', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'active',
      production_access_status: 'inactive',
      can_create_sandbox_key: true,
      can_create_production_key: false,
      blocked_reason_codes: [],
      environment_ids: { sandbox: 'env-sbx', production: null },
    },
    'sandbox'
  )

  assert.equal(result.entitlementStatus, 'active')
  assert.equal(result.canCreateKey, true)
})

test('blocked sandbox entitlement keeps purchase gating reasons', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'inactive',
      production_access_status: 'inactive',
      can_create_sandbox_key: false,
      can_create_production_key: false,
      blocked_reason_codes: ['entitlement_inactive'],
      environment_ids: { sandbox: 'env-sbx', production: null },
    },
    'sandbox'
  )

  assert.deepEqual(result.blockedReasonCodes, ['entitlement_inactive'])
  assert.equal(result.canCreateKey, false)
})

test('production access can stay blocked while sandbox remains allowed', () => {
  const result = getEnvironmentAccess(
    {
      sandbox_access_status: 'active',
      production_access_status: 'inactive',
      can_create_sandbox_key: true,
      can_create_production_key: false,
      blocked_reason_codes: ['production_access_blocked'],
      environment_ids: { sandbox: 'env-sbx', production: 'env-prd' },
    },
    'production'
  )

  assert.equal(result.entitlementStatus, 'inactive')
  assert.equal(result.canCreateKey, false)
  assert.equal(result.environmentId, 'env-prd')
})

test('production access becomes creatable when entitlement is active', () => {
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

  assert.equal(result.entitlementStatus, 'active')
  assert.equal(result.canCreateKey, true)
})

test('api key limit exhausted copy stays explicit', () => {
  const copy = describeKeyLimit({
    api_key_limit: 1,
    api_key_count: 1,
  })

  assert.equal(copy, '1/1 active keys')
})

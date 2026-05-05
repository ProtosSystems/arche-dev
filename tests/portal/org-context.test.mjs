import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import { normalizeOrganizations, resolveOrgContext } from '../../lib/portal/org-context.mjs'

test('single-org context auto-selects and persists the only organization', () => {
  const result = resolveOrgContext({
    organizations: [{ id: 'org-1', name: 'Alpha' }],
    selectedOrgId: null,
    requiresSelection: false,
  })

  assert.deepEqual(result, {
    selectedOrgId: 'org-1',
    organizations: [{ id: 'org-1', name: 'Alpha' }],
    requiresSelection: false,
    shouldPersistCookie: true,
    shouldClearCookie: false,
  })
})

test('multi-org context with no selected org requires an explicit picker choice', () => {
  const result = resolveOrgContext({
    organizations: [
      { id: 'org-1', name: 'Alpha' },
      { id: 'org-2', name: 'Beta' },
    ],
    selectedOrgId: null,
    requiresSelection: true,
  })

  assert.equal(result.selectedOrgId, null)
  assert.equal(result.requiresSelection, true)
  assert.equal(result.shouldPersistCookie, false)
  assert.equal(result.shouldClearCookie, false)
})

test('selected org is preserved when it still belongs to the user', () => {
  const result = resolveOrgContext({
    organizations: [
      { id: 'org-1', name: 'Alpha' },
      { id: 'org-2', name: 'Beta' },
    ],
    selectedOrgId: 'org-2',
    requiresSelection: true,
  })

  assert.equal(result.selectedOrgId, 'org-2')
  assert.equal(result.requiresSelection, false)
  assert.equal(result.shouldPersistCookie, false)
})

test('stale org cookies are cleared when the selected org no longer exists', () => {
  const result = resolveOrgContext({
    organizations: [
      { id: 'org-1', name: 'Alpha' },
      { id: 'org-2', name: 'Beta' },
    ],
    selectedOrgId: 'org-stale',
    requiresSelection: true,
  })

  assert.equal(result.selectedOrgId, null)
  assert.equal(result.requiresSelection, true)
  assert.equal(result.shouldClearCookie, true)
})

test('org context extracts backend 409 organization lists', () => {
  const organizations = normalizeOrganizations({
    error: {
      details: {
        organizations: [
          { id: 'org-1', name: 'Alpha' },
          { id: 'org-2', name: 'Beta' },
        ],
      },
    },
  })

  assert.deepEqual(organizations, [
    { id: 'org-1', name: 'Alpha' },
    { id: 'org-2', name: 'Beta' },
  ])
})

test('arche api server preserves explicit X-Org-Id during org switching', () => {
  const source = fs.readFileSync(new URL('../../lib/arche-api.server.ts', import.meta.url), 'utf8')
  assert.match(source, /!headers\.has\('X-Org-Id'\)/)
})

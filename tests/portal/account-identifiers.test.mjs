import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const page = fs.readFileSync('app/(portal)/account/page.tsx', 'utf8')

test('the account page surfaces the organization id', () => {
  // The portal knows it and sends it on every request. It is the identifier a
  // user needs for support and for billing operations, so it must be visible.
  assert.ok(page.includes('label="Organization ID"'), 'Organization ID row is missing')
  assert.ok(page.includes('value={currentOrganization.id}'), 'row must render the real org id')
})

test('identifiers are copyable rather than only readable', () => {
  assert.ok(page.includes('AccountIdentifierRow'), 'identifier row component is missing')
  assert.ok(page.includes('navigator.clipboard.writeText'), 'identifiers must be copyable')
})

test('the organization id row is hidden when no organization is selected', () => {
  assert.ok(
    page.includes('{currentOrganization ? ('),
    'the row must be guarded so it never renders undefined'
  )
})

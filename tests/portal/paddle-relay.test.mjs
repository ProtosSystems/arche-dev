import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  PADDLE_WEBHOOK_ENVIRONMENTS,
  resolveDefaultPaddleEnvironment,
  resolvePaddleWebhookPath,
} from '../../lib/portal/paddle-relay.mjs'

test('relay targets the environment-explicit backend route', () => {
  assert.equal(resolvePaddleWebhookPath('sandbox'), '/v1/webhooks/paddle/sandbox')
  assert.equal(resolvePaddleWebhookPath('production'), '/v1/webhooks/paddle/production')
})

test('relay refuses an unknown environment rather than guessing', () => {
  for (const value of ['', 'staging', 'PRODUCTION ', undefined, null]) {
    assert.equal(resolvePaddleWebhookPath(value), null)
  }
})

test('relay never targets an environment-ambiguous backend route', () => {
  // /v1/webhooks/paddle and /internal/webhooks/paddle both hardcode sandbox in
  // arche-api, so a production event relayed there is recorded as sandbox.
  for (const environment of PADDLE_WEBHOOK_ENVIRONMENTS) {
    const path = resolvePaddleWebhookPath(environment)
    assert.notEqual(path, '/v1/webhooks/paddle')
    assert.notEqual(path, '/internal/webhooks/paddle')
    assert.ok(path.endsWith(`/${environment}`))
  }
})

test('unsuffixed ingress defaults to sandbox and honours explicit configuration', () => {
  assert.equal(resolveDefaultPaddleEnvironment(undefined), 'sandbox')
  assert.equal(resolveDefaultPaddleEnvironment(''), 'sandbox')
  assert.equal(resolveDefaultPaddleEnvironment('nonsense'), 'sandbox')
  assert.equal(resolveDefaultPaddleEnvironment('production'), 'production')
  assert.equal(resolveDefaultPaddleEnvironment('  PRODUCTION  '), 'production')
})

test('every portal Paddle ingress route relays through the shared helper', () => {
  const routes = [
    'app/internal/webhooks/paddle/route.ts',
    'app/internal/webhooks/paddle/sandbox/route.ts',
    'app/internal/webhooks/paddle/production/route.ts',
  ]
  for (const route of routes) {
    const content = fs.readFileSync(route, 'utf8')
    assert.ok(content.includes('relayPaddleWebhook'), `${route} must use relayPaddleWebhook`)
    assert.ok(
      !/['"]\/v1\/webhooks\/paddle['"]/.test(content),
      `${route} must not target the environment-ambiguous backend route`
    )
  }
})

test('paddle ingress paths are public in middleware', () => {
  const middleware = fs.readFileSync('middleware.ts', 'utf8')
  for (const route of [
    "'/internal/webhooks/paddle'",
    "'/internal/webhooks/paddle/sandbox'",
    "'/internal/webhooks/paddle/production'",
  ]) {
    assert.ok(middleware.includes(route), `middleware must list ${route} as public`)
  }
  assert.ok(
    !middleware.includes('/internal/webhooks/paddle(.*)'),
    'middleware must not broaden the public exception to a wildcard'
  )
})

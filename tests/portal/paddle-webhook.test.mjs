import test from 'node:test'
import assert from 'node:assert/strict'

import { collectPaddleHeaders } from '../../lib/portal/paddle-webhook.mjs'

test('paddle webhook preserves raw webhook headers and content type', () => {
  const headers = collectPaddleHeaders(
    new Headers({
      'Content-Type': 'application/json',
      'Paddle-Signature': 'ts=1;h1=abc',
      'Paddle-Webhook-Id': 'evt_123',
      Authorization: 'Bearer should-not-forward',
    })
  )

  assert.ok(headers)
  assert.equal(headers.get('Content-Type'), 'application/json')
  assert.equal(headers.get('Paddle-Signature'), 'ts=1;h1=abc')
  assert.equal(headers.get('Paddle-Webhook-Id'), 'evt_123')
  assert.equal(headers.get('Authorization'), null)
})

test('paddle webhook rejects requests without signature headers', () => {
  const headers = collectPaddleHeaders(
    new Headers({
      'Content-Type': 'application/json',
      'Paddle-Webhook-Id': 'evt_123',
    })
  )

  assert.equal(headers, null)
})

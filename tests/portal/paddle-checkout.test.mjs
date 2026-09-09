import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const component = fs.readFileSync('components/billing/PaddleCheckout.tsx', 'utf8')
const page = fs.readFileSync('app/(portal)/billing/page.tsx', 'utf8')

test('the billing page can complete a Paddle-redirected transaction', () => {
  // Paddle appends ?_ptxn= to the default payment link and sends the customer
  // there. Without this the portal had no Paddle.js and the page showed nothing.
  assert.ok(page.includes('<PaddleCheckout />'), 'billing page must mount PaddleCheckout')
  assert.ok(component.includes("get('_ptxn')"), 'must read the transaction from _ptxn')
  assert.ok(component.includes('Checkout.open'), 'must open the checkout overlay')
})

test('token environment is derived rather than assumed', () => {
  // A live token pairs with production and a test_ token with sandbox;
  // mismatching them fails inside Paddle.js with no useful message.
  assert.ok(component.includes("startsWith('live_')"), 'environment must follow the token prefix')
})

test('each portal environment gets its own Paddle token', () => {
  // Sandbox and production are separate Paddle accounts holding separate
  // transactions, so a single token cannot serve both.
  assert.ok(
    component.includes('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN_SANDBOX'),
    'must read a sandbox-specific client token'
  )
  assert.ok(
    component.includes('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN_PRODUCTION'),
    'must read a production-specific client token'
  )
  assert.ok(
    component.includes('selectedEnvironment'),
    'must choose the token by the selected portal environment'
  )
  // Next.js only inlines NEXT_PUBLIC_* where it is referenced literally, so a
  // name assembled at runtime would read as undefined in the browser.
  assert.ok(
    !/process\.env\[/.test(component),
    'client token names must be literal so Next.js inlines them'
  )
})

test('a token from the wrong Paddle account is refused with an explanation', () => {
  assert.ok(
    component.includes('environment !== selectedEnvironment'),
    'must detect a token that does not match the selected environment'
  )
})

test('a missing token fails visibly instead of silently', () => {
  assert.ok(
    component.includes('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN'),
    'must read the client token from env'
  )
  assert.ok(
    component.includes('Checkout is unavailable'),
    'must tell the customer when checkout cannot open'
  )
})

test('the component is inert without a transaction', () => {
  assert.ok(component.includes('if (!transactionId)'), 'must render nothing on a normal visit')
})

test('no secret is read client-side', () => {
  // Only the publishable client token belongs in the browser.
  assert.ok(!/PADDLE_API_KEY/.test(component), 'client component must never touch a Paddle API key')
  assert.ok(!/WEBHOOK_SECRET/.test(component), 'client component must never touch a webhook secret')
})

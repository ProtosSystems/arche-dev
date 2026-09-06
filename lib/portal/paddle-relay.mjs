export const PADDLE_WEBHOOK_ENVIRONMENTS = ['sandbox', 'production']

/**
 * Backend ingress path for a Paddle webhook environment.
 *
 * The unsuffixed backend routes (`/v1/webhooks/paddle` and
 * `/internal/webhooks/paddle`) hardcode sandbox, so relaying to them records a
 * production purchase against the sandbox entitlement row. Always target the
 * explicit per-environment route instead.
 */
export function resolvePaddleWebhookPath(environment) {
  if (!PADDLE_WEBHOOK_ENVIRONMENTS.includes(environment)) {
    return null
  }
  return `/v1/webhooks/paddle/${environment}`
}

/**
 * Environment for the unsuffixed portal ingress.
 *
 * Defaults to sandbox, which is what this route already did, so existing Paddle
 * configurations keep working. Set PADDLE_WEBHOOK_ENVIRONMENT=production, or
 * point Paddle production at /internal/webhooks/paddle/production, to stop
 * production events landing in sandbox.
 */
export function resolveDefaultPaddleEnvironment(rawEnvironment) {
  const normalized = (rawEnvironment ?? '').trim().toLowerCase()
  if (PADDLE_WEBHOOK_ENVIRONMENTS.includes(normalized)) {
    return normalized
  }
  return 'sandbox'
}

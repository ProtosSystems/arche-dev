import { relayPaddleWebhook } from '@/lib/portal/paddle-ingress'
import { resolveDefaultPaddleEnvironment } from '@/lib/portal/paddle-relay.mjs'

/**
 * Unsuffixed Paddle ingress, kept for existing Paddle configurations.
 *
 * Prefer the explicit /internal/webhooks/paddle/sandbox and
 * /internal/webhooks/paddle/production paths. This one relays to whichever
 * environment PADDLE_WEBHOOK_ENVIRONMENT names, defaulting to sandbox.
 */
export async function POST(request: Request) {
  return relayPaddleWebhook(request, resolveDefaultPaddleEnvironment(process.env.PADDLE_WEBHOOK_ENVIRONMENT))
}

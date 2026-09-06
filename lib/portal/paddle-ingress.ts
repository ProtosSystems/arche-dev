import { collectPaddleHeaders } from '@/lib/portal/paddle-webhook.mjs'
import { resolvePaddleWebhookPath } from '@/lib/portal/paddle-relay.mjs'
import { NextResponse } from 'next/server'

const PADDLE_SIGNATURE_HEADER = 'paddle-signature'

/** Relay a signed Paddle webhook to the environment-explicit backend route. */
export async function relayPaddleWebhook(request: Request, environment: string): Promise<NextResponse> {
  const path = resolvePaddleWebhookPath(environment)
  if (!path) {
    return NextResponse.json(
      { error: { message: 'unsupported_paddle_environment', details: { environment } } },
      { status: 500 }
    )
  }

  const headers = collectPaddleHeaders(request.headers)
  if (!headers) {
    return NextResponse.json(
      { error: { message: 'missing_paddle_signature', details: { header: PADDLE_SIGNATURE_HEADER } } },
      { status: 400 }
    )
  }

  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
  const body = await request.text()
  const upstream = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store',
  })

  const responseText = await upstream.text()
  const responseHeaders = new Headers()
  const responseContentType = upstream.headers.get('content-type')
  if (responseContentType) {
    responseHeaders.set('content-type', responseContentType)
  }
  const requestId = upstream.headers.get('x-request-id')
  if (requestId) {
    responseHeaders.set('x-request-id', requestId)
  }

  return new NextResponse(responseText, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

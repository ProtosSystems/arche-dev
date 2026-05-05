import { NextResponse } from 'next/server'
import { collectPaddleHeaders } from '@/lib/portal/paddle-webhook.mjs'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'
const WEBHOOK_PATH = '/internal/webhooks/paddle'
const PADDLE_SIGNATURE_HEADER = 'paddle-signature'

export async function POST(request: Request) {
  const headers = collectPaddleHeaders(request.headers)
  if (!headers) {
    return NextResponse.json(
      { error: { message: 'missing_paddle_signature', details: { header: PADDLE_SIGNATURE_HEADER } } },
      { status: 400 }
    )
  }

  const body = await request.text()
  const upstream = await fetch(`${API_BASE_URL}${WEBHOOK_PATH}`, {
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

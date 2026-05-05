import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'
const WEBHOOK_PATH = '/internal/webhooks/paddle'

function collectPaddleHeaders(request: Request): Headers | null {
  const headers = new Headers()
  let hasSignature = false

  request.headers.forEach((value, key) => {
    const normalized = key.toLowerCase()
    if (normalized === 'content-type') {
      headers.set(key, value)
      return
    }
    if (normalized.startsWith('paddle-')) {
      headers.set(key, value)
    }
    if (normalized === 'paddle-signature') {
      hasSignature = true
    }
  })

  return hasSignature ? headers : null
}

export async function POST(request: Request) {
  const headers = collectPaddleHeaders(request)
  if (!headers) {
    return NextResponse.json({ error: { message: 'missing_paddle_signature' } }, { status: 400 })
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

import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const signature = request.headers.get('paddle-signature')
  if (!signature) {
    return NextResponse.json({ error: { message: 'missing_paddle_signature' } }, { status: 400 })
  }

  // Canonical processing is delegated to Arche API so authorization decisions remain DB-backed.
  const body = await request.text()
  const res = await archeApiRequest(request, '/internal/webhooks/paddle', {
    method: 'POST',
    headers: {
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
      'paddle-signature': signature,
    },
    body,
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

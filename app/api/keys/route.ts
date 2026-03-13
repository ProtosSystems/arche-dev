import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { recordActivationEvent } from '@/lib/dev-metrics/store'
import { requireCurrentUserId } from '@/lib/dev-metrics/user'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const res = await archeApiRequest(request, '/v1/api-keys', {
      headers: { 'X-Environment': 'sandbox' },
    })
    if (!res.ok) {
      console.error('keys upstream error', {
        status: res.status,
        message: res.message,
        requestId: res.requestId,
      })
      return jsonError(res)
    }
    return NextResponse.json(res.data, { status: res.status })
  } catch (error) {
    console.error('keys route error', {
      error,
      name: error instanceof Error ? error.name : null,
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: { message: 'api_key_name_required' } }, { status: 422 })
  }

  const res = await archeApiRequest(request, '/v1/api-keys', {
    method: 'POST',
    headers: { 'X-Environment': 'sandbox' },
    body: JSON.stringify({
      name,
    }),
  })
  if (!res.ok) {
    return jsonError(res)
  }

  const userId = await requireCurrentUserId().catch(() => null)
  const apiKeyId =
    typeof res.data === 'object' && res.data && typeof (res.data as { data?: { id?: string } }).data?.id === 'string'
      ? (res.data as { data: { id: string } }).data.id
      : null
  if (userId) {
    queueMicrotask(() => {
      recordActivationEvent({ userId, type: 'api_key_created', apiKeyId })
    })
  }

  return NextResponse.json(res.data, { status: res.status })
}

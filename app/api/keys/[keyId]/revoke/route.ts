import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, context: { params: Promise<{ keyId: string }> }) {
  const { keyId } = await context.params
  const path = `/v1/protected/api-keys/${keyId}/revoke`
  const res = await archeApiRequest(request, path, { method: 'POST' })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

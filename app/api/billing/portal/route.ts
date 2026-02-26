import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const res = await archeApiRequest(request, '/v1/protected/billing/portal', {
    method: 'POST',
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import type { EntitlementDashboard, SuccessEnvelope } from '@/lib/api/types'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const res = await archeApiRequest<SuccessEnvelope<EntitlementDashboard>>(request, '/v1/protected/entitlements')
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

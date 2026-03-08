import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import type { BillingSubscription, SuccessEnvelope } from '@/lib/api/types'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const res = await archeApiRequest<SuccessEnvelope<BillingSubscription>>(request, '/v1/protected/billing/subscription')
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

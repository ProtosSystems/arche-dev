import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import type { BillingSubscription, SuccessEnvelope } from '@/lib/api/types'
import { NextResponse } from 'next/server'

const DEFAULT_SUBSCRIPTION: BillingSubscription = {
  status: 'unknown',
  plan_id: null,
  current_period_end: null,
  updated_at: null,
}

export async function GET(request: Request) {
  try {
    const res = await archeApiRequest<SuccessEnvelope<BillingSubscription>>(request, '/v1/protected/billing/subscription')
    if (!res.ok) {
      if (res.status >= 500 || res.status === 404) {
        return NextResponse.json(
          { data: DEFAULT_SUBSCRIPTION satisfies BillingSubscription },
          { status: 200, headers: { 'x-portal-fallback': 'billing-subscription' } }
        )
      }
      return jsonError(res)
    }
    return NextResponse.json(res.data, { status: res.status })
  } catch {
    return NextResponse.json(
      { data: DEFAULT_SUBSCRIPTION satisfies BillingSubscription },
      { status: 200, headers: { 'x-portal-fallback': 'billing-subscription' } }
    )
  }
}

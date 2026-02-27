import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import type { EntitlementDashboard, SuccessEnvelope } from '@/lib/api/types'
import { NextResponse } from 'next/server'

const DEFAULT_ENTITLEMENTS: EntitlementDashboard = {
  environment: 'sandbox',
  plan: {
    name: 'Unknown',
    tier: null,
    status: 'unknown',
  },
  period: {
    start_at: null,
    end_at: null,
    reset_at: null,
  },
  requests: {
    limit: null,
    used: 0,
    remaining: null,
  },
  ai_budget: null,
  features: {},
  updated_at: null,
}

export async function GET(request: Request) {
  try {
    const res = await archeApiRequest<SuccessEnvelope<EntitlementDashboard>>(request, '/v1/protected/entitlements')
    if (!res.ok) {
      if (res.status >= 500 || res.status === 404) {
        return NextResponse.json(
          { data: DEFAULT_ENTITLEMENTS satisfies EntitlementDashboard },
          { status: 200, headers: { 'x-portal-fallback': 'entitlements' } }
        )
      }
      return jsonError(res)
    }
    return NextResponse.json(res.data, { status: res.status })
  } catch {
    return NextResponse.json(
      { data: DEFAULT_ENTITLEMENTS satisfies EntitlementDashboard },
      { status: 200, headers: { 'x-portal-fallback': 'entitlements' } }
    )
  }
}

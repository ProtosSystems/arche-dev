import { archeApiRequest, jsonError, resolvePortalEnvironment } from '@/lib/arche-api.server'
import type { AccountEntitlements, SuccessEnvelope } from '@/lib/api/types'
import { recordActivationEvent } from '@/lib/dev-metrics/store'
import { requireCurrentUserId } from '@/lib/dev-metrics/user'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const userId = await requireCurrentUserId().catch(() => null)
  const environment = resolvePortalEnvironment(request)
  if (!environment.ok) {
    return jsonError(environment)
  }

  const headers = { 'X-Environment': environment.data }
  const res = await archeApiRequest<SuccessEnvelope<AccountEntitlements>>(request, '/v1/account/entitlements', {
    headers,
  })
  if (!res.ok) {
    return jsonError(res)
  }

  if (userId) {
    queueMicrotask(() => {
      recordActivationEvent({ userId, type: 'developer_signed_up' })
    })
  }

  return NextResponse.json({ data: res.data.data }, { status: res.status })
}

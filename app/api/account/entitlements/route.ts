import { archeApiRequest, jsonError, resolvePortalEnvironment } from '@/lib/arche-api.server'
import type { AccountEntitlements, SuccessEnvelope } from '@/lib/api/types'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const environment = resolvePortalEnvironment(request)
  if (!environment.ok) {
    return jsonError(environment)
  }
  const res = await archeApiRequest<SuccessEnvelope<AccountEntitlements>>(request, '/v1/account/entitlements', {
    headers: { 'X-Environment': environment.data },
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

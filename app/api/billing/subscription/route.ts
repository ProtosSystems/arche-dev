import {
  archeApiRequest,
  jsonError,
  lookupPortalEnvironmentId,
  resolvePortalEnvironment,
} from '@/lib/arche-api.server'
import type { BillingSubscription, SuccessEnvelope } from '@/lib/api/types'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const environment = resolvePortalEnvironment(request)
  if (!environment.ok) {
    return jsonError(environment)
  }
  // The protected billing endpoints resolve the environment from X-Env-Id and
  // ignore X-Environment, so sending only the latter silently reads sandbox.
  const environmentId = await lookupPortalEnvironmentId(request, environment.data)
  if (!environmentId.ok) {
    return jsonError(environmentId)
  }
  const res = await archeApiRequest<SuccessEnvelope<BillingSubscription>>(request, '/v1/protected/billing/subscription', {
    headers: {
      'X-Environment': environment.data,
      ...(environmentId.data ? { 'X-Env-Id': environmentId.data } : {}),
    },
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

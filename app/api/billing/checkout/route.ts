import { archeApiRequest, jsonError, resolvePortalEnvironment } from '@/lib/arche-api.server'
import { buildCheckoutPayload, readEnvironmentId } from '@/lib/portal/billing-forwarding.mjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const environment = resolvePortalEnvironment(request)
  if (!environment.ok) {
    return jsonError(environment)
  }
  const envId = readEnvironmentId(body?.environment_id)
  if (!envId) {
    return NextResponse.json({ error: { message: 'environment_id_required' } }, { status: 400 })
  }
  const res = await archeApiRequest(request, '/v1/protected/billing/checkout', {
    method: 'POST',
    headers: {
      'X-Environment': environment.data,
      'X-Env-Id': envId,
    },
    body: JSON.stringify(buildCheckoutPayload(body)),
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

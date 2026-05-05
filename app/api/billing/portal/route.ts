import { archeApiRequest, jsonError, resolvePortalEnvironment } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const environment = resolvePortalEnvironment(request)
  if (!environment.ok) {
    return jsonError(environment)
  }
  const envId = typeof body?.environment_id === 'string' ? body.environment_id.trim() : ''
  if (!envId) {
    return NextResponse.json({ error: { message: 'environment_id_required' } }, { status: 400 })
  }
  const res = await archeApiRequest(request, '/v1/protected/billing/portal', {
    method: 'POST',
    headers: {
      'X-Environment': environment.data,
      'X-Env-Id': envId,
    },
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

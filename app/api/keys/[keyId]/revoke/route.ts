import { archeApiRequest, jsonError, resolvePortalEnvironment } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, context: { params: Promise<{ keyId: string }> }) {
  const environment = resolvePortalEnvironment(request)
  if (!environment.ok) {
    return jsonError(environment)
  }
  const { keyId } = await context.params
  const path = `/v1/api-keys/${keyId}`
  const res = await archeApiRequest(request, path, {
    method: 'DELETE',
    headers: { 'X-Environment': environment.data },
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

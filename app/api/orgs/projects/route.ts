import { archeApiRequest, jsonError, resolveOrgId } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const orgResult = await resolveOrgId(request)
  if (!orgResult.ok) {
    return jsonError(orgResult)
  }

  const path = `/v1/protected/orgs/${orgResult.data}/projects`
  const res = await archeApiRequest(request, path)
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

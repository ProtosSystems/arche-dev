import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

type OrgResponse = {
  data?: {
    id?: string
    name?: string
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId: rawOrgId } = await params
  const orgId = rawOrgId.trim()
  if (!orgId) {
    return NextResponse.json({ error: { message: 'org_id_required' } }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: { message: 'organization_name_required' } }, { status: 400 })
  }

  const res = await archeApiRequest<OrgResponse>(request, `/v1/protected/orgs/${orgId}`, {
    method: 'PATCH',
    headers: { 'X-Org-Id': orgId },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    return jsonError(res)
  }

  return NextResponse.json(res.data, { status: 200 })
}

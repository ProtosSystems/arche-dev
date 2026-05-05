import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type OrgItem = {
  id: string
  name: string
}

type OrgListResponse = {
  data?: {
    items?: OrgItem[]
  }
}

function readOrganizations(details: unknown): OrgItem[] {
  if (typeof details !== 'object' || details === null) {
    return []
  }
  const payload = details as {
    organizations?: unknown
    error?: { details?: { organizations?: unknown } }
  }
  const organizations = payload.organizations ?? payload.error?.details?.organizations
  if (!Array.isArray(organizations)) {
    return []
  }
  return organizations.flatMap((item) => {
    if (typeof item !== 'object' || item === null) {
      return []
    }
    const id = (item as { id?: unknown }).id
    const name = (item as { name?: unknown }).name
    if (typeof id !== 'string' || typeof name !== 'string') {
      return []
    }
    return [{ id, name }]
  })
}

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const selectedOrgId = cookieStore.get('org_id')?.value || null

  const res = await archeApiRequest<OrgListResponse>(request, '/v1/protected/orgs', {
    omitOrgHeader: true,
  })

  if (!res.ok && res.status !== 409) {
    return jsonError(res)
  }

  const organizations = res.ok ? res.data.data?.items ?? [] : readOrganizations(res.details)
  return NextResponse.json(
    {
      selected_org_id: selectedOrgId,
      organizations,
      requires_selection: res.status === 409,
    },
    { status: 200 }
  )
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const orgId = typeof body?.org_id === 'string' ? body.org_id.trim() : ''
  if (!orgId) {
    return NextResponse.json({ error: { message: 'org_id_required' } }, { status: 400 })
  }

  const res = await archeApiRequest<OrgListResponse>(request, '/v1/protected/orgs', {
    headers: { 'X-Org-Id': orgId },
  })
  if (!res.ok) {
    return jsonError(res)
  }

  const selected = (res.data.data?.items ?? []).find((item) => item.id === orgId)
  if (!selected) {
    return NextResponse.json({ error: { message: 'org_not_found' } }, { status: 404 })
  }

  const cookieStore = await cookies()
  cookieStore.set('org_id', orgId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ ok: true, org: selected }, { status: 200 })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('org_id')
  return NextResponse.json({ ok: true })
}

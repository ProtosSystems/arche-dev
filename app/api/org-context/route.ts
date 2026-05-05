import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { normalizeOrganizations, resolveOrgContext } from '@/lib/portal/org-context.mjs'
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

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const selectedOrgId = cookieStore.get('org_id')?.value || null

  const res = await archeApiRequest<OrgListResponse>(request, '/v1/protected/orgs', {
    omitOrgHeader: true,
  })

  if (!res.ok && res.status !== 409) {
    return jsonError(res)
  }

  const organizations: OrgItem[] = res.ok ? res.data.data?.items ?? [] : normalizeOrganizations(res.details)
  const context = resolveOrgContext({
    organizations,
    selectedOrgId,
    requiresSelection: res.status === 409,
  })

  if (context.shouldPersistCookie && context.selectedOrgId) {
    cookieStore.set('org_id', context.selectedOrgId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  } else if (context.shouldClearCookie) {
    cookieStore.delete('org_id')
  }

  return NextResponse.json(
    {
      selected_org_id: context.selectedOrgId,
      organizations: context.organizations,
      requires_selection: context.requiresSelection,
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

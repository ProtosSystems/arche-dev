import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const orgId = cookieStore.get('org_id')?.value || null
  return NextResponse.json({ org_id: orgId })
}

export async function POST(request: Request) {
  const body = await request.json()
  const orgId = typeof body?.org_id === 'string' ? body.org_id : null
  if (!orgId) {
    return NextResponse.json({ error: { message: 'org_id_required' } }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set('org_id', orgId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('org_id')
  return NextResponse.json({ ok: true })
}

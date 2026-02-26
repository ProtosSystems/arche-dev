import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const DEFAULT_WORKSPACE_NAME = 'Protos'
const MAX_NAME_LENGTH = 64

export async function GET() {
  const cookieStore = await cookies()
  const workspaceName = cookieStore.get('workspace_name')?.value || DEFAULT_WORKSPACE_NAME
  return NextResponse.json({ workspace_name: workspaceName })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const workspaceNameRaw = typeof body?.workspace_name === 'string' ? body.workspace_name : ''
  const workspaceName = workspaceNameRaw.trim()

  if (!workspaceName) {
    return NextResponse.json({ error: { message: 'workspace_name_required' } }, { status: 400 })
  }

  if (workspaceName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: { message: `workspace_name_too_long_max_${MAX_NAME_LENGTH}` } }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set('workspace_name', workspaceName, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ ok: true, workspace_name: workspaceName })
}

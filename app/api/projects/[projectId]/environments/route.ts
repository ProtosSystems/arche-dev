import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params
  const path = `/v1/protected/projects/${projectId}/environments`
  const res = await archeApiRequest(request, path)
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

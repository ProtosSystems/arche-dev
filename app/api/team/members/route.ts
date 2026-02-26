import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const res = await archeApiRequest(request, '/v1/protected/team/members')
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

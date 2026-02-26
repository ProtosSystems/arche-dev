import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const res = await archeApiRequest(request, '/v1/protected/team/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const path = `/v1/protected/api-keys${query ? `?${query}` : ''}`
  const res = await archeApiRequest(request, path)
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

export async function POST(request: Request) {
  const body = await request.json()
  const res = await archeApiRequest(request, '/v1/protected/api-keys', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const path = `/v1/protected/usage/by-endpoint${query ? `?${query}` : ''}`
  const res = await archeApiRequest(request, path)
  if (!res.ok) {
    return jsonError(res)
  }
  return NextResponse.json(res.data, { status: res.status })
}

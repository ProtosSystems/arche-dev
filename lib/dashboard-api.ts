import 'server-only'

import { cookies, headers } from 'next/headers'

export type DashboardApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string }

export async function fetchDashboardApi<T>(path: string): Promise<DashboardApiResult<T>> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const orgId = cookieStore.get('org_id')?.value
  let url = path
  if (!path.startsWith('http')) {
    const headerStore = await headers()
    const host = headerStore.get('x-forwarded-host') || headerStore.get('host')
    const proto = headerStore.get('x-forwarded-proto') || 'http'
    if (host) {
      url = `${proto}://${host}${path}`
    } else {
      const fallbackBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      url = `${fallbackBase}${path}`
    }
  }

  const res = await fetch(url, {
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(orgId ? { 'x-org-id': orgId } : {}),
    },
    cache: 'no-store',
  })

  const text = await res.text()
  let json: any = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = text
    }
  }

  if (!res.ok) {
    const message = json?.error?.message || json?.message || res.statusText || 'Request failed'
    return { ok: false, status: res.status, message }
  }

  return { ok: true, status: res.status, data: json as T }
}

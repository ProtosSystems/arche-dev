import 'server-only'

import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

export type ArcheApiError = {
  status: number
  message: string
  details?: unknown
}

export type ArcheApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; details?: unknown }

function buildHeaders(request: Request, init?: RequestInit, token?: string) {
  const headers = new Headers(init?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const requestId = request.headers.get('x-request-id')
  if (requestId) {
    headers.set('x-request-id', requestId)
  }
  const orgId = request.headers.get('x-org-id')
  if (orgId) {
    headers.set('X-Org-Id', orgId)
  }
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {}
  }
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=')
    if (!key) {
      return acc
    }
    acc[key] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

function requireToken(request: Request): ArcheApiResult<string> {
  const cookies = parseCookies(request.headers.get('cookie'))
  const token = cookies['__session']
  if (!token) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }
  if (process.env.NODE_ENV !== 'production') {
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
        )
        console.log('clerk_token_claims', {
          iss: payload.iss,
          aud: payload.aud,
          azp: payload.azp,
          sub: payload.sub,
          exp: payload.exp,
        })
      } else {
        console.log('clerk_token_non_jwt', { prefix: token.slice(0, 12) })
      }
    } catch (err) {
      console.log('clerk_token_decode_failed', { error: String(err) })
    }
  }
  return { ok: true, status: 200, data: token }
}

export async function archeApiRequest<T>(
  request: Request,
  path: string,
  init: RequestInit = {}
): Promise<ArcheApiResult<T>> {
  const tokenResult = requireToken(request)
  if (!tokenResult.ok) {
    return tokenResult
  }

  const url = `${API_BASE_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(request, init, tokenResult.data),
    cache: 'no-store',
  })

  const text = await res.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = text
    }
  }

  if (!res.ok) {
    const message =
      (json as any)?.error?.message ||
      (json as any)?.detail ||
      (json as any)?.message ||
      res.statusText ||
      'Request failed'
    if (process.env.NODE_ENV !== 'production') {
      console.error('archeApiRequest failed', {
        path,
        status: res.status,
        message,
        details: json,
      })
    }
    return {
      ok: false,
      status: res.status,
      message,
      details: json,
    }
  }

  return { ok: true, status: res.status, data: json as T }
}

export function jsonError(error: ArcheApiError) {
  return NextResponse.json({ error }, { status: error.status })
}

export async function resolveOrgId(request: Request): Promise<ArcheApiResult<string>> {
  const res = await archeApiRequest<any>(request, '/v1/protected/orgs')
  if (!res.ok) {
    return res
  }
  const orgId = res.data?.data?.items?.[0]?.id
  if (!orgId) {
    return { ok: false, status: 404, message: 'Organization not found' }
  }
  return { ok: true, status: 200, data: orgId }
}

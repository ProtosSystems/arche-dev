import 'server-only'

import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

type JsonObject = Record<string, unknown>

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
  const cookies = parseCookies(request.headers.get('cookie'))
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const requestId = request.headers.get('x-request-id')
  if (requestId) {
    headers.set('x-request-id', requestId)
  }
  const orgId = request.headers.get('x-org-id') || cookies.org_id
  if (orgId) {
    headers.set('X-Org-Id', orgId)
  }
  const envId = request.headers.get('x-env-id')
  if (envId) {
    headers.set('X-Env-Id', envId)
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
  const token = cookies.__session
  if (!token) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }
  return { ok: true, status: 200, data: token }
}

function getMessageFromUnknownJson(json: unknown, fallback: string): string {
  if (typeof json !== 'object' || json === null) {
    return fallback
  }

  const obj = json as JsonObject
  const error = obj.error
  if (typeof error === 'object' && error !== null) {
    const errorMessage = (error as JsonObject).message
    if (typeof errorMessage === 'string' && errorMessage) {
      return errorMessage
    }
  }

  const detail = obj.detail
  if (typeof detail === 'string' && detail) {
    return detail
  }

  const message = obj.message
  if (typeof message === 'string' && message) {
    return message
  }

  return fallback
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
    return {
      ok: false,
      status: res.status,
      message: getMessageFromUnknownJson(json, res.statusText || 'Request failed'),
      details: json,
    }
  }

  return { ok: true, status: res.status, data: json as T }
}

export function jsonError(error: ArcheApiError) {
  return NextResponse.json({ error }, { status: error.status })
}

type OrgsResponse = {
  data?: {
    items?: Array<{
      id?: string
    }>
  }
}

export async function resolveOrgId(request: Request): Promise<ArcheApiResult<string>> {
  const res = await archeApiRequest<OrgsResponse>(request, '/v1/protected/orgs')
  if (!res.ok) {
    return res
  }

  const items = res.data.data?.items ?? []
  if (items.length === 0) {
    return { ok: false, status: 404, message: 'Organization not found' }
  }

  const cookies = parseCookies(request.headers.get('cookie'))
  const headerOrgId = request.headers.get('x-org-id')
  const cookieOrgId = cookies.org_id
  const preferredOrgId = headerOrgId || cookieOrgId
  if (preferredOrgId && items.some((item) => item.id === preferredOrgId)) {
    return { ok: true, status: 200, data: preferredOrgId }
  }

  const orgId = items[0]?.id
  if (!orgId) {
    return { ok: false, status: 404, message: 'Organization not found' }
  }
  return { ok: true, status: 200, data: orgId }
}

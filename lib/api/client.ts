import { ApiError } from '@/lib/api/errors'

export type ApiClientOptions = {
  baseUrl?: string
  timeoutMs?: number
  retries?: number
}

type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

type ErrorEnvelope = {
  error?: {
    message?: string
    request_id?: string
  }
  message?: string
  request_id?: string
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRequestId() {
  if (typeof window === 'undefined') {
    return undefined
  }

  const existing = window.sessionStorage.getItem('portal_request_id')
  if (existing) {
    return existing
  }

  const id = `portal_${crypto.randomUUID()}`
  window.sessionStorage.setItem('portal_request_id', id)
  return id
}

function toApiCode(status: number): string {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMITED'
  return 'UNKNOWN'
}

function readRequestIdFromPayload(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const maybe = payload as ErrorEnvelope
  if (maybe.error?.request_id && maybe.error.request_id.trim().length > 0) {
    return maybe.error.request_id
  }
  if (maybe.request_id && maybe.request_id.trim().length > 0) {
    return maybe.request_id
  }
  return undefined
}

function readMessageFromPayload(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) {
    return fallback
  }

  const maybe = payload as ErrorEnvelope
  if (typeof maybe.error?.message === 'string' && maybe.error.message.trim().length > 0) {
    return maybe.error.message
  }
  if (typeof maybe.message === 'string' && maybe.message.trim().length > 0) {
    return maybe.message
  }
  return fallback
}

export function createApiClient(options: ApiClientOptions = {}) {
  const timeoutMs = options.timeoutMs ?? 12_000
  const retries = Math.max(0, Math.min(options.retries ?? 2, 3))
  const baseUrl = options.baseUrl ?? ''

  async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const headers = new Headers(config.headers)
        headers.set('Accept', 'application/json')

        const requestId = getRequestId()
        if (requestId) {
          headers.set('x-request-id', requestId)
        }

        if (config.body !== undefined) {
          headers.set('Content-Type', 'application/json')
        }

        const res = await fetch(url, {
          method: config.method ?? 'GET',
          body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
          headers,
          signal: config.signal ?? controller.signal,
          cache: 'no-store',
          credentials: 'include',
        })

        clearTimeout(timeout)

        if (!res.ok) {
          const text = await res.text()
          let payload: unknown = null
          if (text) {
            try {
              payload = JSON.parse(text) as unknown
            } catch {
              payload = text
            }
          }

          const requestIdFromHeader = res.headers.get('x-request-id') ?? undefined
          const requestId = requestIdFromHeader ?? readRequestIdFromPayload(payload)
          const statusCode = toApiCode(res.status)
          const fallback = statusCode === 'UNKNOWN' ? `HTTP ${res.status}` : text || `HTTP ${res.status}`
          const message = typeof payload === 'string' ? payload : readMessageFromPayload(payload, fallback)
          throw new ApiError(res.status, statusCode, message, requestId)
        }

        if (res.status === 204) {
          return undefined as T
        }

        return (await res.json()) as T
      } catch (error) {
        clearTimeout(timeout)
        const canRetry =
          attempt < retries &&
          (error instanceof TypeError || (error instanceof ApiError && error.status >= 500))

        if (canRetry) {
          await delay(250 * (attempt + 1))
          continue
        }

        if (error instanceof TypeError) {
          throw new ApiError(0, 'NETWORK', error.message || 'Network error', getRequestId())
        }

        throw error
      }
    }

    throw new ApiError(500, 'UNKNOWN', 'Request failed after retries')
  }

  return {
    get: <T>(path: string, headers?: HeadersInit) => request<T>(path, { method: 'GET', headers }),
    post: <T>(path: string, body?: unknown, headers?: HeadersInit) => request<T>(path, { method: 'POST', body, headers }),
    patch: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
      request<T>(path, { method: 'PATCH', body, headers }),
    delete: <T>(path: string, headers?: HeadersInit) => request<T>(path, { method: 'DELETE', headers }),
  }
}

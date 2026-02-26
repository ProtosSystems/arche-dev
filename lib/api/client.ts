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

        if (res.status === 401) throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized')
        if (res.status === 403) throw new ApiError(403, 'FORBIDDEN', 'Forbidden')
        if (res.status === 404) throw new ApiError(404, 'NOT_FOUND', 'Not found')
        if (res.status === 429) throw new ApiError(429, 'RATE_LIMITED', 'Rate limited')

        if (!res.ok) {
          const text = await res.text()
          const message = text || `HTTP ${res.status}`
          throw new ApiError(res.status, 'UNKNOWN', message)
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

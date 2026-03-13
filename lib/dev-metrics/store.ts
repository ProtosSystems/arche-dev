export type ActivationEventType =
  | 'developer_signed_up'
  | 'docs_quickstart_viewed'
  | 'api_key_created'
  | 'first_api_request'
  | 'first_successful_api_call'

type DeveloperActivationRow = {
  user_id: string
  api_key_id: string | null
  first_request_at: string | null
  first_success_at: string | null
  first_endpoint: string | null
  first_status_code: number | null
  signed_up_at: string | null
  docs_quickstart_viewed_at: string | null
  api_key_created_at: string | null
}

type TimedEvent = {
  user_id: string
  type: ActivationEventType
  ts: string
  api_key_id?: string | null
  endpoint?: string | null
  status_code?: number | null
}

type DevMetricsStore = {
  events: TimedEvent[]
  rows: Record<string, DeveloperActivationRow>
}

declare global {
  var __ARCHE_DEV_METRICS_STORE__: DevMetricsStore | undefined
}

function getStore(): DevMetricsStore {
  if (!globalThis.__ARCHE_DEV_METRICS_STORE__) {
    globalThis.__ARCHE_DEV_METRICS_STORE__ = {
      events: [],
      rows: {},
    }
  }
  return globalThis.__ARCHE_DEV_METRICS_STORE__
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[middle]
  return (sorted[middle - 1] + sorted[middle]) / 2
}

function parseTs(value: string | null): number | null {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function durationMs(start: string | null, end: string | null): number | null {
  const left = parseTs(start)
  const right = parseTs(end)
  if (left === null || right === null || right < left) {
    return null
  }
  return right - left
}

export function resetDevMetricsStore() {
  globalThis.__ARCHE_DEV_METRICS_STORE__ = {
    events: [],
    rows: {},
  }
}

export function recordActivationEvent(params: {
  userId: string
  type: ActivationEventType
  at?: string
  apiKeyId?: string | null
  endpoint?: string | null
  statusCode?: number | null
}) {
  const store = getStore()
  const at = params.at ?? new Date().toISOString()
  const row = store.rows[params.userId] ?? {
    user_id: params.userId,
    api_key_id: null,
    first_request_at: null,
    first_success_at: null,
    first_endpoint: null,
    first_status_code: null,
    signed_up_at: null,
    docs_quickstart_viewed_at: null,
    api_key_created_at: null,
  }

  store.events.push({
    user_id: params.userId,
    type: params.type,
    ts: at,
    api_key_id: params.apiKeyId ?? null,
    endpoint: params.endpoint ?? null,
    status_code: params.statusCode ?? null,
  })

  if (params.type === 'developer_signed_up' && !row.signed_up_at) {
    row.signed_up_at = at
  }
  if (params.type === 'docs_quickstart_viewed' && !row.docs_quickstart_viewed_at) {
    row.docs_quickstart_viewed_at = at
  }
  if (params.type === 'api_key_created') {
    if (!row.api_key_created_at) {
      row.api_key_created_at = at
    }
    if (params.apiKeyId && !row.api_key_id) {
      row.api_key_id = params.apiKeyId
    }
  }
  if (params.type === 'first_api_request' && !row.first_request_at) {
    row.first_request_at = at
    row.first_status_code = params.statusCode ?? null
    row.first_endpoint = params.endpoint ?? null
  }
  if (params.type === 'first_successful_api_call' && !row.first_success_at) {
    row.first_success_at = at
    if (!row.first_endpoint) {
      row.first_endpoint = params.endpoint ?? null
    }
  }

  store.rows[params.userId] = row
}

export function getDeveloperActivationRows(): DeveloperActivationRow[] {
  const store = getStore()
  return Object.values(store.rows)
}

export function getDevMetricsSnapshot() {
  const rows = getDeveloperActivationRows()
  const signups = rows.filter((item) => item.signed_up_at !== null).length
  const keysCreated = rows.filter((item) => item.api_key_created_at !== null).length
  const activatedDevelopers = rows.filter((item) => item.first_success_at !== null).length
  const activationRate = signups > 0 ? activatedDevelopers / signups : 0

  const signedUpToFirstCall = rows
    .map((item) => durationMs(item.signed_up_at, item.first_request_at))
    .filter((item): item is number => item !== null)
  const docsToApi = rows
    .map((item) => durationMs(item.docs_quickstart_viewed_at, item.first_request_at))
    .filter((item): item is number => item !== null)
  const keyToCall = rows
    .map((item) => durationMs(item.api_key_created_at, item.first_request_at))
    .filter((item): item is number => item !== null)

  const firstCalls = rows.filter((item) => item.first_request_at !== null)
  const failedFirstCalls = firstCalls.filter(
    (item) =>
      item.first_status_code !== null &&
      [401, 403, 404, 422, 429, 500].includes(item.first_status_code)
  ).length
  const failedFirstCallRate = firstCalls.length > 0 ? failedFirstCalls / firstCalls.length : 0

  return {
    signups,
    keys_created: keysCreated,
    activated_developers: activatedDevelopers,
    activation_rate: activationRate,
    median_time_to_first_call_ms: median(signedUpToFirstCall),
    docs_to_api_latency_ms: median(docsToApi),
    key_to_call_latency_ms: median(keyToCall),
    failed_first_call_rate: failedFirstCallRate,
    developer_activation: rows,
  }
}

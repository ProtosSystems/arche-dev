import type { UsageSummary, UsageTimeseries, UsageTimeseriesStatusItem } from '@/lib/api/types'

type UsageSignal = {
  statusCode: number | null
  endpoint: string | null
}

function pickFirstStatusItem(payload: UsageTimeseries): UsageTimeseriesStatusItem | null {
  const rows = payload.items.filter(
    (item): item is UsageTimeseriesStatusItem => 'status' in item && 'ts_bucket' in item && 'count' in item
  )
  if (rows.length === 0) return null
  return [...rows].sort((a, b) => {
    const left = Date.parse(a.ts_bucket)
    const right = Date.parse(b.ts_bucket)
    return left - right
  })[0]
}

export function usageSignalFromSummary(payload: UsageSummary): UsageSignal | null {
  if (payload.total_requests <= 0) {
    return null
  }
  const firstItem = payload.items[0] ?? null
  return {
    statusCode: payload.total_errors > 0 ? 500 : 200,
    endpoint: firstItem?.endpoint_class ?? null,
  }
}

export function usageSignalFromTimeseries(payload: UsageTimeseries): UsageSignal | null {
  const firstRow = pickFirstStatusItem(payload)
  if (!firstRow) {
    return null
  }
  return {
    statusCode: firstRow.status,
    endpoint: firstRow.route ?? null,
  }
}

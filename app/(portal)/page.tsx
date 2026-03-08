'use client'

import { Text } from '@/components/catalyst/text'
import { ConnectionCard } from '@/components/overview/ConnectionCard'
import { EntitlementsCard } from '@/components/overview/EntitlementsCard'
import { HealthStats, type HealthSummary, type OverviewRange } from '@/components/overview/HealthStats'
import { UsageChart, type UsageChartPoint } from '@/components/overview/UsageChart'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { createApiClient } from '@/lib/api/client'
import type { NormalizedApiError } from '@/lib/api/errors'
import { normalizeApiError } from '@/lib/api/errors'
import type {
  ControlPlaneApiKeyList,
  ControlPlaneEnvironmentList,
  EntitlementDashboard,
  SuccessEnvelope,
  UsageSummary,
  UsageTimeseries,
  UsageTimeseriesStatusItem,
} from '@/lib/api/types'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type OverviewSnapshot = {
  summary24h: UsageSummary | null
  summary7d: UsageSummary | null
  timeseriesRows: UsageTimeseriesStatusItem[]
  entitlements: EntitlementDashboard | null
  keys: { id: string }[]
}

const overviewClient = createApiClient({ baseUrl: '', retries: 2 })

function getNumericField(record: Record<string, unknown>, candidates: string[]): number | null {
  for (const key of candidates) {
    const value = record[key]
    if (typeof value === 'number') {
      return value
    }
  }
  return null
}

function statusCountsFromSummary(summary: UsageSummary | null): { error4xx: number; error5xx: number; rateLimited429: number } {
  if (!summary) {
    return { error4xx: 0, error5xx: 0, rateLimited429: 0 }
  }

  const unknownSummary = summary as unknown as Record<string, unknown>

  const total4xx = getNumericField(unknownSummary, ['total_4xx', 'errors_4xx', 'http_4xx'])
  const total5xx = getNumericField(unknownSummary, ['total_5xx', 'errors_5xx', 'http_5xx'])
  const total429 = getNumericField(unknownSummary, ['total_429', 'rate_limited', 'rate_limited_count'])

  if (total4xx !== null && total5xx !== null && total429 !== null) {
    return { error4xx: total4xx, error5xx: total5xx, rateLimited429: total429 }
  }

  const statusCounts = unknownSummary.status_counts
  if (statusCounts && typeof statusCounts === 'object' && !Array.isArray(statusCounts)) {
    const counters = statusCounts as Record<string, unknown>
    const c4xx = getNumericField(counters, ['4xx', '400'])
    const c5xx = getNumericField(counters, ['5xx', '500'])
    const c429 = getNumericField(counters, ['429'])
    if (c4xx !== null && c5xx !== null && c429 !== null) {
      return { error4xx: c4xx, error5xx: c5xx, rateLimited429: c429 }
    }
  }

  return { error4xx: 0, error5xx: summary.total_errors ?? 0, rateLimited429: 0 }
}

function normalizeTimeseriesRows(payload: UsageTimeseries | null): UsageTimeseriesStatusItem[] {
  if (!payload) {
    return []
  }

  const rows: UsageTimeseriesStatusItem[] = []
  for (const item of payload.items) {
    if ('status' in item && 'count' in item && 'ts_bucket' in item) {
      rows.push({
        ts_bucket: item.ts_bucket,
        route: item.route ?? null,
        status: item.status,
        count: item.count,
      })
      continue
    }

    const dayIso = `${item.day}T00:00:00.000Z`
    const successCount = Math.max(0, item.requests - item.errors)
    if (successCount > 0) {
      rows.push({
        ts_bucket: dayIso,
        route: item.endpoint_class,
        status: 200,
        count: successCount,
      })
    }
    if (item.errors > 0) {
      rows.push({
        ts_bucket: dayIso,
        route: item.endpoint_class,
        status: 500,
        count: item.errors,
      })
    }
  }

  return rows
}

function buildChartPoints(rows: UsageTimeseriesStatusItem[]): UsageChartPoint[] {
  const byBucket = new Map<string, number>()

  for (const row of rows) {
    byBucket.set(row.ts_bucket, (byBucket.get(row.ts_bucket) ?? 0) + row.count)
  }

  return Array.from(byBucket.entries())
    .map(([bucket, requests]) => ({ bucket, requests }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))
}

function countStatus(rows: UsageTimeseriesStatusItem[], predicate: (status: number) => boolean): number {
  return rows.reduce((total, row) => total + (predicate(row.status) ? row.count : 0), 0)
}

function toHealthSummary(summary: UsageSummary | null, fallbackRows: UsageTimeseriesStatusItem[]): HealthSummary {
  const fromSummary = statusCountsFromSummary(summary)
  const fallback4xx = countStatus(fallbackRows, (status) => status >= 400 && status < 500)
  const fallback5xx = countStatus(fallbackRows, (status) => status >= 500)
  const fallback429 = countStatus(fallbackRows, (status) => status === 429)

  return {
    requests: summary?.total_requests ?? 0,
    error4xx: fromSummary.error4xx || fallback4xx,
    error5xx: fromSummary.error5xx || fallback5xx,
    rateLimited429: fromSummary.rateLimited429 || fallback429,
  }
}

export default function DashboardHomePage() {
  const { selectedProject, environment } = usePortal()
  const [range, setRange] = useState<OverviewRange>('24h')
  const [snapshot, setSnapshot] = useState<OverviewSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<NormalizedApiError | null>(null)
  const [usageUnavailable, setUsageUnavailable] = useState(false)

  useEffect(() => {
    if (!selectedProject) {
      setSnapshot(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)
    setUsageUnavailable(false)

    const load = async () => {
      try {
        const envs = await overviewClient.get<SuccessEnvelope<ControlPlaneEnvironmentList>>(
          `/api/projects/${selectedProject.id}/environments`
        )
        const selectedEnv = envs.data.items.find((item) => item.kind === environment)
        const envId = selectedEnv?.id ?? null
        const envHeaders = envId ? { 'x-env-id': envId } : undefined

        if (!envId) {
          if (active) {
            setSnapshot({
              summary24h: null,
              summary7d: null,
              timeseriesRows: [],
              entitlements: null,
              keys: [],
            })
          }
          return
        }

        const query24h = new URLSearchParams({ window: '24h', environment_id: envId })
        const query7d = new URLSearchParams({ window: '7d', environment_id: envId })
        const chartQuery = new URLSearchParams({ window: range, environment_id: envId })

        const [summary24hRes, summary7dRes, timeseriesRes, entitlementRes, keysRes] = await Promise.all([
          overviewClient.get<SuccessEnvelope<UsageSummary>>(`/api/usage/summary?${query24h.toString()}`, envHeaders),
          overviewClient.get<SuccessEnvelope<UsageSummary>>(`/api/usage/summary?${query7d.toString()}`, envHeaders),
          overviewClient.get<SuccessEnvelope<UsageTimeseries>>(`/api/usage/timeseries?${chartQuery.toString()}`, envHeaders),
          overviewClient.get<SuccessEnvelope<EntitlementDashboard>>('/api/entitlements', envHeaders),
          overviewClient.get<SuccessEnvelope<ControlPlaneApiKeyList>>(`/api/keys?env_id=${envId}`, envHeaders),
        ])

        if (!active) return

        setSnapshot({
          summary24h: summary24hRes.data,
          summary7d: summary7dRes.data,
          timeseriesRows: normalizeTimeseriesRows(timeseriesRes.data),
          entitlements: entitlementRes.data,
          keys: keysRes.data.items.map((key) => ({ id: key.id })),
        })
      } catch (err) {
        if (active) {
          setError(normalizeApiError(err))
          setUsageUnavailable(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [selectedProject, environment, range])

  const chartPoints = useMemo(() => buildChartPoints(snapshot?.timeseriesRows ?? []), [snapshot?.timeseriesRows])
  const health24h = useMemo(
    () => toHealthSummary(snapshot?.summary24h ?? null, range === '24h' ? snapshot?.timeseriesRows ?? [] : []),
    [snapshot?.summary24h, snapshot?.timeseriesRows, range]
  )
  const health7d = useMemo(
    () => toHealthSummary(snapshot?.summary7d ?? null, range === '7d' ? snapshot?.timeseriesRows ?? [] : []),
    [snapshot?.summary7d, snapshot?.timeseriesRows, range]
  )
  const hasKeys = (snapshot?.keys.length ?? 0) > 0

  if (!selectedProject) {
    return (
      <PageShell title="Overview" description="Operational summary for your selected project and environment.">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          No project selected. Choose a project from the header, then continue through onboarding.
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Overview" description="Operational summary only.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-lg font-semibold text-zinc-900">Overview</div>
        <Text className="mt-1 text-sm text-zinc-600">
          {selectedProject.name} · {environment}
        </Text>
      </section>

      <ConnectionCard environment={environment} />

      {loading ? <Text className="text-sm text-zinc-600">Refreshing overview…</Text> : null}
      {error ? <ApiErrorNotice error={error} title="Overview data unavailable" /> : null}

      {!error ? (
        <>
          <HealthStats range={range} onRangeChange={setRange} summary24h={health24h} summary7d={health7d} />

          <EntitlementsCard entitlements={snapshot?.entitlements ?? null} />

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-900">Activity</div>
            <div className="mt-3">
              <UsageChart points={chartPoints} unavailable={usageUnavailable} />
            </div>
          </section>

          {!hasKeys ? (
            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <Text className="text-sm text-zinc-700">
                No API keys yet.{' '}
                <Link href="/keys" className="font-medium text-zinc-900 underline">
                  Open Keys
                </Link>
                .
              </Text>
            </section>
          ) : null}
        </>
      ) : null}
    </PageShell>
  )
}

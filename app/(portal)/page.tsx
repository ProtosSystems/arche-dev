'use client'

import { Text } from '@/components/catalyst/text'
import { ConnectionCard } from '@/components/overview/ConnectionCard'
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

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'No data'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'No data'
  }
  return date.toLocaleString()
}

export default function DashboardHomePage() {
  const { selectedProject, environment } = usePortal()
  const [snapshot, setSnapshot] = useState<OverviewSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<NormalizedApiError | null>(null)

  useEffect(() => {
    if (!selectedProject) {
      setSnapshot(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const envs = await overviewClient.get<SuccessEnvelope<ControlPlaneEnvironmentList>>(
          `/api/projects/${selectedProject.id}/environments`
        )
        const selectedEnv = envs.data.items.find((item) => item.kind === environment)
        const envId = selectedEnv?.id ?? null
        if (!envId) {
          throw new Error(`No ${environment} environment exists for the selected project`) // honest degraded state
        }

        const envHeaders = { 'x-env-id': envId }
        const query24h = new URLSearchParams({ window: '24h', environment_id: envId })
        const query7d = new URLSearchParams({ window: '7d', environment_id: envId })

        const [summary24hRes, summary7dRes, timeseriesRes, entitlementRes, keysRes] = await Promise.all([
          overviewClient.get<SuccessEnvelope<UsageSummary>>(`/api/usage/summary?${query24h.toString()}`, envHeaders),
          overviewClient.get<SuccessEnvelope<UsageSummary>>(`/api/usage/summary?${query7d.toString()}`, envHeaders),
          overviewClient.get<SuccessEnvelope<UsageTimeseries>>(`/api/usage/timeseries?${query24h.toString()}`, envHeaders),
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
  }, [selectedProject, environment])

  const stats24h = useMemo(() => statusCountsFromSummary(snapshot?.summary24h ?? null), [snapshot?.summary24h])

  const latestObservedRequestTs = useMemo(() => {
    const rows = snapshot?.timeseriesRows ?? []
    if (rows.length === 0) return null
    const latest = rows.reduce((max, row) => (row.ts_bucket > max ? row.ts_bucket : max), rows[0].ts_bucket)
    return latest
  }, [snapshot?.timeseriesRows])

  if (!selectedProject) {
    return (
      <PageShell title="Overview" description="High-signal operational status for your active project and environment.">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          No project selected. Choose a project from the header, then continue through onboarding.
        </div>
      </PageShell>
    )
  }

  const keyCount = snapshot?.keys.length ?? 0
  const requests24h = snapshot?.summary24h?.total_requests ?? 0
  const requests7d = snapshot?.summary7d?.total_requests ?? 0
  const failed24h = stats24h.error4xx + stats24h.error5xx

  return (
    <PageShell title="Overview" description="Setup, integration health, limits, and trust signals.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-lg font-semibold text-zinc-900">{selectedProject.name}</div>
        <Text className="mt-1 text-sm text-zinc-600">Environment: {environment}</Text>
      </section>

      <ConnectionCard environment={environment} />

      {loading ? <Text className="text-sm text-zinc-600">Refreshing overview…</Text> : null}
      {error ? <ApiErrorNotice error={error} title="Overview data unavailable" /> : null}

      {!error ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-900">Setup status</div>
              <Text className="mt-2 text-sm text-zinc-700">Active API keys: {keyCount}</Text>
              {keyCount === 0 ? (
                <Text className="mt-2 text-sm text-zinc-700">
                  No active keys yet.{' '}
                  <Link href="/keys" className="font-medium text-zinc-900 underline">
                    Create your first key
                  </Link>
                  .
                </Text>
              ) : null}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-900">Integration health</div>
              <Text className="mt-2 text-sm text-zinc-700">Requests (24h): {requests24h.toLocaleString()}</Text>
              <Text className="mt-1 text-sm text-zinc-700">Failed requests (24h): {failed24h.toLocaleString()}</Text>
              <Text className="mt-1 text-xs text-zinc-600">Requests (7d): {requests7d.toLocaleString()}</Text>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-900">Limits & plan</div>
              <Text className="mt-2 text-sm text-zinc-700">Plan: {snapshot?.entitlements?.plan.name ?? 'No data'}</Text>
              <Text className="mt-1 text-sm text-zinc-700">Rate-limited (429, 24h): {stats24h.rateLimited429.toLocaleString()}</Text>
              <Text className="mt-1 text-xs text-zinc-600">
                Request quota remaining:{' '}
                {snapshot?.entitlements?.requests.remaining === null
                  ? 'Unlimited'
                  : (snapshot?.entitlements?.requests.remaining ?? 0).toLocaleString()}
              </Text>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-900">Trust signals</div>
            <Text className="mt-2 text-sm text-zinc-700">Last observed request: {formatDateTime(latestObservedRequestTs)}</Text>
            <Text className="mt-1 text-sm text-zinc-700">
              Usage window end (24h summary): {formatDateTime(snapshot?.summary24h?.window_end ?? null)}
            </Text>
            <Text className="mt-1 text-xs text-zinc-600">
              Ingestion freshness indicators are intentionally omitted here because this portal does not currently expose a
              dedicated ingestion status feed.
            </Text>
          </section>
        </>
      ) : null}
    </PageShell>
  )
}

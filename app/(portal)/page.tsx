'use client'

import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Select } from '@/components/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { getEnvBaseUrl } from '@/components/portal/env'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatDateTime } from '@/components/portal/utils'
import { createApiClient } from '@/lib/api/client'
import { normalizeApiError } from '@/lib/api/errors'
import type {
  BillingSubscription,
  ControlPlaneApiKey,
  ControlPlaneApiKeyList,
  ControlPlaneEnvironmentList,
  EntitlementDashboard,
  SuccessEnvelope,
  UsageByEndpointItem,
  UsageSummary,
  UsageTimeseries,
  UsageTimeseriesStatusItem,
} from '@/lib/api/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type OverviewRange = '24h' | '7d'

type EndpointSummary = {
  route: string
  requests: number
  errors: number
  rate_limited: number
}

type OverviewSnapshot = {
  envId: string | null
  summary: UsageSummary | null
  timeseriesRows: UsageTimeseriesStatusItem[]
  endpoints: EndpointSummary[]
  keys: ControlPlaneApiKey[]
  entitlements: EntitlementDashboard | null
  billing: BillingSubscription | null
}

type ChartPoint = {
  bucket: string
  success: number
  error: number
  rateLimited: number
  total: number
}

const overviewClient = createApiClient({ baseUrl: '', retries: 2 })

function toOverviewRange(value: string | null): OverviewRange {
  return value === '7d' ? '7d' : '24h'
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function computeErrorRate(rows: UsageTimeseriesStatusItem[]): number {
  const totals = rows.reduce(
    (acc, row) => {
      acc.total += row.count
      if (row.status >= 400) {
        acc.errors += row.count
      }
      return acc
    },
    { total: 0, errors: 0 }
  )

  if (totals.total === 0) {
    return 0
  }
  return totals.errors / totals.total
}

function computeRateLimited(rows: UsageTimeseriesStatusItem[]): { count: number; percent: number } {
  const totals = rows.reduce(
    (acc, row) => {
      acc.total += row.count
      if (row.status === 429) {
        acc.rateLimited += row.count
      }
      return acc
    },
    { total: 0, rateLimited: 0 }
  )

  if (totals.total === 0) {
    return { count: 0, percent: 0 }
  }
  return { count: totals.rateLimited, percent: totals.rateLimited / totals.total }
}

function summarizeEndpoints(rows: UsageByEndpointItem[]): EndpointSummary[] {
  return rows
    .map((row) => ({
      route: row.handler,
      requests: row.requests,
      errors: row.errors,
      rate_limited: row.rate_limited ?? 0,
    }))
    .sort((a, b) => b.requests - a.requests)
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

function buildChartPoints(rows: UsageTimeseriesStatusItem[]): ChartPoint[] {
  const byBucket = new Map<string, ChartPoint>()
  for (const row of rows) {
    const bucket = row.ts_bucket
    if (!byBucket.has(bucket)) {
      byBucket.set(bucket, {
        bucket,
        success: 0,
        error: 0,
        rateLimited: 0,
        total: 0,
      })
    }

    const point = byBucket.get(bucket)
    if (!point) {
      continue
    }

    point.total += row.count
    if (row.status === 429) {
      point.rateLimited += row.count
    } else if (row.status >= 400) {
      point.error += row.count
    } else {
      point.success += row.count
    }
  }

  return Array.from(byBucket.values()).sort((a, b) => a.bucket.localeCompare(b.bucket))
}

function UsageStackedChart({ points }: { points: ChartPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
        No requests yet
      </div>
    )
  }

  const width = 760
  const height = 240
  const topPadding = 16
  const bottomPadding = 28
  const leftPadding = 8
  const rightPadding = 8
  const chartHeight = height - topPadding - bottomPadding
  const chartWidth = width - leftPadding - rightPadding
  const maxTotal = Math.max(...points.map((point) => point.total), 1)
  const slotWidth = chartWidth / points.length
  const barWidth = Math.max(6, slotWidth * 0.64)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          Success
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-500" />
          Error
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-rose-500" />
          Rate-limited
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {points.map((point, index) => {
          const x = leftPadding + slotWidth * index + (slotWidth - barWidth) / 2
          const successHeight = (point.success / maxTotal) * chartHeight
          const errorHeight = (point.error / maxTotal) * chartHeight
          const limitedHeight = (point.rateLimited / maxTotal) * chartHeight
          const barBottom = height - bottomPadding
          const successY = barBottom - successHeight
          const errorY = successY - errorHeight
          const limitedY = errorY - limitedHeight
          const label = new Date(point.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

          return (
            <g key={point.bucket}>
              {point.success > 0 ? (
                <rect x={x} y={successY} width={barWidth} height={successHeight} rx={2} fill="#10b981" />
              ) : null}
              {point.error > 0 ? (
                <rect x={x} y={errorY} width={barWidth} height={errorHeight} rx={2} fill="#f59e0b" />
              ) : null}
              {point.rateLimited > 0 ? (
                <rect x={x} y={limitedY} width={barWidth} height={limitedHeight} rx={2} fill="#f43f5e" />
              ) : null}
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" className="fill-zinc-500 text-[10px]">
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function DashboardHomePage() {
  const { selectedProject, environment, setEnvironment } = usePortal()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [range, setRange] = useState<OverviewRange>(toOverviewRange(searchParams.get('range')))
  const [snapshot, setSnapshot] = useState<OverviewSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const envHeaders = envId ? { 'x-env-id': envId } : undefined

        const usageQuery = new URLSearchParams({ window: range })
        if (envId) {
          usageQuery.set('environment_id', envId)
        }

        const [summaryRes, timeseriesRes, endpointRes, keyRes, entitlementRes, billingRes] = await Promise.all([
          overviewClient.get<SuccessEnvelope<UsageSummary>>(`/api/usage/summary?${usageQuery.toString()}`, envHeaders),
          overviewClient.get<SuccessEnvelope<UsageTimeseries>>(
            `/api/usage/timeseries?${usageQuery.toString()}`,
            envHeaders
          ),
          overviewClient.get<SuccessEnvelope<{ items: UsageByEndpointItem[] }>>(
            `/api/usage/by-endpoint?${usageQuery.toString()}`,
            envHeaders
          ),
          envId
            ? overviewClient.get<SuccessEnvelope<ControlPlaneApiKeyList>>(`/api/keys?env_id=${envId}`, envHeaders)
            : Promise.resolve({ data: { items: [] } }),
          overviewClient.get<SuccessEnvelope<EntitlementDashboard>>('/api/entitlements', envHeaders),
          overviewClient.get<SuccessEnvelope<BillingSubscription>>('/api/billing/subscription', envHeaders),
        ])

        if (!active) {
          return
        }

        setSnapshot({
          envId,
          summary: summaryRes.data,
          timeseriesRows: normalizeTimeseriesRows(timeseriesRes.data),
          endpoints: summarizeEndpoints(endpointRes.data.items).slice(0, 8),
          keys: keyRes.data.items,
          entitlements: entitlementRes.data,
          billing: billingRes.data,
        })
      } catch (err) {
        if (active) {
          setError(normalizeApiError(err).userMessage)
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
  const errorRate = useMemo(() => computeErrorRate(snapshot?.timeseriesRows ?? []), [snapshot?.timeseriesRows])
  const rateLimited = useMemo(() => computeRateLimited(snapshot?.timeseriesRows ?? []), [snapshot?.timeseriesRows])

  const totalRequests = snapshot?.summary?.total_requests ?? 0
  const activeKeys = (snapshot?.keys ?? []).filter(
    (key) => key.revoked_at === null && key.status.toLowerCase() !== 'revoked'
  )
  const mostRecentKey = [...activeKeys]
    .sort((a, b) => {
      const aTs = a.last_used_at ? new Date(a.last_used_at).getTime() : 0
      const bTs = b.last_used_at ? new Date(b.last_used_at).getTime() : 0
      return bTs - aTs
    })
    .at(0)
  const isNewUser = activeKeys.length === 0 && totalRequests === 0

  const keyHref = selectedProject ? `/projects/${selectedProject.id}/api-keys` : '/projects'
  const usageHref = selectedProject ? `/projects/${selectedProject.id}/usage` : '/projects'
  const webhooksHref = selectedProject ? `/projects/${selectedProject.id}/webhooks` : '/projects'

  const quota = snapshot?.entitlements?.requests
  const quotaPrimary =
    quota?.limit === null ? 'Unlimited' : quota ? formatNumber(Math.max(0, quota.remaining ?? 0)) : '—'
  const quotaSecondary =
    quota?.limit === null
      ? `Used ${formatNumber(quota.used)} this period`
      : quota
        ? `Used ${formatNumber(quota.used)} / Limit ${formatNumber(quota.limit ?? 0)}`
        : 'Loading quota'

  const billingStatus = snapshot?.billing?.status ?? 'unknown'
  const planName = snapshot?.entitlements?.plan.name ?? 'Unknown'
  const planStatus = snapshot?.entitlements?.plan.status ?? 'unknown'

  if (!selectedProject) {
    return (
      <PageShell title="Overview" description="Developer portal health and next actions.">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          No project selected. Create a project from the Projects page.
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Overview" description="Is it working, are you rate-limited, and what should you do next?">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-zinc-900">Overview</div>
            <Text className="text-sm text-zinc-600">Project: {selectedProject.name}</Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value as 'sandbox' | 'production')}
              className="w-36"
            >
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                color={range === '24h' ? 'dark/zinc' : 'white'}
                onClick={() => {
                  setRange('24h')
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('range', '24h')
                  router.replace(`${pathname}?${params.toString()}`)
                }}
              >
                24h
              </Button>
              <Button
                color={range === '7d' ? 'dark/zinc' : 'white'}
                onClick={() => {
                  setRange('7d')
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('range', '7d')
                  router.replace(`${pathname}?${params.toString()}`)
                }}
              >
                7d
              </Button>
            </div>

            {activeKeys.length === 0 ? (
              <Button href={keyHref} color="dark/zinc">
                Create API key
              </Button>
            ) : (
              <>
                <Button href="https://docs.arche.fi" color="dark/zinc">
                  View docs
                </Button>
                <Button href={keyHref} color="white">
                  Manage keys
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Requests ({range})</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatNumber(totalRequests)}</div>
          <Text className="mt-1 text-xs text-zinc-600">
            Errors: {formatNumber(snapshot?.summary?.total_errors ?? 0)} of {formatNumber(totalRequests)}
          </Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Error rate</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatPercent(errorRate)}</div>
          <Text className="mt-1 text-xs text-zinc-600">Derived from status &gt;= 400 in request buckets.</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Rate-limited</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatNumber(rateLimited.count)}</div>
          <Text className="mt-1 text-xs text-zinc-600">{formatPercent(rateLimited.percent)} of total requests</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Quota remaining</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{quotaPrimary}</div>
          <Text className="mt-1 text-xs text-zinc-600">{quotaSecondary}</Text>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">API Keys</div>
          <Text className="mt-1 text-sm">{formatNumber(activeKeys.length)} active</Text>
          <Text className="mt-1 text-xs text-zinc-600">Last used: {formatDateTime(mostRecentKey?.last_used_at ?? null)}</Text>
          <Button href={keyHref} className="mt-3" color="white">
            Open keys
          </Button>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Usage</div>
          <Text className="mt-1 text-sm">{formatNumber(totalRequests)} requests in selected window</Text>
          <Button href={usageHref} className="mt-3" color="white">
            Inspect usage
          </Button>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Webhooks</div>
          <Text className="mt-1 text-sm">Delivery details are available in project webhooks.</Text>
          <Button href={webhooksHref} className="mt-3" color="white">
            Manage webhooks
          </Button>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-zinc-900">Billing</div>
            <Badge color={planStatus === 'active' || planStatus === 'trialing' ? 'emerald' : 'zinc'}>{planStatus}</Badge>
          </div>
          <Text className="mt-1 text-sm">{planName}</Text>
          <Text className="mt-1 text-xs text-zinc-600">Subscription status: {billingStatus}</Text>
          <Button href="/billing" className="mt-3" color="white">
            Open billing
          </Button>
        </div>
      </section>

      {isNewUser ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Getting started checklist</div>
          <ul className="mt-2 space-y-1 text-sm text-zinc-700">
            <li>1. Create your first API key for {environment}.</li>
            <li>2. Send a test request and confirm a `2xx` response.</li>
            <li>3. Review usage and rate-limit behavior after first traffic.</li>
          </ul>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">{`curl -X GET '${getEnvBaseUrl(environment)}/v1/views/metrics' \\
  -H 'Authorization: Bearer <YOUR_API_KEY>' \\
  -H 'Accept: application/json'`}</pre>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-zinc-900">Requests over time</div>
          <Text className="text-xs text-zinc-600">Environment ID: {snapshot?.envId ?? 'Unavailable'}</Text>
        </div>
        <UsageStackedChart points={chartPoints} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">Top endpoints</div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Route</TableHeader>
              <TableHeader>Requests</TableHeader>
              <TableHeader>Errors</TableHeader>
              <TableHeader>429</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {snapshot?.endpoints.map((row) => (
              <TableRow key={row.route}>
                <TableCell>{row.route}</TableCell>
                <TableCell>{formatNumber(row.requests)}</TableCell>
                <TableCell>{formatNumber(row.errors)}</TableCell>
                <TableCell>{formatNumber(row.rate_limited)}</TableCell>
              </TableRow>
            ))}
            {(snapshot?.endpoints.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No requests yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Recent activity</div>
        <ul className="mt-2 space-y-2 text-sm text-zinc-700">
          <li>
            Most recently used key:{' '}
            {mostRecentKey ? `${mostRecentKey.name ?? mostRecentKey.key_prefix} (${formatDateTime(mostRecentKey.last_used_at)})` : 'None'}
          </li>
          <li>
            Plan status:{' '}
            <span className="font-medium">
              {planName} ({planStatus})
            </span>
          </li>
          <li>
            Support: <a href="/support" className="font-medium text-zinc-900 underline">Support</a> /{' '}
            <a href="https://status.arche.fi" className="font-medium text-zinc-900 underline">
              System status
            </a>
          </li>
        </ul>
      </section>

      {loading ? <div className="text-sm text-zinc-600">Refreshing overview…</div> : null}
      {error ? <div className="text-sm text-amber-700">{error}</div> : null}
    </PageShell>
  )
}

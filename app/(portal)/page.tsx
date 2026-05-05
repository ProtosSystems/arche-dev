'use client'

import { Text } from '@/components/catalyst/text'
import { ConnectionCard } from '@/components/overview/ConnectionCard'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatBillingStatusLabel, formatPlanNameLabel } from '@/components/portal/utils'
import { createApiClient } from '@/lib/api/client'
import type { NormalizedApiError } from '@/lib/api/errors'
import { normalizeApiError } from '@/lib/api/errors'
import type { ControlPlaneApiKeyList, IntegrationHealth, RateLimitState, SuccessEnvelope, UsageSummary } from '@/lib/api/types'
import { Button } from '@/components/catalyst/button'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { IntegrationHealthPanel } from '@/components/overview/IntegrationHealthPanel'

type OverviewSnapshot = {
  summary24h: UsageSummary | null
  health: IntegrationHealth | null
  rateLimitState: RateLimitState | null
  keys: { id: string; name: string; masked_key: string; created_at: string; revoked_at: string | null; last_used_at: string | null }[]
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
  const { accessState, orgContext, selectedEnvironment } = usePortal()
  const [snapshot, setSnapshot] = useState<OverviewSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<NormalizedApiError | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const query24h = new URLSearchParams({ window: '24h' })

        const [summary24hRes, healthRes, rateLimitRes, keysRes] = await Promise.all([
          overviewClient.get<SuccessEnvelope<UsageSummary>>(`/api/usage/summary?${query24h.toString()}`),
          overviewClient.get<SuccessEnvelope<IntegrationHealth>>('/api/integration-health'),
          overviewClient.get<SuccessEnvelope<RateLimitState>>('/api/rate-limit-state'),
          overviewClient.get<SuccessEnvelope<ControlPlaneApiKeyList>>('/api/keys'),
        ])

        if (!active) return

        setSnapshot({
          summary24h: summary24hRes.data,
          health: healthRes.data,
          rateLimitState: rateLimitRes.data,
          keys: keysRes.data.items.map((key) => ({
            id: key.id,
            name: key.name ?? key.masked_key,
            masked_key: key.masked_key,
            created_at: key.created_at,
            revoked_at: key.revoked_at,
            last_used_at: key.last_used_at,
          })),
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
  }, [selectedEnvironment, orgContext?.selected_org_id])

  const stats24h = useMemo(() => statusCountsFromSummary(snapshot?.summary24h ?? null), [snapshot?.summary24h])

  const activeKeys = useMemo(() => (snapshot?.keys ?? []).filter((key) => key.revoked_at === null), [snapshot?.keys])
  const keyCount = activeKeys.length
  const latestKeyUse = useMemo(() => {
    if (activeKeys.length === 0) return null
    const withLastUsed = activeKeys.filter((key) => key.last_used_at)
    if (withLastUsed.length === 0) return null
    return withLastUsed
      .map((key) => key.last_used_at as string)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0]
  }, [activeKeys])
  const requests24h = snapshot?.summary24h?.total_requests ?? 0
  const failed24h = stats24h.error4xx + stats24h.error5xx
  const accessStatus =
    selectedEnvironment === 'production'
      ? accessState?.production_access_status ?? 'inactive'
      : accessState?.sandbox_access_status ?? 'inactive'
  const accessActive =
    selectedEnvironment === 'production'
      ? (accessState?.can_create_production_key ?? false)
      : (accessState?.can_create_sandbox_key ?? false)

  return (
    <PageShell title="Overview" description="Purchase access, create an API key, then make your first successful request.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">Access status</div>
            {!accessState ? (
              <Text className="mt-1 text-sm text-zinc-700">Access status unavailable.</Text>
            ) : accessActive ? (
              <Text className="mt-1 text-sm text-zinc-700">
                Step 1 complete. Plan: {formatPlanNameLabel(accessState.plan_name)}. You can now create an API key.
              </Text>
            ) : (
              <Text className="mt-1 text-sm text-zinc-700">
                Access inactive for {selectedEnvironment} ({formatBillingStatusLabel(accessStatus)}). Resolve billing to continue with API key creation.
              </Text>
            )}
          </div>
          {!accessActive ? (
            <Button color="dark/zinc" href="/billing">
              Go to Billing
            </Button>
          ) : (
            <Link
              href="/billing"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950/2.5 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
            >
              Manage billing
            </Link>
          )}
        </div>
      </section>

      <ConnectionCard hasActiveKey={keyCount > 0} />

      {loading ? <Text className="text-sm text-zinc-600">Refreshing overview…</Text> : null}
      {error ? <ApiErrorNotice error={error} title="Overview data unavailable" /> : null}

      {!error ? (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-900">API Keys</div>
              <Text className="mt-2 text-sm text-zinc-700">Active keys: {keyCount}</Text>
              <Text className="mt-1 text-sm text-zinc-700">Last used: {formatDateTime(latestKeyUse)}</Text>
              <Link href="/keys" className="mt-3 inline-block text-sm font-medium text-zinc-900 underline">
                Manage keys
              </Link>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-900">Usage</div>
              <Text className="mt-2 text-sm text-zinc-700">Requests (24h): {requests24h.toLocaleString()}</Text>
              <Text className="mt-1 text-sm text-zinc-700">Failed requests (24h): {failed24h.toLocaleString()}</Text>
              <Link href="/usage" className="mt-3 inline-block text-sm font-medium text-zinc-900 underline">
                View usage
              </Link>
            </div>
          </section>

          <IntegrationHealthPanel
            health={snapshot?.health ?? null}
            rateLimitState={snapshot?.rateLimitState ?? null}
            keys={snapshot?.keys ?? []}
            apiKeyLimit={accessState?.api_key_limit ?? null}
            apiKeyCount={accessState?.api_key_count ?? 0}
          />
        </>
      ) : null}
    </PageShell>
  )
}

'use client'

import { Button } from '@/components/catalyst/button'
import { Text } from '@/components/catalyst/text'
import { formatDateTime } from '@/components/portal/utils'
import type { APIKey, IntegrationHealth, RateLimitState } from '@/lib/api/types'
import { useState } from 'react'

type IntegrationHealthPanelProps = {
  health: IntegrationHealth | null
  rateLimitState: RateLimitState | null
  keys: APIKey[]
  apiKeyLimit: number | null
  apiKeyCount: number
}

export function IntegrationHealthPanel({
  health,
  rateLimitState,
  keys,
  apiKeyLimit,
  apiKeyCount,
}: IntegrationHealthPanelProps) {
  const [copied, setCopied] = useState(false)
  const latestRequestId = health?.latest_request_id ?? null

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Integration health</div>
          <Text className="mt-1 text-sm text-zinc-600">Only canonical backend data is shown here.</Text>
        </div>
        <Button
          outline
          disabled={!latestRequestId}
          onClick={async () => {
            if (!latestRequestId) return
            await navigator.clipboard.writeText(latestRequestId)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? 'Copied' : 'Copy request ID'}
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">First successful API call</Text>
          <Text className="text-sm text-zinc-900">{formatDateTime(health?.first_successful_api_call_at ?? null)}</Text>
        </div>
        <div className="space-y-1">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Latest request timestamp</Text>
          <Text className="text-sm text-zinc-900">{formatDateTime(health?.latest_request_at ?? null)}</Text>
        </div>
        <div className="space-y-1">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Latest request endpoint</Text>
          <Text className="text-sm text-zinc-900">{health?.latest_request_endpoint ?? 'Not available'}</Text>
        </div>
        <div className="space-y-1">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Latest request status</Text>
          <Text className="text-sm text-zinc-900">
            {typeof health?.latest_request_status === 'number' ? String(health.latest_request_status) : 'Not available'}
          </Text>
        </div>
        <div className="space-y-1">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Latest request ID</Text>
          <Text className="text-sm text-zinc-900">{latestRequestId ?? 'Not available'}</Text>
        </div>
        <div className="space-y-1">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Current quota or rate-limit state</Text>
          <Text className="text-sm text-zinc-900">
            {apiKeyCount}
            {apiKeyLimit === null ? '' : ` / ${apiKeyLimit}`} active API keys
          </Text>
          <Text className="text-xs text-zinc-600">
            {rateLimitState?.limit === null || rateLimitState?.limit === undefined || rateLimitState?.remaining === null || rateLimitState?.remaining === undefined
              ? 'Live runtime rate-limit state not available yet.'
              : `${rateLimitState.remaining} remaining of ${rateLimitState.limit} for ${rateLimitState.current_tier ?? 'unknown'} / ${rateLimitState.current_endpoint_class ?? 'unknown'} (${rateLimitState.backend ?? 'unknown'}) until ${formatDateTime(rateLimitState.reset_at)}`}
          </Text>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Per-key last used</Text>
          <div className="mt-2 space-y-2">
            {keys.length === 0 ? <Text className="text-sm text-zinc-600">No keys yet.</Text> : null}
            {keys.map((key) => (
              <div key={key.id} className="rounded-lg border border-zinc-200 px-3 py-2">
                <Text className="text-sm font-medium text-zinc-900">{key.name}</Text>
                <Text className="text-xs text-zinc-600">{formatDateTime(key.last_used_at)}</Text>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Recent 4xx and 5xx errors</Text>
          <div className="mt-2 space-y-2">
            {(health?.recent_errors.length ?? 0) === 0 ? (
              <Text className="text-sm text-zinc-600">No recent 4xx/5xx errors.</Text>
            ) : null}
            {(health?.recent_errors ?? []).map((item) => (
              <div key={item.request_id} className="rounded-lg border border-zinc-200 px-3 py-2">
                <Text className="text-sm font-medium text-zinc-900">{item.handler}</Text>
                <Text className="text-xs text-zinc-600">
                  {item.status_code} at {formatDateTime(item.requested_at)}
                </Text>
                <Text className="text-xs text-zinc-600">{item.request_id}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

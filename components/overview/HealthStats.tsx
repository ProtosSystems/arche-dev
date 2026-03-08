'use client'

import { Button } from '@/components/catalyst/button'
import { Text } from '@/components/catalyst/text'

export type OverviewRange = '24h' | '7d'

export type HealthSummary = {
  requests: number
  error4xx: number
  error5xx: number
  rateLimited429: number
}

function formatCount(value: number): string {
  return value.toLocaleString()
}

type HealthStatsProps = {
  range: OverviewRange
  onRangeChange: (range: OverviewRange) => void
  summary24h: HealthSummary | null
  summary7d: HealthSummary | null
}

export function HealthStats({ range, onRangeChange, summary24h, summary7d }: HealthStatsProps) {
  const summary = range === '24h' ? summary24h : summary7d
  const requests = summary?.requests ?? 0
  const errors4xx = summary?.error4xx ?? 0
  const errors5xx = summary?.error5xx ?? 0
  const rateLimited429 = summary?.rateLimited429 ?? 0

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-900">Health metrics</div>
        <div className="flex items-center gap-2">
          <Button color={range === '24h' ? 'dark/zinc' : 'white'} onClick={() => onRangeChange('24h')}>
            24h
          </Button>
          <Button color={range === '7d' ? 'dark/zinc' : 'white'} onClick={() => onRangeChange('7d')}>
            7d
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Requests ({range})</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatCount(requests)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">4xx</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatCount(errors4xx)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">5xx</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatCount(errors5xx)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">429 (Rate-limited)</Text>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{formatCount(rateLimited429)}</div>
        </div>
      </div>
    </section>
  )
}

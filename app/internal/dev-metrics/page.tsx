import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { getDevMetricsSnapshot } from '@/lib/dev-metrics/store'
import { isAdminUser, resolveCurrentUserId } from '@/lib/dev-metrics/user'
import { redirect } from 'next/navigation'

function formatMs(value: number | null): string {
  if (value === null) return 'No data'
  const seconds = value / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = seconds / 60
  return `${minutes.toFixed(1)}m`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export default async function InternalDevMetricsPage() {
  const userId = await resolveCurrentUserId()
  if (!isAdminUser(userId)) {
    redirect('/')
  }

  const metrics = getDevMetricsSnapshot()

  return (
    <PageShell title="Developer Metrics" description="Internal developer activation funnel metrics.">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Signups</div>
          <Text className="mt-2 text-2xl font-semibold text-zinc-900">{metrics.signups}</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Keys created</div>
          <Text className="mt-2 text-2xl font-semibold text-zinc-900">{metrics.keys_created}</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Activated developers</div>
          <Text className="mt-2 text-2xl font-semibold text-zinc-900">{metrics.activated_developers}</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Activation rate</div>
          <Text className="mt-2 text-2xl font-semibold text-zinc-900">{formatPercent(metrics.activation_rate)}</Text>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Median time to first call</div>
          <Text className="mt-2 text-sm text-zinc-700">{formatMs(metrics.median_time_to_first_call_ms)}</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Docs to API latency</div>
          <Text className="mt-2 text-sm text-zinc-700">{formatMs(metrics.docs_to_api_latency_ms)}</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Key to first call latency</div>
          <Text className="mt-2 text-sm text-zinc-700">{formatMs(metrics.key_to_call_latency_ms)}</Text>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Failed first call rate</div>
          <Text className="mt-2 text-sm text-zinc-700">{formatPercent(metrics.failed_first_call_rate)}</Text>
        </div>
      </section>
    </PageShell>
  )
}

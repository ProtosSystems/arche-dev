import { Text } from '@/components/catalyst/text'
import type { EntitlementDashboard } from '@/lib/api/types'

function formatNumber(value: number | null): string {
  if (value === null) return 'Unlimited'
  return value.toLocaleString()
}

type EntitlementsCardProps = {
  entitlements: EntitlementDashboard | null
}

export function EntitlementsCard({ entitlements }: EntitlementsCardProps) {
  if (!entitlements) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Quota & Entitlements</div>
        <Text className="mt-2 text-sm text-zinc-600">No data available.</Text>
      </section>
    )
  }

  const requests = entitlements.requests
  const limit = requests.limit
  const used = requests.used
  const remaining = requests.remaining

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-semibold text-zinc-900">Quota & Entitlements</div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Plan</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{entitlements.plan.name}</div>
        </div>
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Included quota</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{formatNumber(limit)}</div>
        </div>
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Used</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{used.toLocaleString()}</div>
        </div>
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Remaining</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{formatNumber(remaining)}</div>
        </div>
      </div>
    </section>
  )
}

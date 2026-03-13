import { Text } from '@/components/catalyst/text'
import type { AccountEntitlements } from '@/lib/api/types'

function formatNumber(value: number | null): string {
  if (value === null) return 'Unlimited'
  return value.toLocaleString()
}

type EntitlementsCardProps = {
  entitlements: AccountEntitlements | null
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

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-sm font-semibold text-zinc-900">Quota & Entitlements</div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Plan</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{entitlements.plan}</div>
        </div>
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">API key limit</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{formatNumber(entitlements.api_key_limit)}</div>
        </div>
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Requests/day limit</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">
            {formatNumber(entitlements.usage_limits.requests_per_day ?? null)}
          </div>
        </div>
        <div>
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Status</Text>
          <div className="mt-1 text-sm font-medium text-zinc-900">{entitlements.status}</div>
        </div>
      </div>
    </section>
  )
}

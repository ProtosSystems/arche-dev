import { Badge } from '@/components/catalyst/badge'
import { Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { BillingActions } from '@/components/billing/BillingActions'
import { fetchDashboardApi } from '@/lib/dashboard-api'
import { entitlements } from '@/lib/mock-data'

type EntitlementsResponse = {
  data?: {
    features?: Array<{ name: string; status: string; detail?: string }>
    datasets?: Array<{ name: string; status: string; detail?: string }>
  }
}

type BillingResponse = {
  data?: {
    status?: string
  }
}

export default async function EntitlementsPage() {
  const [entRes, billingRes] = await Promise.all([
    fetchDashboardApi<EntitlementsResponse>('/api/entitlements'),
    fetchDashboardApi<BillingResponse>('/api/billing/subscription'),
  ])

  const features = entRes.ok ? entRes.data.data?.features || [] : entitlements.features
  const datasets = entRes.ok ? entRes.data.data?.datasets || [] : entitlements.datasets
  const billingStatus = billingRes.ok ? billingRes.data.data?.status || null : null

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Subheading level={2}>Billing</Subheading>
        <Text className="mt-1">Upgrade or manage your current subscription.</Text>
        <div className="mt-4">
          <BillingActions status={billingStatus} />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Subheading level={2}>Features</Subheading>
        <div className="mt-4 space-y-3">
          {features.map((feature) => (
            <div key={feature.name} className="rounded-lg border border-zinc-200 p-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-zinc-900 dark:text-white">{feature.name}</div>
                <Badge color="zinc">{feature.status}</Badge>
              </div>
              <Text className="mt-1">{feature.detail || 'No detail provided.'}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Subheading level={2}>Datasets</Subheading>
        <div className="mt-4 space-y-3">
          {datasets.map((dataset) => (
            <div key={dataset.name} className="rounded-lg border border-zinc-200 p-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-zinc-900 dark:text-white">{dataset.name}</div>
                <Badge color="zinc">{dataset.status}</Badge>
              </div>
              <Text className="mt-1">{dataset.detail || 'No detail provided.'}</Text>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

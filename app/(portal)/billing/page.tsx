'use client'

import { BillingActions } from '@/components/billing/BillingActions'
import { Text } from '@/components/catalyst/text'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { PageShell } from '@/components/portal/PageShell'
import { formatBillingStatusLabel, formatPlanNameLabel } from '@/components/portal/utils'
import { usePortal } from '@/components/portal/PortalProvider'

export default function BillingPage() {
  const { accessState, loadingAccess, accessError } = usePortal()
  const planLabel = formatPlanNameLabel(accessState?.entitlement.plan)
  const billingLabel = formatBillingStatusLabel(accessState?.entitlement.status)
  const showBillingSuffix = planLabel.toLowerCase() !== billingLabel.toLowerCase()

  return (
    <PageShell title="Billing" description="Paddle purchase state synchronized into Arche API canonical entitlement state.">
      {loadingAccess ? <Text className="text-sm text-zinc-600">Loading billing and entitlement data…</Text> : null}

      {accessError ? (
        <ApiErrorNotice
          title="Billing data unavailable"
          error={{
            status: 500,
            code: 'UNKNOWN',
            userMessage: accessError,
            troubleshootingUrl: 'https://docs.arche.fi/troubleshooting/request-ids',
          }}
        />
      ) : null}

      {!accessError && accessState ? (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Plan</div>
            <Text className="mt-1">{`${planLabel}${showBillingSuffix ? ` (${billingLabel})` : ''}`}</Text>
            <Text className="mt-1 text-xs text-zinc-600">Source of truth: Arche API canonical entitlement DB state</Text>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">API key entitlement</div>
            <Text className="mt-1 text-sm">Can create keys: {accessState.can_create_api_keys ? 'Yes' : 'No'}</Text>
            <Text className="mt-1 text-sm">
              Active keys: {accessState.entitlement.active_api_key_count}
              {accessState.entitlement.api_key_limit === null ? '' : ` / ${accessState.entitlement.api_key_limit}`}
            </Text>
            {accessState.reason ? <Text className="mt-1 text-sm text-zinc-600">{accessState.reason}</Text> : null}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Paddle actions</div>
            <Text className="mt-1 text-sm text-zinc-600">Checkout and subscription management are handled by Paddle.</Text>
            <div className="mt-3">
              <BillingActions status={accessState.entitlement.status} showUpgrade={accessState.purchase_required} />
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  )
}

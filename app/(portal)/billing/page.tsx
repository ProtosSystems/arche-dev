'use client'

import { BillingActions } from '@/components/billing/BillingActions'
import { Text } from '@/components/catalyst/text'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { PageShell } from '@/components/portal/PageShell'
import { formatBillingStatusLabel, formatPlanNameLabel } from '@/components/portal/utils'
import { usePortal } from '@/components/portal/PortalProvider'

export default function BillingPage() {
  const { accessState, loadingAccess, accessError, selectedEnvironment } = usePortal()
  const planLabel = formatPlanNameLabel(accessState?.plan_name)
  const billingLabel = formatBillingStatusLabel(
    selectedEnvironment === 'production' ? accessState?.production_access_status : accessState?.sandbox_access_status
  )
  const canCreate =
    selectedEnvironment === 'production'
      ? (accessState?.can_create_production_key ?? false)
      : (accessState?.can_create_sandbox_key ?? false)

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
            <Text className="mt-1">{planLabel}</Text>
            <Text className="mt-1 text-sm text-zinc-700">
              {selectedEnvironment} status: {billingLabel}
            </Text>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Environment access</div>
            <Text className="mt-1 text-sm">Current environment: {selectedEnvironment}</Text>
            <Text className="mt-1 text-sm">Can create keys: {canCreate ? 'Yes' : 'No'}</Text>
            <Text className="mt-1 text-sm">
              Active keys: {accessState.api_key_count}
              {accessState.api_key_limit === null ? '' : ` / ${accessState.api_key_limit}`}
            </Text>
            {accessState.blocked_reason_codes.length > 0 ? (
              <Text className="mt-1 text-sm text-zinc-600">
                Blocking reasons: {accessState.blocked_reason_codes.join(', ')}
              </Text>
            ) : null}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Paddle actions</div>
            <Text className="mt-1 text-sm text-zinc-600">Checkout and subscription management are handled by Paddle.</Text>
            <div className="mt-3">
              <BillingActions status={billingLabel} showUpgrade={!canCreate} />
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  )
}

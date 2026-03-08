'use client'

import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { createApiClient } from '@/lib/api/client'
import type { NormalizedApiError } from '@/lib/api/errors'
import { normalizeApiError } from '@/lib/api/errors'
import type { BillingSubscription, ControlPlaneEnvironmentList, EntitlementDashboard, SuccessEnvelope } from '@/lib/api/types'
import { useEffect, useState } from 'react'

const apiClient = createApiClient({ baseUrl: '', retries: 2 })

export default function BillingPage() {
  const { selectedProject, environment } = usePortal()
  const [entitlements, setEntitlements] = useState<EntitlementDashboard | null>(null)
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [error, setError] = useState<NormalizedApiError | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedProject) {
      setEntitlements(null)
      setSubscription(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const envs = await apiClient.get<SuccessEnvelope<ControlPlaneEnvironmentList>>(
          `/api/projects/${selectedProject.id}/environments`
        )
        const env = envs.data.items.find((item) => item.kind === environment)
        if (!env) {
          if (active) {
            setEntitlements(null)
            setSubscription(null)
            setError({
              status: 422,
              code: 'UNKNOWN',
              userMessage: `No ${environment} environment exists for this project.`,
              troubleshootingUrl: 'https://docs.arche.fi/troubleshooting/request-ids',
            })
          }
          return
        }
        const headers = { 'x-env-id': env.id }

        const [entitlementsRes, subscriptionRes] = await Promise.all([
          apiClient.get<SuccessEnvelope<EntitlementDashboard>>('/api/entitlements', headers),
          apiClient.get<SuccessEnvelope<BillingSubscription>>('/api/billing/subscription', headers),
        ])

        if (!active) {
          return
        }
        setEntitlements(entitlementsRes.data)
        setSubscription(subscriptionRes.data)
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
  }, [selectedProject, environment])

  if (!selectedProject) {
    return (
      <PageShell title="Billing" description="Current plan and subscription status.">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          Select a project to view billing details.
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Billing" description={`Current ${environment} plan and subscription status.`}>
      {loading ? <Text className="text-sm text-zinc-600">Loading billing and entitlement data…</Text> : null}
      {error ? <ApiErrorNotice error={error} title="Billing data unavailable" /> : null}

      {!error && entitlements && subscription ? (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Plan</div>
            <Text className="mt-1">{`${entitlements.plan.name} (${entitlements.plan.status})`}</Text>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Subscription</div>
            <Text className="mt-1">{subscription.status}</Text>
            <Text className="mt-1 text-xs text-zinc-600">
              Current period end:{' '}
              {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleString() : 'N/A'}
            </Text>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Entitlements</div>
            <Text className="mt-1 text-sm">
              Requests: {entitlements.requests.limit === null ? 'Unlimited' : `${entitlements.requests.used} used`}
            </Text>
            <Text className="mt-1 text-sm">
              AI budget:{' '}
              {entitlements.ai_budget
                ? entitlements.ai_budget.limit_usd === null
                  ? 'Unlimited'
                  : `$${entitlements.ai_budget.used_usd} used of $${entitlements.ai_budget.limit_usd}`
                : 'N/A'}
            </Text>
          </section>
        </>
      ) : null}
    </PageShell>
  )
}

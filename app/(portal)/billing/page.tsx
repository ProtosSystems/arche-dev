'use client'

import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { createApiClient } from '@/lib/api/client'
import { normalizeApiError } from '@/lib/api/errors'
import type { BillingSubscription, ControlPlaneEnvironmentList, EntitlementDashboard, SuccessEnvelope } from '@/lib/api/types'
import { useEffect, useState } from 'react'

const apiClient = createApiClient({ baseUrl: '', retries: 2 })

export default function BillingPage() {
  const { selectedProject, environment } = usePortal()
  const [entitlements, setEntitlements] = useState<EntitlementDashboard | null>(null)
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedProject) {
      setEntitlements(null)
      setSubscription(null)
      return
    }

    let active = true
    setError(null)

    const load = async () => {
      try {
        const envs = await apiClient.get<SuccessEnvelope<ControlPlaneEnvironmentList>>(
          `/api/projects/${selectedProject.id}/environments`
        )
        const env = envs.data.items.find((item) => item.kind === environment)
        if (!env) {
          throw new Error(`No ${environment} environment found for selected project`)
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
          setError(normalizeApiError(err).userMessage)
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
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Plan</div>
        <Text className="mt-1">
          {entitlements ? `${entitlements.plan.name} (${entitlements.plan.status})` : 'Loading...'}
        </Text>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Subscription</div>
        <Text className="mt-1">{subscription ? subscription.status : 'Loading...'}</Text>
        <Text className="mt-1 text-xs text-zinc-600">
          Current period end: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleString() : 'N/A'}
        </Text>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Entitlements</div>
        <Text className="mt-1 text-sm">
          Requests: {entitlements?.requests.limit === null ? 'Unlimited' : `${entitlements?.requests.used ?? 0} used`}
        </Text>
        <Text className="mt-1 text-sm">
          AI budget:{' '}
          {entitlements?.ai_budget
            ? entitlements.ai_budget.limit_usd === null
              ? 'Unlimited'
              : `$${entitlements.ai_budget.used_usd} used of $${entitlements.ai_budget.limit_usd}`
            : 'N/A'}
        </Text>
      </section>

      {error ? <Text className="text-sm text-amber-700">{error}</Text> : null}
    </PageShell>
  )
}

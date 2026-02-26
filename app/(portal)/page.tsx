'use client'

import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import { useEffect, useState } from 'react'

type SummaryState = {
  key_count: number
  webhook_count: number
  usage_24h: number
  usage_7d: number
}

export default function DashboardHomePage() {
  const { selectedProject, onboardingComplete } = usePortal()
  const [summary, setSummary] = useState<SummaryState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedProject) {
      setSummary(null)
      return
    }

    portalApi
      .getProjectSummary(selectedProject.id)
      .then((res) => setSummary(res))
      .catch((err) => setError(normalizeApiError(err).userMessage))
  }, [selectedProject])

  if (!selectedProject) {
    return (
      <PageShell title="Dashboard" description="Post-login summary for your selected project.">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          No project selected. Create a project from the Projects page.
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Dashboard" description="Overview of selected project activity and setup status.">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Project</Text>
          <div className="mt-1 text-sm font-semibold">{selectedProject.name}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">API keys</Text>
          <div className="mt-1 text-sm font-semibold">{summary?.key_count ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Usage (24h)</Text>
          <div className="mt-1 text-sm font-semibold">{summary?.usage_24h ?? '—'} requests</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="text-xs uppercase tracking-wide text-zinc-500">Usage (7d)</Text>
          <div className="mt-1 text-sm font-semibold">{summary?.usage_7d ?? '—'} requests</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">Onboarding</div>
          <Badge color={onboardingComplete ? 'emerald' : 'amber'}>{onboardingComplete ? 'Complete' : 'Pending'}</Badge>
        </div>
        <Text className="mt-2">
          {onboardingComplete
            ? 'Your onboarding flow has been completed.'
            : 'Finish onboarding to create a project key and run your first request.'}
        </Text>
        {!onboardingComplete ? (
          <Button href="/onboarding" className="mt-3" color="dark/zinc">
            Continue onboarding
          </Button>
        ) : null}
      </div>

      {error ? <div className="text-sm text-amber-700">{error}</div> : null}
    </PageShell>
  )
}

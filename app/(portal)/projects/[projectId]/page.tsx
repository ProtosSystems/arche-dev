'use client'

import { Badge } from '@/components/catalyst/badge'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Summary = {
  key_count: number
  webhook_count: number
  usage_24h: number
  usage_7d: number
}

export default function ProjectOverviewPage() {
  const params = useParams<{ projectId: string }>()
  const { projects, selectProject, environment } = usePortal()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const project = projects.find((item) => item.id === params.projectId)

  useEffect(() => {
    if (!params.projectId) {
      return
    }
    selectProject(params.projectId)

    portalApi
      .getProjectSummary(params.projectId, environment)
      .then((res) => setSummary(res))
      .catch((err) => setError(normalizeApiError(err).userMessage))
  }, [params.projectId, selectProject, environment])

  return (
    <PageShell title={project?.name ?? 'Project'} description="Project summary and quick links.">
      {!project ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">Project not found.</div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Badge color="zinc">{environment}</Badge>
            <Text className="text-sm text-zinc-600">Created {formatDateTime(project.created_at)}</Text>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <a className="rounded-xl border border-zinc-200 bg-white p-4" href={`/projects/${project.id}/api-keys`}>
              <div className="text-sm font-semibold">API keys</div>
              <Text className="mt-1 text-sm">{summary?.key_count ?? '—'} total keys</Text>
            </a>
            <a className="rounded-xl border border-zinc-200 bg-white p-4" href={`/projects/${project.id}/usage`}>
              <div className="text-sm font-semibold">Usage</div>
              <Text className="mt-1 text-sm">{summary?.usage_24h ?? '—'} requests in 24h</Text>
            </a>
            <a className="rounded-xl border border-zinc-200 bg-white p-4" href={`/projects/${project.id}/webhooks`}>
              <div className="text-sm font-semibold">Webhooks</div>
              <Text className="mt-1 text-sm">{summary?.webhook_count ?? '—'} configured endpoint(s)</Text>
            </a>
          </div>
        </>
      )}

      {error ? <Text className="text-sm text-amber-700">{error}</Text> : null}
    </PageShell>
  )
}

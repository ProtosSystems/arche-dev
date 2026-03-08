'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { getEnvBaseUrl } from '@/components/portal/env'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import type { NormalizedApiError } from '@/lib/api/errors'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import { useMemo, useState } from 'react'

export default function OnboardingPage() {
  const { selectedProject, environment } = usePortal()
  const [keyName, setKeyName] = useState('Quickstart Key')
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [error, setError] = useState<NormalizedApiError | null>(null)
  const [loading, setLoading] = useState(false)

  const curlSnippet = useMemo(() => {
    const key = createdSecret ?? '<YOUR_API_KEY>'
    const baseUrl = getEnvBaseUrl(environment)
    return `curl -X GET ${baseUrl}/v1/views/metrics \\\n  -H "X-Api-Key: ${key}" \\\n  -H "X-Request-ID: quickstart_001" \\\n  -H "Accept: application/json"`
  }, [createdSecret, environment])

  const handleCreateKey = async () => {
    if (!selectedProject) {
      setError({
        status: 422,
        code: 'UNKNOWN',
        userMessage: 'No project context found. Select a project from the header first.',
        troubleshootingUrl: 'https://docs.arche.fi/troubleshooting/request-ids',
      })
      return
    }

    if (!keyName.trim()) {
      setError({
        status: 422,
        code: 'UNKNOWN',
        userMessage: 'API key name is required.',
        troubleshootingUrl: 'https://docs.arche.fi/troubleshooting/request-ids',
      })
      return
    }

    setLoading(true)
    setError(null)
    try {
      const created = await portalApi.createApiKey(selectedProject.id, { name: keyName.trim(), environment })
      setCreatedSecret(created.secret)
    } catch (err) {
      setError(normalizeApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Onboarding" description="Sign in, create a key, and make your first successful API call.">
      <ol className="space-y-4">
        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">1. Confirm project context (required for key creation)</div>
          <Text className="mt-2 text-sm text-zinc-700">
            Selected project: <span className="font-medium text-zinc-900">{selectedProject?.name ?? 'None selected'}</span>
          </Text>
          <Text className="mt-1 text-xs text-zinc-600">
            Use the header selector to switch to an existing project. API keys are environment-scoped under a project.
          </Text>
        </li>

        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">2. Create API key ({environment})</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500">Key name</Text>
              <Input value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="Quickstart Key" />
            </div>
            <Button color="dark/zinc" disabled={loading || !selectedProject} onClick={handleCreateKey}>
              Create API key
            </Button>
          </div>
          {createdSecret ? (
            <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <div className="font-semibold">Copy once</div>
              <code className="mt-1 block break-all">{createdSecret}</code>
            </div>
          ) : null}
        </li>

        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">3. Run first API call</div>
          <Text className="mt-2 text-xs text-zinc-600">
            This request uses the canonical external auth path: <code>X-Api-Key</code>.
          </Text>
          <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-100">{curlSnippet}</pre>
        </li>

        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">4. Continue in docs</div>
          <a
            className="mt-2 inline-block text-sm text-blue-700 hover:underline"
            href="https://docs.arche.fi/quickstart"
            target="_blank"
            rel="noreferrer"
          >
            Open docs quickstart
          </a>
          <a
            className="mt-2 block text-sm text-blue-700 hover:underline"
            href="https://docs.arche.fi/python_sdk"
            target="_blank"
            rel="noreferrer"
          >
            Open Python SDK guide
          </a>
        </li>
      </ol>

      {error ? <ApiErrorNotice error={error} title="Onboarding action failed" /> : null}
    </PageShell>
  )
}

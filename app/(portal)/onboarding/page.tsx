'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { getEnvBaseUrl } from '@/components/portal/env'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import { useMemo, useState } from 'react'

export default function OnboardingPage() {
  const { selectedProject, setOnboardingComplete, onboardingComplete, createProject, environment } = usePortal()
  const projectCreationEnabled = false
  const [projectName, setProjectName] = useState('')
  const [keyName, setKeyName] = useState('Getting Started Key')
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const curlSnippet = useMemo(() => {
    const key = createdSecret ?? '<YOUR_API_KEY>'
    const baseUrl = getEnvBaseUrl(environment)
    return `curl -X POST ${baseUrl}/v1/models/infer \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"core-v1","input":"hello world"}'`
  }, [createdSecret, environment])

  const handleCreateProject = async () => {
    if (!projectCreationEnabled) {
      setError('Project creation is currently disabled in this portal.')
      return
    }

    if (!projectName.trim()) {
      setError('Project name is required.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await createProject(projectName.trim())
      setProjectName('')
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!selectedProject) {
      setError('Create or select a project first.')
      return
    }

    if (!keyName.trim()) {
      setError('API key name is required.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const created = await portalApi.createApiKey(selectedProject.id, { name: keyName.trim(), environment })
      setCreatedSecret(created.secret)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Onboarding" description="Complete the minimal golden path to start integrating.">
      <ol className="space-y-4">
        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">1. Create or select project</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500">Project name</Text>
              <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="My App" />
            </div>
            <Button color="dark/zinc" disabled={loading || !projectCreationEnabled} onClick={handleCreateProject}>
              Create project
            </Button>
          </div>
          {!projectCreationEnabled ? (
            <Text className="mt-2 text-xs text-zinc-600">Project creation is currently managed outside this portal.</Text>
          ) : null}
          <Text className="mt-2 text-xs">Selected project: {selectedProject?.name ?? 'None'}</Text>
        </li>

        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">2. Create API key ({environment})</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500">Key name</Text>
              <Input value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="Server key" />
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
          <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-100">{curlSnippet}</pre>
        </li>

        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">4. Read docs</div>
          <a className="mt-2 inline-block text-sm text-blue-700 hover:underline" href="https://docs.arche.fi" target="_blank">
            Open API docs
          </a>
        </li>
      </ol>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Completion</div>
        <Text className="mt-1 text-sm">Mark onboarding complete once project, key, and first call are done.</Text>
        <div className="mt-3 flex items-center gap-2">
          <Button color="dark/zinc" onClick={() => setOnboardingComplete(true)}>
            Mark complete
          </Button>
          {onboardingComplete ? <Text className="text-sm text-emerald-700">Completed</Text> : null}
        </div>
      </div>

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </PageShell>
  )
}

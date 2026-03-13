'use client'

import { BillingActions } from '@/components/billing/BillingActions'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatBillingStatusLabel } from '@/components/portal/utils'
import type { NormalizedApiError } from '@/lib/api/errors'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import { useEffect, useMemo, useState } from 'react'

export default function OnboardingPage() {
  const { accessState, refreshAccess } = usePortal()
  const [keyName, setKeyName] = useState('Quickstart Key')
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [error, setError] = useState<NormalizedApiError | null>(null)
  const [loading, setLoading] = useState(false)

  const canCreate = accessState?.can_create_api_keys ?? false

  useEffect(() => {
    void fetch('/api/internal/dev-metrics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'docs_quickstart_viewed' }),
    }).catch(() => undefined)
  }, [])

  const curlSnippet = useMemo(() => {
    const key = createdSecret ?? '<YOUR_API_KEY>'
    return `curl https://api.arche.fi/v1/edgar/companies/AAPL \\\n  -H "X-Api-Key: ${key}"`
  }, [createdSecret])

  const handleCreateKey = async () => {
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
      const created = await portalApi.createApiKey({ name: keyName.trim() })
      setCreatedSecret(created.secret)
      await refreshAccess()
    } catch (err) {
      setError(normalizeApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Onboarding" description="Sign in, verify entitlement, create a key, and make your first successful API call.">
      <ol className="space-y-4">
        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">1. Check account access</div>
          <Text className="mt-2 text-sm text-zinc-700">
            Arche API canonical entitlement status:{' '}
            <span className="font-medium text-zinc-900">
              {formatBillingStatusLabel(accessState?.entitlement.status)}
            </span>
          </Text>
          {!canCreate ? (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="font-semibold">2. Inactive entitlement: complete Paddle purchase</div>
              <div className="mt-1">{accessState?.reason ?? 'Your entitlement is not active yet.'}</div>
              <div className="mt-3">
                <BillingActions status={accessState?.entitlement.status ?? null} showUpgrade />
              </div>
            </div>
          ) : (
            <Text className="mt-2 text-xs text-emerald-700">Entitlement is active. You can create an API key now.</Text>
          )}
        </li>

        <li className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">3. Active entitlement: create API key</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div>
              <Text className="text-xs uppercase tracking-wide text-zinc-500">Key name</Text>
              <Input value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="Quickstart Key" />
            </div>
            <Button color="dark/zinc" disabled={loading || !canCreate} onClick={handleCreateKey}>
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
          <div className="text-sm font-semibold">4. Copy example request and run it</div>
          <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-100">{curlSnippet}</pre>
          <div className="mt-3">
            <a
              className="text-sm font-medium text-zinc-900 underline dark:text-[var(--protos-mist-300)]"
              href="https://docs.arche.fi/sdks/python"
              target="_blank"
              rel="noreferrer"
            >
              Use the Python SDK
            </a>
          </div>
        </li>
      </ol>

      {error ? <ApiErrorNotice error={error} title="Onboarding action failed" /> : null}
    </PageShell>
  )
}

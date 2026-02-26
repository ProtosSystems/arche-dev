'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { WebhookDelivery, WebhookEndpoint } from '@/lib/api/types'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function ProjectWebhooksPage() {
  const params = useParams<{ projectId: string }>()
  const [webhook, setWebhook] = useState<WebhookEndpoint | null>(null)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [url, setUrl] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [hooks, rows] = await Promise.all([
        portalApi.listWebhooks(params.projectId),
        portalApi.listWebhookDeliveries(params.projectId),
      ])

      const endpoint = hooks[0] ?? null
      setWebhook(endpoint)
      setUrl(endpoint?.url ?? '')
      setEnabled(endpoint?.enabled ?? true)
      setDeliveries(rows)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    }
  }, [params.projectId])

  useEffect(() => {
    load()
  }, [load])

  const onSave = async () => {
    if (!url.trim()) {
      setError('Webhook URL is required.')
      return
    }

    setBusy(true)
    setError(null)
    setNewSecret(null)

    try {
      const saved = await portalApi.upsertWebhook(params.projectId, { url: url.trim(), enabled })
      setWebhook(saved)
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  const onRegenerate = async () => {
    if (!webhook) {
      setError('Create webhook endpoint first.')
      return
    }

    setBusy(true)
    setError(null)

    try {
      const res = await portalApi.regenerateWebhookSecret(params.projectId, webhook.id)
      setNewSecret(res.secret)
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Webhooks" description="Configure endpoint and inspect recent delivery attempts.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Text className="text-xs uppercase tracking-wide text-zinc-500">Endpoint URL</Text>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://your-app.com/webhooks" />
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              Enabled
            </label>
            <Button color="dark/zinc" disabled={busy} onClick={onSave}>
              Save endpoint
            </Button>
            <Button plain disabled={busy || !webhook} onClick={onRegenerate}>
              Regenerate secret
            </Button>
          </div>
        </div>

        {webhook ? (
          <Text className="mt-2 text-sm text-zinc-600">Current secret prefix: {webhook.secret_prefix}</Text>
        ) : (
          <Text className="mt-2 text-sm text-zinc-600">No endpoint configured yet.</Text>
        )}

        {newSecret ? (
          <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <div className="font-semibold">Copy once</div>
            <code className="mt-1 block break-all">{newSecret}</code>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 text-sm font-semibold">Recent deliveries</div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Timestamp</TableHeader>
              <TableHeader>Event</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Retries</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>{formatDateTime(delivery.ts)}</TableCell>
                <TableCell>{delivery.event}</TableCell>
                <TableCell>{delivery.status}</TableCell>
                <TableCell>{delivery.retries}</TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No delivery records yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </PageShell>
  )
}

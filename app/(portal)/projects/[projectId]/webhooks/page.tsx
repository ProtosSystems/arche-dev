'use client'

import { Button } from '@/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/catalyst/dialog'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { WebhookDelivery, WebhookEndpoint } from '@/lib/api/types'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function ProjectWebhooksPage() {
  const params = useParams<{ projectId: string }>()
  const { environment } = usePortal()
  const [webhook, setWebhook] = useState<WebhookEndpoint | null>(null)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'fail'>('all')
  const [url, setUrl] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [ackSecret, setAckSecret] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [hooks, rows] = await Promise.all([
        portalApi.listWebhooks(params.projectId, environment),
        portalApi.listWebhookDeliveries(params.projectId, environment, statusFilter),
      ])

      const endpoint = hooks[0] ?? null
      setWebhook(endpoint)
      setUrl(endpoint?.url ?? '')
      setEnabled(endpoint?.enabled ?? true)
      setDeliveries(rows)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    }
  }, [params.projectId, environment, statusFilter])

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

    try {
      const saved = await portalApi.upsertWebhook(params.projectId, { url: url.trim(), enabled, environment })
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
      const res = await portalApi.regenerateWebhookSecret(params.projectId, webhook.id, environment)
      setNewSecret(res.secret)
      setAckSecret(false)
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Webhooks" description={`Configure ${environment} endpoint and inspect deliveries.`}>
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
              Rotate secret
            </Button>
          </div>
        </div>

        {webhook ? (
          <Text className="mt-2 text-sm text-zinc-600">Current secret prefix: {webhook.secret_prefix}</Text>
        ) : (
          <Text className="mt-2 text-sm text-zinc-600">No endpoint configured yet.</Text>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Recent deliveries</div>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'success' | 'fail')}>
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="fail">Fail</option>
          </Select>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Timestamp</TableHeader>
              <TableHeader>Event</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Attempts</TableHeader>
              <TableHeader>Last Error</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>{formatDateTime(delivery.ts)}</TableCell>
                <TableCell>{delivery.event_type}</TableCell>
                <TableCell>{delivery.status}</TableCell>
                <TableCell>{delivery.attempts}</TableCell>
                <TableCell>{delivery.last_error ?? '—'}</TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No delivery records for this filter.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      <Dialog open={Boolean(newSecret)} onClose={() => undefined} size="xl">
        <DialogTitle>Copy webhook secret now</DialogTitle>
        <DialogDescription>Webhook signing secret is shown once and cannot be retrieved later.</DialogDescription>
        <DialogBody>
          <code className="block break-all rounded bg-zinc-950 p-3 text-xs text-zinc-100">{newSecret ?? ''}</code>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={ackSecret} onChange={(event) => setAckSecret(event.target.checked)} />
            I stored this secret in a secure location.
          </label>
        </DialogBody>
        <DialogActions>
          <Button color="dark/zinc" onClick={() => setNewSecret(null)} disabled={!ackSecret}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </PageShell>
  )
}

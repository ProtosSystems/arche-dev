'use client'

import { BillingActions } from '@/components/billing/BillingActions'
import { Button } from '@/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/catalyst/dialog'
import { Input } from '@/components/catalyst/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { ApiErrorNotice } from '@/components/portal/ApiErrorNotice'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatBillingStatusLabel, formatDateTime } from '@/components/portal/utils'
import type { NormalizedApiError } from '@/lib/api/errors'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { APIKey } from '@/lib/api/types'
import { DocumentDuplicateIcon } from '@heroicons/react/20/solid'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function KeysPage() {
  const { accessState, refreshAccess } = usePortal()
  const [keys, setKeys] = useState<APIKey[]>([])
  const [name, setName] = useState('')
  const [secret, setSecret] = useState<string | null>(null)
  const [error, setError] = useState<NormalizedApiError | null>(null)
  const [busy, setBusy] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [ackSecret, setAckSecret] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<APIKey | null>(null)

  const canCreate = accessState?.can_create_api_keys ?? false

  const load = useCallback(async () => {
    try {
      const list = await portalApi.listApiKeys()
      setKeys(list)
    } catch (err) {
      setError(normalizeApiError(err))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const limitText = useMemo(() => {
    const limit = accessState?.entitlement.api_key_limit ?? null
    const active = accessState?.entitlement.active_api_key_count ?? 0
    if (limit === null) {
      return `${active} active keys (no plan limit reported)`
    }
    return `${active}/${limit} active keys`
  }, [accessState])

  const onCreate = async () => {
    if (!name.trim()) {
      setError({
        status: 422,
        code: 'UNKNOWN',
        userMessage: 'API key name is required.',
        troubleshootingUrl: 'https://docs.arche.fi/troubleshooting/request-ids',
      })
      return
    }

    setBusy(true)
    setError(null)
    setSecret(null)

    try {
      const created = await portalApi.createApiKey({ name: name.trim() })
      setSecret(created.secret)
      setAckSecret(false)
      setCopiedSecret(false)
      setName('')
      setOpenCreate(false)
      await Promise.all([load(), refreshAccess()])
    } catch (err) {
      setError(normalizeApiError(err))
    } finally {
      setBusy(false)
    }
  }

  const onConfirmRevoke = async () => {
    if (!revokeTarget) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      await portalApi.revokeApiKey(revokeTarget.id)
      setRevokeTarget(null)
      await Promise.all([load(), refreshAccess()])
    } catch (err) {
      setError(normalizeApiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell
      title="API Keys"
      description="Step 2: create an API key after purchase, then use it in your first request. Secret values are shown once at creation."
    >
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Key eligibility</div>
        <div className="mt-1 text-sm text-zinc-700">
          Entitlement status: {formatBillingStatusLabel(accessState?.entitlement.status)}
        </div>
        <div className="mt-1 text-sm text-zinc-700">{limitText}</div>

        {!canCreate ? (
          <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="font-medium">API key creation is currently gated</div>
            <div>{accessState?.reason ?? 'Step 1 is required first. Purchase access before creating an API key.'}</div>
            <BillingActions status={accessState?.entitlement.status ?? null} showUpgrade />
          </div>
        ) : (
          <div className="mt-3">
            <Button color="dark/zinc" onClick={() => setOpenCreate(true)} disabled={busy}>
              Create API key
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Masked key</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Last used</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.name}</TableCell>
                <TableCell>{key.masked_key}</TableCell>
                <TableCell>{formatDateTime(key.created_at)}</TableCell>
                <TableCell>{formatDateTime(key.last_used_at)}</TableCell>
                <TableCell>{key.revoked_at ? 'Revoked' : 'Active'}</TableCell>
                <TableCell>
                  <Button plain disabled={busy || Boolean(key.revoked_at)} onClick={() => setRevokeTarget(key)}>
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No keys yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} size="lg">
        <DialogTitle>Create API Key</DialogTitle>
        <DialogDescription>Keys are created directly under your Arche account/org entitlement.</DialogDescription>
        <DialogBody>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Backend key" />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setOpenCreate(false)}>
            Cancel
          </Button>
          <Button color="dark/zinc" onClick={onCreate} disabled={busy || !canCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(secret)} onClose={() => undefined} size="xl">
        <DialogTitle>Copy your API key now</DialogTitle>
        <DialogDescription>
          This full key is displayed once and cannot be retrieved again after this dialog closes.
        </DialogDescription>
        <DialogBody>
          <div className="flex items-start gap-2">
            <code className="block flex-1 break-all rounded bg-zinc-950 p-3 text-xs text-zinc-100">{secret ?? ''}</code>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-white/15 dark:bg-transparent dark:text-zinc-100 dark:hover:border-white/25 dark:hover:text-white"
              onClick={async () => {
                if (!secret) return
                await navigator.clipboard.writeText(secret)
                setCopiedSecret(true)
                window.setTimeout(() => setCopiedSecret(false), 1200)
              }}
              aria-label="Copy API key"
            >
              <DocumentDuplicateIcon className="size-4" />
              {copiedSecret ? 'Copied' : 'Copy'}
            </button>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={ackSecret} onChange={(event) => setAckSecret(event.target.checked)} />
            I have copied this key to a secure location.
          </label>
          <div className="mt-4">
            <a
              className="text-sm font-medium text-zinc-900 underline dark:text-[var(--protos-mist-300)]"
              href="https://docs.arche.fi/sdks/python"
              target="_blank"
              rel="noreferrer"
            >
              Next: use this key with the Python SDK
            </a>
          </div>
        </DialogBody>
        <DialogActions>
          <Button color="dark/zinc" onClick={() => setSecret(null)} disabled={!ackSecret}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(revokeTarget)} onClose={() => setRevokeTarget(null)} size="lg">
        <DialogTitle>Revoke API Key</DialogTitle>
        <DialogDescription>
          This will disable key `{revokeTarget?.masked_key}` immediately. This action cannot be undone.
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setRevokeTarget(null)}>
            Cancel
          </Button>
          <Button color="dark/zinc" onClick={onConfirmRevoke} disabled={busy}>
            Confirm revoke
          </Button>
        </DialogActions>
      </Dialog>

      {error ? <ApiErrorNotice error={error} title="API key operation failed" /> : null}
    </PageShell>
  )
}

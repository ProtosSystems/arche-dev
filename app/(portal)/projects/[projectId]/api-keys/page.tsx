'use client'

import { Button } from '@/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/catalyst/dialog'
import { Input } from '@/components/catalyst/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { APIKey } from '@/lib/api/types'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function ProjectApiKeysPage() {
  const params = useParams<{ projectId: string }>()
  const { environment } = usePortal()
  const [keys, setKeys] = useState<APIKey[]>([])
  const [name, setName] = useState('')
  const [secret, setSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [ackSecret, setAckSecret] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<APIKey | null>(null)

  const load = useCallback(async () => {
    try {
      const list = await portalApi.listApiKeys(params.projectId, environment)
      setKeys(list)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    }
  }, [params.projectId, environment])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async () => {
    if (!name.trim()) {
      setError('API key name is required.')
      return
    }

    setBusy(true)
    setError(null)
    setSecret(null)

    try {
      const created = await portalApi.createApiKey(params.projectId, { name: name.trim(), environment })
      setSecret(created.secret)
      setAckSecret(false)
      setName('')
      setOpenCreate(false)
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
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
      await portalApi.revokeApiKey(params.projectId, revokeTarget.id, environment)
      setRevokeTarget(null)
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="API Keys" description={`Manage ${environment} keys. Secret values are shown once.`}>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <Button color="dark/zinc" onClick={() => setOpenCreate(true)} disabled={busy}>
          Create key
        </Button>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Prefix</TableHeader>
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
                <TableCell>{key.prefix}</TableCell>
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
                <TableCell colSpan={6}>No keys yet for {environment}.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} size="lg">
        <DialogTitle>Create API Key</DialogTitle>
        <DialogDescription>This key will be created for the current environment: {environment}.</DialogDescription>
        <DialogBody>
          <label className="text-xs uppercase tracking-wide text-zinc-500">Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Backend key" />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setOpenCreate(false)}>
            Cancel
          </Button>
          <Button color="dark/zinc" onClick={onCreate} disabled={busy}>
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
          <code className="block break-all rounded bg-zinc-950 p-3 text-xs text-zinc-100">{secret ?? ''}</code>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={ackSecret} onChange={(event) => setAckSecret(event.target.checked)} />
            I have copied this key to a secure location.
          </label>
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
          This will disable key `{revokeTarget?.prefix}` in {environment}. This action cannot be undone.
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

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </PageShell>
  )
}

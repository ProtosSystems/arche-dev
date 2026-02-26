'use client'

import { Button } from '@/components/catalyst/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/catalyst/dialog'
import { Input } from '@/components/catalyst/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { APIKey } from '@/lib/api/types'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function ProjectApiKeysPage() {
  const params = useParams<{ projectId: string }>()
  const [keys, setKeys] = useState<APIKey[]>([])
  const [name, setName] = useState('Default key')
  const [secret, setSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const list = await portalApi.listApiKeys(params.projectId)
      setKeys(list)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    }
  }, [params.projectId])

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
      const created = await portalApi.createApiKey(params.projectId, { name: name.trim() })
      setSecret(created.secret)
      setName('')
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  const onRevoke = async (keyId: string) => {
    setBusy(true)
    setError(null)

    try {
      await portalApi.revokeApiKey(params.projectId, keyId)
      await load()
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="API Keys" description="Create and revoke API keys. Secret values are shown once.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Text className="text-xs uppercase tracking-wide text-zinc-500">Name</Text>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Backend key" />
          </div>
          <Button color="dark/zinc" onClick={onCreate} disabled={busy}>
            Create key
          </Button>
        </div>
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
                  <Button plain disabled={busy || Boolean(key.revoked_at)} onClick={() => onRevoke(key.id)}>
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

      <Dialog open={Boolean(secret)} onClose={() => setSecret(null)} size="xl">
        <DialogTitle>Copy your API key now</DialogTitle>
        <DialogDescription>
          This full key is displayed once and cannot be retrieved again after this dialog closes.
        </DialogDescription>
        <DialogBody>
          <code className="block break-all rounded bg-zinc-950 p-3 text-xs text-zinc-100">{secret ?? ''}</code>
        </DialogBody>
        <DialogActions>
          <Button color="dark/zinc" onClick={() => setSecret(null)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </PageShell>
  )
}

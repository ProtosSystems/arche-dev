'use client'

import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { useMemo, useState, useTransition } from 'react'

type ApiKey = {
  id: string
  env_id: string
  key_prefix: string
  status: string
  scopes: string[]
  name: string | null
  created_at: string
  revoked_at: string | null
  last_used_at: string | null
}

type EnvOption = { id: string; name: string }

type Props = {
  envs: EnvOption[]
  initialEnvId: string | null
  initialKeys: ApiKey[]
  error?: string | null
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString()
}

export function ApiKeysClient({ envs, initialEnvId, initialKeys, error }: Props) {
  const [envId, setEnvId] = useState(initialEnvId || envs[0]?.id || '')
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState('usage:read')
  const [isPending, startTransition] = useTransition()
  const hasEnv = Boolean(envId)

  const scopeList = useMemo(
    () =>
      scopes
        .split(',')
        .map((scope) => scope.trim())
        .filter(Boolean),
    [scopes]
  )

  const refreshKeys = async (targetEnvId: string) => {
    if (!targetEnvId) return
    const res = await fetch(`/api/keys?env_id=${targetEnvId}`)
    if (!res.ok) return
    const json = await res.json()
    setKeys(json.data.items || [])
  }

  const handleCreate = () => {
    if (!envId) return
    startTransition(async () => {
      setRawKey(null)
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env_id: envId, name: name || null, scopes: scopeList }),
      })
      if (!res.ok) return
      const json = await res.json()
      setRawKey(json.data.raw_key)
      setName('')
      await refreshKeys(envId)
    })
  }

  const handleRevoke = (keyId: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/keys/${keyId}/revoke`, { method: 'POST' })
      if (!res.ok) return
      await refreshKeys(envId)
    })
  }

  const handleEnvChange = (value: string) => {
    setEnvId(value)
    startTransition(async () => {
      await refreshKeys(value)
    })
  }

  return (
    <div className="space-y-10">
      {error && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="font-semibold">API keys are unavailable.</div>
          <div className="mt-2">{error}</div>
        </section>
      )}

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">Create API key</div>
            <Text className="mt-1">Generate a scoped key. The raw key is shown once.</Text>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
            <div className="min-w-[200px]">
              <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Environment</label>
              <Select
                value={envId}
                onChange={(event) => handleEnvChange(event.target.value)}
                disabled={!hasEnv || isPending}
              >
                {envs.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[200px]">
              <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Production" />
            </div>
            <div className="min-w-[220px]">
              <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Scopes</label>
              <Input
                value={scopes}
                onChange={(event) => setScopes(event.target.value)}
                placeholder="usage:read, control_plane:read"
              />
            </div>
            <div className="sm:col-span-3 flex justify-start">
              <Button color="dark/zinc" onClick={handleCreate} disabled={!hasEnv || isPending}>
                Create key
              </Button>
            </div>
          </div>
        </div>

        {rawKey && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            <div className="font-semibold">New API key (shown once)</div>
            <div className="mt-2 font-mono break-all">{rawKey}</div>
            <div className="mt-2 text-xs">Store this in a secret manager. It will not be shown again.</div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Key ID</TableHeader>
              <TableHeader>Scopes</TableHeader>
              <TableHeader>Last Used</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <div className="font-semibold text-zinc-950 dark:text-white">{key.name || 'Untitled key'}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Created {formatDate(key.created_at)}</p>
                </TableCell>
                <TableCell>{key.key_prefix}</TableCell>
                <TableCell>{key.scopes.join(', ') || '—'}</TableCell>
                <TableCell>{formatDate(key.last_used_at)}</TableCell>
                <TableCell>
                  <Badge color={key.status === 'active' ? 'emerald' : 'amber'}>{key.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button plain disabled={isPending || key.status === 'revoked'} onClick={() => handleRevoke(key.id)}>
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {keys.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No API keys available for this environment.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Text } from '@/components/catalyst/text'
import { useEffect, useState, useTransition } from 'react'

type Org = { id: string; name: string }

type Mode = 'loading' | 'ready' | 'needsOrgId' | 'error'

export function OrgSelector() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [inputOrgId, setInputOrgId] = useState('')
  const [mode, setMode] = useState<Mode>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const load = async () => {
      try {
        const contextRes = await fetch('/api/org-context')
        let contextOrgId: string | null = null
        if (contextRes.ok) {
          const json = await contextRes.json()
          contextOrgId = json.org_id
          setCurrentOrgId(json.org_id)
          setInputOrgId(json.org_id || '')
        }

        const orgsRes = await fetch('/api/orgs')
        if (orgsRes.status === 409) {
          setMode('needsOrgId')
          setMessage('Multiple orgs detected. Enter an org id to continue.')
          return
        }
        if (!orgsRes.ok) {
          const err = await orgsRes.json().catch(() => null)
          setMode('error')
          setMessage(err?.error?.message || 'Unable to load orgs')
          return
        }
        const orgsJson = await orgsRes.json()
        const items = orgsJson.data?.items || []
        setOrgs(items)
        if (items.length > 0) {
          const id = contextOrgId || items[0].id
          setCurrentOrgId(id)
          setInputOrgId(id)
        }
        setMode('ready')
      } catch {
        setMode('error')
        setMessage('Unable to load org context')
      }
    }

    load()
  }, [])

  const applyOrgId = (orgId: string) => {
    if (!orgId) return
    startTransition(async () => {
      const res = await fetch('/api/org-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId }),
      })
      if (res.ok) {
        window.location.reload()
      } else {
        const err = await res.json().catch(() => null)
        setMessage(err?.error?.message || 'Failed to set org context')
      }
    })
  }

  if (mode === 'loading') {
    return <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">Loading org context...</div>
  }

  if (mode === 'needsOrgId') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
        <div className="font-semibold">Organization required</div>
        <Text className="mt-1 text-xs">{message}</Text>
        <div className="mt-2 flex items-center gap-2">
          <Input value={inputOrgId} onChange={(event) => setInputOrgId(event.target.value)} placeholder="org uuid" />
          <Button color="dark/zinc" onClick={() => applyOrgId(inputOrgId)} disabled={isPending}>
            Set
          </Button>
        </div>
      </div>
    )
  }

  if (mode === 'error') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
        {message || 'Org context unavailable'}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
      <span className="uppercase tracking-wide text-zinc-400">Org</span>
      {orgs.length > 1 ? (
        <Select
          className="before:hidden [&_select]:!border-0 [&_select]:!shadow-none [&_select]:!bg-transparent"
          value={currentOrgId || ''}
          onChange={(event) => applyOrgId(event.target.value)}
          disabled={isPending}
        >
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
      ) : (
        <span className="font-semibold">{orgs[0]?.name || currentOrgId || 'Unknown'}</span>
      )}
    </div>
  )
}

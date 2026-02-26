'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Subheading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { useEffect, useState, useTransition } from 'react'

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/workspace-settings')
      if (!res.ok) return
      const payload = await res.json().catch(() => null)
      setWorkspaceName(payload?.workspace_name || '')
    }

    load()
  }, [])

  const save = () => {
    startTransition(async () => {
      setMessage(null)
      const res = await fetch('/api/workspace-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_name: workspaceName }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(payload?.error?.message || 'Failed to save settings.')
        return
      }
      window.dispatchEvent(
        new CustomEvent('workspace-name-updated', {
          detail: { workspaceName },
        })
      )
      setMessage('Saved.')
    })
  }

  return (
    <div className="space-y-8">
      <section>
        <Subheading level={2}>Workspace Settings</Subheading>
        <Text className="mt-1">Set shared defaults for this dashboard workspace.</Text>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <label className="text-xs uppercase tracking-wide text-zinc-500">Workspace Name</label>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <Input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} />
          <Button color="dark/zinc" onClick={save} disabled={isPending}>
            Save
          </Button>
        </div>
        {message && <Text className="mt-2 text-sm text-amber-700">{message}</Text>}
      </section>
    </div>
  )
}

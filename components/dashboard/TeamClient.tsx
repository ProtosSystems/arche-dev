'use client'

import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { useState, useTransition } from 'react'

type TeamMember = {
  id: string
  email: string
  role: string
  status: string
  invited_at?: string | null
}

type Props = {
  initialMembers: TeamMember[]
  error?: string | null
}

export function TeamClient({ initialMembers, error }: Props) {
  const [members, setMembers] = useState(initialMembers)
  const [invitee, setInvitee] = useState('')
  const [role, setRole] = useState('viewer')
  const [message, setMessage] = useState<string | null>(error || null)
  const [isPending, startTransition] = useTransition()

  const refresh = async () => {
    const res = await fetch('/api/team/members')
    if (!res.ok) return
    const json = await res.json()
    setMembers(json.data?.items || [])
  }

  const invite = () => {
    if (!invitee.trim()) {
      setMessage('Email is required.')
      return
    }

    startTransition(async () => {
      setMessage(null)
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invitee.trim(), role }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        setMessage(payload?.error?.message || 'Failed to invite member.')
        return
      }
      setInvitee('')
      await refresh()
    })
  }

  const remove = (memberId: string) => {
    startTransition(async () => {
      setMessage(null)
      const res = await fetch(`/api/team/members/${memberId}/remove`, { method: 'POST' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        setMessage(payload?.error?.message || 'Failed to remove member.')
        return
      }
      await refresh()
    })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="text-sm font-semibold">Invite member</div>
        <Text className="mt-1">Invite a user to this organization.</Text>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 sm:items-end">
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Email</label>
            <Input value={invitee} onChange={(event) => setInvitee(event.target.value)} placeholder="user@company.com" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-zinc-500">Role</label>
            <select
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <Button color="dark/zinc" onClick={invite} disabled={isPending}>
            Send invite
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <Badge color={member.status === 'active' ? 'emerald' : 'zinc'}>{member.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button plain disabled={isPending} onClick={() => remove(member.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No members found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {message && <Text className="text-sm text-amber-700">{message}</Text>}
    </div>
  )
}

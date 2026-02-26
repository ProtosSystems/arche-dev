'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Textarea } from '@/components/catalyst/textarea'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { useState } from 'react'

export default function SupportPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [issue, setIssue] = useState('')

  return (
    <PageShell title="Support" description="Operational links and contact options.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Status</div>
        <a className="mt-2 inline-block text-sm text-blue-700 hover:underline" href="https://status.arche.fi" target="_blank">
          status.arche.fi
        </a>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Contact</div>
        <Text className="mt-1 text-sm">Email: support@arche.fi</Text>
        <a className="mt-2 inline-block text-sm text-blue-700 hover:underline" href="mailto:support@arche.fi?subject=Portal%20Support">
          Open support email
        </a>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Report data issue (placeholder)</div>
        <div className="mt-2 grid gap-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Textarea value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Describe the issue" />
          <Button disabled color="dark/zinc">
            Submit (coming soon)
          </Button>
        </div>
      </section>
    </PageShell>
  )
}

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { formatShortDate } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { BillingOverview } from '@/lib/api/types'
import { useEffect, useState } from 'react'

export default function BillingPage() {
  const [data, setData] = useState<BillingOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    portalApi
      .getBillingOverview()
      .then((res) => setData(res))
      .catch((err) => setError(normalizeApiError(err).userMessage))
  }, [])

  return (
    <PageShell title="Billing" description="Current plan and latest invoices.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Plan</div>
        <Text className="mt-1">{data ? `${data.plan_name} (${data.plan_status})` : 'Loading...'}</Text>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 text-sm font-semibold">Invoices</div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.invoices ?? []).map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{formatShortDate(invoice.issued_at)}</TableCell>
                <TableCell>${invoice.amount_usd}</TableCell>
                <TableCell>{invoice.status}</TableCell>
              </TableRow>
            ))}
            {(data?.invoices ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No invoice data available yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      {error ? <Text className="text-sm text-amber-700">{error}</Text> : null}
    </PageShell>
  )
}

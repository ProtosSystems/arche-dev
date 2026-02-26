'use client'

import { Button } from '@/components/catalyst/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { formatDateTime } from '@/components/portal/utils'
import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { UsageRange, UsageRow } from '@/lib/api/types'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function ProjectUsagePage() {
  const params = useParams<{ projectId: string }>()
  const [rows, setRows] = useState<UsageRow[]>([])
  const [range, setRange] = useState<UsageRange>('24h')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (targetRange: UsageRange) => {
    setError(null)
    try {
      const list = await portalApi.listUsage(params.projectId, targetRange)
      setRows(list)
    } catch (err) {
      setError(normalizeApiError(err).userMessage)
    }
  }, [params.projectId])

  useEffect(() => {
    load(range)
  }, [load, range])

  return (
    <PageShell title="Usage" description="Request counts by route, status, and time bucket.">
      <section className="flex items-center gap-2">
        <Button color={range === '24h' ? 'dark/zinc' : 'white'} onClick={() => setRange('24h')}>
          Last 24h
        </Button>
        <Button color={range === '7d' ? 'dark/zinc' : 'white'} onClick={() => setRange('7d')}>
          Last 7d
        </Button>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Timestamp</TableHeader>
              <TableHeader>Route</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Count</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${row.ts_bucket}:${row.route}:${row.status}:${index}`}>
                <TableCell>{formatDateTime(row.ts_bucket)}</TableCell>
                <TableCell>{row.route}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.count}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No usage rows for selected range.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>

      {error ? <Text className="text-sm text-rose-700">{error}</Text> : null}
    </PageShell>
  )
}

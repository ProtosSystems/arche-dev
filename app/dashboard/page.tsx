import { Subheading } from '@/components/catalyst/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { fetchDashboardApi } from '@/lib/dashboard-api'
import { gettingStartedSteps, overviewStats, usageRows } from '@/lib/mock-data'

type SummaryResponse = { data?: { total_requests?: number; p95_ms?: number; error_rate?: number } }
type MembersResponse = { data?: { items?: Array<unknown> } }
type KeysResponse = { data?: { items?: Array<unknown> } }

export default async function DashboardPage() {
  const [summaryRes, membersRes, keysRes] = await Promise.all([
    fetchDashboardApi<SummaryResponse>('/api/usage/summary?window=7d'),
    fetchDashboardApi<MembersResponse>('/api/team/members'),
    fetchDashboardApi<KeysResponse>('/api/keys'),
  ])

  const cards = [...overviewStats]
  if (summaryRes.ok) {
    cards[0] = {
      label: 'Requests (7d)',
      value: String(summaryRes.data.data?.total_requests ?? '0'),
      change: summaryRes.data.data?.error_rate ? `${summaryRes.data.data.error_rate}% error` : '—',
    }
  }
  if (membersRes.ok) {
    cards[3] = {
      label: 'Team Members',
      value: String(membersRes.data.data?.items?.length ?? 0),
      change: '',
    }
  }
  if (keysRes.ok) {
    cards[1] = {
      label: 'Active API Keys',
      value: String(keysRes.data.data?.items?.length ?? 0),
      change: '',
    }
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-950/10 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
            <Text>{stat.label}</Text>
            <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{stat.value}</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{stat.change || ' '}</div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Subheading level={2}>Getting Started</Subheading>
        <div className="mt-4 space-y-3">
          {gettingStartedSteps.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-zinc-200/80 p-4 dark:border-white/10">
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">{index + 1}. {step.title}</div>
              <Text className="mt-1">{step.description}</Text>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-950/10 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Endpoint</TableHeader>
              <TableHeader>Requests</TableHeader>
              <TableHeader>P50</TableHeader>
              <TableHeader>P95</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {usageRows.map((row) => (
              <TableRow key={row.endpoint}>
                <TableCell>{row.endpoint}</TableCell>
                <TableCell>{row.requests}</TableCell>
                <TableCell>{row.p50}</TableCell>
                <TableCell>{row.p95}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

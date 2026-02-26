import { Badge } from '@/components/catalyst/badge'
import { Subheading } from '@/components/catalyst/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Text } from '@/components/catalyst/text'
import { fetchDashboardApi } from '@/lib/dashboard-api'
import { endpointUsage, usageRows } from '@/lib/mock-data'

type TimeseriesResponse = { data?: { points?: Array<{ ts: string; count: number }> } }
type EndpointResponse = { data?: { items?: Array<{ endpoint: string; percent: number }> } }

export default async function UsagePage() {
  const [seriesRes, endpointRes] = await Promise.all([
    fetchDashboardApi<TimeseriesResponse>('/api/usage/timeseries?window=7d'),
    fetchDashboardApi<EndpointResponse>('/api/usage/by-endpoint?window=7d'),
  ])

  const endpointItems = endpointRes.ok
    ? (endpointRes.data.data?.items || []).map((item) => ({ name: item.endpoint, percent: item.percent }))
    : endpointUsage

  return (
    <div className="space-y-10">
      <section>
        <Subheading level={2}>Endpoint Distribution</Subheading>
        <div className="mt-4 flex flex-wrap gap-2">
          {endpointItems.map((item) => (
            <Badge key={item.name} color="zinc">
              {item.name}: {item.percent}%
            </Badge>
          ))}
        </div>
        {!seriesRes.ok && <Text className="mt-2 text-sm text-amber-700">Using fallback data for charts.</Text>}
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

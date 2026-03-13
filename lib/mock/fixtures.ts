import type { APIKey, BillingOverview, UsageRow } from '@/lib/api/types'

const now = new Date('2026-02-20T12:00:00.000Z')

export const fixtureApiKeys: APIKey[] = [
  {
    id: '9347b1f7-0cd6-4f58-a832-ec3ec6ba6451',
    name: 'Backend Production',
    masked_key: 'ak_live_3F7L********',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    last_used_at: new Date(now.getTime() - 1000 * 60 * 70).toISOString(),
    revoked_at: null,
  },
  {
    id: '2f2f16f1-48d9-4f58-a9f0-e35a8f7608d7',
    name: 'SDK Sandbox',
    masked_key: 'ak_live_7J2M********',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    last_used_at: new Date(now.getTime() - 1000 * 60 * 8).toISOString(),
    revoked_at: null,
  },
]

export const fixtureUsageRows: UsageRow[] = [
  {
    ts_bucket: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    route: '/v1/views/metrics',
    status: 200,
    count: 910,
  },
  {
    ts_bucket: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
    route: '/v1/signals/snapshot',
    status: 200,
    count: 281,
  },
  {
    ts_bucket: new Date(now.getTime() - 1000 * 60 * 100).toISOString(),
    route: '/v1/views/metrics',
    status: 429,
    count: 11,
  },
]

export const fixtureBillingOverview: BillingOverview = {
  plan_name: 'Developer',
  plan_status: 'Active',
  invoices: [
    {
      id: 'inv_2026_01',
      amount_usd: 49,
      issued_at: '2026-01-31T00:00:00.000Z',
      status: 'paid',
    },
    {
      id: 'inv_2025_12',
      amount_usd: 49,
      issued_at: '2025-12-31T00:00:00.000Z',
      status: 'paid',
    },
  ],
}

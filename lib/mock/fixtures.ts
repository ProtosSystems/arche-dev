import type { APIKey, BillingOverview, Project, UsageRow, WebhookDelivery, WebhookEndpoint } from '@/lib/api/types'

const now = new Date('2026-02-20T12:00:00.000Z')

export const fixtureProjects: Project[] = [
  {
    id: '6ed9848f-f37b-475c-a8be-f4fa14f9460f',
    name: 'Arche Sandbox',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    environment: 'sandbox',
  },
]

export const fixtureApiKeysByProject: Record<string, APIKey[]> = {
  [fixtureProjects[0].id]: [
    {
      id: '2f2f16f1-48d9-4f58-a9f0-e35a8f7608d7',
      name: 'SDK Integration',
      prefix: 'ak_sbx_7J2M',
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      last_used_at: new Date(now.getTime() - 1000 * 60 * 8).toISOString(),
      revoked_at: null,
    },
  ],
}

export const fixtureWebhooksByProject: Record<string, WebhookEndpoint[]> = {
  [fixtureProjects[0].id]: [
    {
      id: '9e57be06-1f2f-490f-a2a4-ea6ba37fca80',
      url: 'https://example.com/webhooks/arche',
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      secret_prefix: 'whsec_9NNR',
      enabled: true,
    },
  ],
}

export const fixtureUsageByProject: Record<string, UsageRow[]> = {
  [fixtureProjects[0].id]: [
    {
      ts_bucket: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      route: '/v1/models/infer',
      status: 200,
      count: 182,
    },
    {
      ts_bucket: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      route: '/v1/edgar/derived-metrics/time-series',
      status: 200,
      count: 42,
    },
    {
      ts_bucket: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
      route: '/v1/models/infer',
      status: 429,
      count: 5,
    },
  ],
}

export const fixtureWebhookDeliveriesByProject: Record<string, WebhookDelivery[]> = {
  [fixtureProjects[0].id]: [
    {
      id: 'deliv_01',
      ts: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      event: 'usage.threshold.reached',
      status: 200,
      retries: 0,
    },
    {
      id: 'deliv_02',
      ts: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      event: 'api_key.revoked',
      status: 500,
      retries: 2,
    },
  ],
}

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

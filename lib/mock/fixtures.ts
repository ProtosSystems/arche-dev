import type {
  APIKey,
  BillingOverview,
  Environment,
  Project,
  UsageRow,
  WebhookDelivery,
  WebhookEndpoint,
} from '@/lib/api/types'

const now = new Date('2026-02-20T12:00:00.000Z')

export const fixtureProjects: Project[] = [
  {
    id: '6ed9848f-f37b-475c-a8be-f4fa14f9460f',
    name: 'Arche Core',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
]

type EnvState<T> = Record<Environment, T>

export const fixtureApiKeysByProject: Record<string, EnvState<APIKey[]>> = {
  [fixtureProjects[0].id]: {
    sandbox: [
      {
        id: '2f2f16f1-48d9-4f58-a9f0-e35a8f7608d7',
        name: 'SDK Sandbox',
        prefix: 'ak_sbx_7J2M',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        last_used_at: new Date(now.getTime() - 1000 * 60 * 8).toISOString(),
        revoked_at: null,
      },
    ],
    production: [
      {
        id: '9347b1f7-0cd6-4f58-a832-ec3ec6ba6451',
        name: 'Backend Production',
        prefix: 'ak_live_3F7L',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        last_used_at: new Date(now.getTime() - 1000 * 60 * 70).toISOString(),
        revoked_at: null,
      },
    ],
  },
}

export const fixtureWebhooksByProject: Record<string, EnvState<WebhookEndpoint[]>> = {
  [fixtureProjects[0].id]: {
    sandbox: [
      {
        id: '9e57be06-1f2f-490f-a2a4-ea6ba37fca80',
        url: 'https://example.com/webhooks/arche-sandbox',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        secret_prefix: 'whsec_sbx_9NNR',
        enabled: true,
      },
    ],
    production: [
      {
        id: '38f6f6a8-c43f-4ee0-a960-7124d87c40f7',
        url: 'https://example.com/webhooks/arche-live',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        secret_prefix: 'whsec_live_C4R1',
        enabled: true,
      },
    ],
  },
}

export const fixtureUsageByProject: Record<string, EnvState<UsageRow[]>> = {
  [fixtureProjects[0].id]: {
    sandbox: [
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
    production: [
      {
        ts_bucket: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        route: '/v1/models/infer',
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
        route: '/v1/models/infer',
        status: 429,
        count: 11,
      },
    ],
  },
}

export const fixtureWebhookDeliveriesByProject: Record<string, EnvState<WebhookDelivery[]>> = {
  [fixtureProjects[0].id]: {
    sandbox: [
      {
        id: 'deliv_sbx_01',
        ts: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        event_type: 'usage.threshold.reached',
        status: 200,
        attempts: 1,
        last_error: null,
      },
      {
        id: 'deliv_sbx_02',
        ts: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
        event_type: 'api_key.revoked',
        status: 500,
        attempts: 3,
        last_error: 'connect timeout',
      },
    ],
    production: [
      {
        id: 'deliv_live_01',
        ts: new Date(now.getTime() - 1000 * 60 * 40).toISOString(),
        event_type: 'invoice.created',
        status: 200,
        attempts: 1,
        last_error: null,
      },
      {
        id: 'deliv_live_02',
        ts: new Date(now.getTime() - 1000 * 60 * 65).toISOString(),
        event_type: 'usage.threshold.reached',
        status: 502,
        attempts: 2,
        last_error: 'upstream 502',
      },
    ],
  },
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

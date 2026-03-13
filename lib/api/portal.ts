'use client'

import { createApiClient } from '@/lib/api/client'
import { mockPortalApi } from '@/lib/mock/portal'
import type {
  APIKey,
  APIKeyCreateResult,
  AccountApiKey,
  AccountApiKeyCreateResult,
  BillingOverview,
  ControlPlaneApiKeyList,
  PortalApi,
  SelfServeAccessState,
  SuccessEnvelope,
  UsageRow,
  UsageTimeseries,
} from '@/lib/api/types'

const apiClient = createApiClient({ baseUrl: '', retries: 2 })

function mapApiKey(item: AccountApiKey): APIKey {
  return {
    id: item.id,
    name: item.name ?? item.masked_key,
    masked_key: item.masked_key,
    created_at: item.created_at,
    last_used_at: item.last_used_at,
    revoked_at: item.revoked_at,
  }
}

function mapTimeseriesToRows(payload: UsageTimeseries): UsageRow[] {
  const rows: UsageRow[] = []

  for (const item of payload.items) {
    if ('status' in item && 'count' in item && 'ts_bucket' in item) {
      rows.push({
        ts_bucket: item.ts_bucket,
        route: item.route ?? null,
        status: item.status,
        count: item.count,
      })
      continue
    }

    const tsBucket = `${item.day}T00:00:00.000Z`
    const successCount = Math.max(0, item.requests - item.errors)
    if (successCount > 0) {
      rows.push({
        ts_bucket: tsBucket,
        route: item.endpoint_class ?? null,
        status: 200,
        count: successCount,
      })
    }
    if (item.errors > 0) {
      rows.push({
        ts_bucket: tsBucket,
        route: item.endpoint_class ?? null,
        status: 500,
        count: item.errors,
      })
    }
  }

  return rows
}

const realPortalApi: PortalApi = {
  async getSelfServeAccessState() {
    const res = await apiClient.get<SuccessEnvelope<SelfServeAccessState>>('/api/self-serve/access')
    return res.data
  },

  async listApiKeys() {
    const res = await apiClient.get<SuccessEnvelope<ControlPlaneApiKeyList>>('/api/keys')
    return res.data.items.map(mapApiKey)
  },

  async createApiKey(input) {
    const res = await apiClient.post<SuccessEnvelope<AccountApiKeyCreateResult>>(
      '/api/keys',
      {
        name: input.name,
      }
    )

    const result: APIKeyCreateResult = {
      key: mapApiKey(res.data),
      secret: res.data.secret,
    }
    return result
  },

  async revokeApiKey(keyId) {
    await apiClient.post(`/api/keys/${keyId}/revoke`)
  },

  async listUsage(range) {
    const res = await apiClient.get<SuccessEnvelope<UsageTimeseries>>(`/api/usage/timeseries?window=${range}`)
    return mapTimeseriesToRows(res.data)
  },

  async getBillingOverview() {
    const subscription = await apiClient.get<
      SuccessEnvelope<{
        status: string
      }>
    >('/api/billing/subscription')

    const overview: BillingOverview = {
      plan_name: 'Plan',
      plan_status: subscription.data.status,
      invoices: [],
    }
    return overview
  },
}

export const portalApi: PortalApi = process.env.NEXT_PUBLIC_PORTAL_MOCK === 'true' ? mockPortalApi : realPortalApi

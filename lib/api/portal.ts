'use client'

import { createApiClient } from '@/lib/api/client'
import { mockPortalApi } from '@/lib/mock/portal'
import type {
  APIKey,
  APIKeyCreateResult,
  BillingOverview,
  ControlPlaneApiKey,
  ControlPlaneApiKeyList,
  ControlPlaneEnvironment,
  ControlPlaneEnvironmentList,
  Environment,
  PortalApi,
  Project,
  ProjectSummary,
  SuccessEnvelope,
  UsageRange,
  UsageRow,
  UsageTimeseries,
  WebhookDelivery,
  WebhookEndpoint,
} from '@/lib/api/types'

const apiClient = createApiClient({ baseUrl: '', retries: 2 })

type ControlPlaneProject = {
  id: string
  org_id: string
  name: string
  created_at: string
}

type ControlPlaneProjectList = {
  items: ControlPlaneProject[]
}

function mapProject(project: ControlPlaneProject): Project {
  return {
    id: project.id,
    name: project.name,
    created_at: project.created_at,
  }
}

function mapApiKey(item: ControlPlaneApiKey): APIKey {
  return {
    id: item.id,
    name: item.name ?? item.key_prefix,
    prefix: item.key_prefix,
    created_at: item.created_at,
    last_used_at: item.last_used_at,
    revoked_at: item.revoked_at,
  }
}

async function resolveEnvironment(projectId: string, environment: Environment): Promise<ControlPlaneEnvironment> {
  const envs = await apiClient.get<SuccessEnvelope<ControlPlaneEnvironmentList>>(`/api/projects/${projectId}/environments`)
  const selected = envs.data.items.find((item) => item.kind === environment)
  if (!selected) {
    throw new Error(`No ${environment} environment found for selected project`)
  }
  return selected
}

function mapTimeseriesToRows(payload: UsageTimeseries): UsageRow[] {
  const rows: UsageRow[] = []

  for (const item of payload.items) {
    if ('status' in item && 'count' in item && 'ts_bucket' in item) {
      rows.push({
        ts_bucket: item.ts_bucket,
        route: item.route ?? 'unknown',
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
        route: item.endpoint_class ?? 'all',
        status: 200,
        count: successCount,
      })
    }
    if (item.errors > 0) {
      rows.push({
        ts_bucket: tsBucket,
        route: item.endpoint_class ?? 'all',
        status: 500,
        count: item.errors,
      })
    }
  }

  return rows
}

const realPortalApi: PortalApi = {
  async listProjects() {
    const res = await apiClient.get<SuccessEnvelope<ControlPlaneProjectList>>('/api/orgs/projects')
    return res.data.items.map(mapProject)
  },

  async createProject() {
    throw new Error('Project creation is not available in this portal build.')
  },

  async getProjectSummary(projectId, environment) {
    const env = await resolveEnvironment(projectId, environment)
    const envId = env.id
    const headers = { 'x-env-id': envId }

    const [usage24h, usage7d, keyList] = await Promise.all([
      apiClient.get<SuccessEnvelope<{ total_requests: number }>>(
        `/api/usage/summary?window=24h&environment_id=${envId}`,
        headers
      ),
      apiClient.get<SuccessEnvelope<{ total_requests: number }>>(
        `/api/usage/summary?window=7d&environment_id=${envId}`,
        headers
      ),
      apiClient.get<SuccessEnvelope<ControlPlaneApiKeyList>>(`/api/keys?env_id=${envId}`, headers),
    ])

    const project = (await this.listProjects()).find((item) => item.id === projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const summary: ProjectSummary = {
      project,
      key_count: keyList.data.items.filter((key) => key.revoked_at === null && key.status.toLowerCase() !== 'revoked').length,
      webhook_count: 0,
      usage_24h: usage24h.data.total_requests ?? 0,
      usage_7d: usage7d.data.total_requests ?? 0,
    }

    return summary
  },

  async listApiKeys(projectId, environment) {
    const env = await resolveEnvironment(projectId, environment)
    const res = await apiClient.get<SuccessEnvelope<ControlPlaneApiKeyList>>(`/api/keys?env_id=${env.id}`, {
      'x-env-id': env.id,
    })
    return res.data.items.map(mapApiKey)
  },

  async createApiKey(projectId, input) {
    const env = await resolveEnvironment(projectId, input.environment)
    const res = await apiClient.post<
      SuccessEnvelope<{
        api_key: ControlPlaneApiKey
        raw_key: string
      }>
    >(
      '/api/keys',
      {
        env_id: env.id,
        name: input.name,
      },
      { 'x-env-id': env.id }
    )

    const result: APIKeyCreateResult = {
      key: mapApiKey(res.data.api_key),
      secret: res.data.raw_key,
    }
    return result
  },

  async revokeApiKey(projectId, keyId, environment) {
    const env = await resolveEnvironment(projectId, environment)
    await apiClient.post(`/api/keys/${keyId}/revoke`, undefined, { 'x-env-id': env.id })
  },

  async listUsage(projectId, range, environment) {
    const env = await resolveEnvironment(projectId, environment)
    const res = await apiClient.get<SuccessEnvelope<UsageTimeseries>>(
      `/api/usage/timeseries?window=${range}&environment_id=${env.id}`,
      { 'x-env-id': env.id }
    )
    return mapTimeseriesToRows(res.data)
  },

  async listWebhooks() {
    return []
  },

  async upsertWebhook() {
    throw new Error('Webhook management is not available in this portal build.')
  },

  async regenerateWebhookSecret() {
    throw new Error('Webhook secret rotation is not available in this portal build.')
  },

  async listWebhookDeliveries() {
    return []
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

'use client'

import { createApiClient } from '@/lib/api/client'
import { mockPortalApi } from '@/lib/mock/portal'
import type {
  APIKey,
  APIKeyCreateResult,
  BillingOverview,
  PortalApi,
  Project,
  ProjectSummary,
  UsageRange,
  UsageRow,
  WebhookDelivery,
  WebhookEndpoint,
} from '@/lib/api/types'

const apiClient = createApiClient({ baseUrl: '/api/portal', retries: 2 })

const realPortalApi: PortalApi = {
  async listProjects() {
    const res = await apiClient.get<{ data: Project[] }>('/projects')
    return res.data
  },

  async createProject(input) {
    const res = await apiClient.post<{ data: Project }>('/projects', input)
    return res.data
  },

  async getProjectSummary(projectId, environment) {
    const res = await apiClient.get<{ data: ProjectSummary }>(`/projects/${projectId}/summary?environment=${environment}`)
    return res.data
  },

  async listApiKeys(projectId, environment) {
    const res = await apiClient.get<{ data: APIKey[] }>(`/projects/${projectId}/api-keys?environment=${environment}`)
    return res.data
  },

  async createApiKey(projectId, input) {
    const res = await apiClient.post<{ data: APIKeyCreateResult }>(`/projects/${projectId}/api-keys`, input)
    return res.data
  },

  async revokeApiKey(projectId, keyId, environment) {
    await apiClient.post(`/projects/${projectId}/api-keys/${keyId}/revoke`, { environment })
  },

  async listUsage(projectId, range, environment) {
    const res = await apiClient.get<{ data: UsageRow[] }>(
      `/projects/${projectId}/usage?range=${range}&environment=${environment}`
    )
    return res.data
  },

  async listWebhooks(projectId, environment) {
    const res = await apiClient.get<{ data: WebhookEndpoint[] }>(`/projects/${projectId}/webhooks?environment=${environment}`)
    return res.data
  },

  async upsertWebhook(projectId, input) {
    const res = await apiClient.post<{ data: WebhookEndpoint }>(`/projects/${projectId}/webhooks`, input)
    return res.data
  },

  async regenerateWebhookSecret(projectId, webhookId, environment) {
    const res = await apiClient.post<{ data: { secret: string; secret_prefix: string } }>(
      `/projects/${projectId}/webhooks/${webhookId}/regenerate-secret`,
      { environment }
    )
    return res.data
  },

  async listWebhookDeliveries(projectId, environment, statusFilter = 'all') {
    const res = await apiClient.get<{ data: WebhookDelivery[] }>(
      `/projects/${projectId}/webhooks/deliveries?environment=${environment}&status=${statusFilter}`
    )
    return res.data
  },

  async getBillingOverview() {
    const res = await apiClient.get<{ data: BillingOverview }>('/billing')
    return res.data
  },
}

export const portalApi: PortalApi = process.env.NEXT_PUBLIC_PORTAL_MOCK === 'true' ? mockPortalApi : realPortalApi

'use client'

import { createApiClient } from '@/lib/api/client'
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
import { mockPortalApi } from '@/lib/mock/portal'

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

  async getProjectSummary(projectId: string) {
    const res = await apiClient.get<{ data: ProjectSummary }>(`/projects/${projectId}/summary`)
    return res.data
  },

  async listApiKeys(projectId: string) {
    const res = await apiClient.get<{ data: APIKey[] }>(`/projects/${projectId}/api-keys`)
    return res.data
  },

  async createApiKey(projectId: string, input: { name: string }) {
    const res = await apiClient.post<{ data: APIKeyCreateResult }>(`/projects/${projectId}/api-keys`, input)
    return res.data
  },

  async revokeApiKey(projectId: string, keyId: string) {
    await apiClient.post(`/projects/${projectId}/api-keys/${keyId}/revoke`)
  },

  async listUsage(projectId: string, range: UsageRange) {
    const res = await apiClient.get<{ data: UsageRow[] }>(`/projects/${projectId}/usage?range=${range}`)
    return res.data
  },

  async listWebhooks(projectId: string) {
    const res = await apiClient.get<{ data: WebhookEndpoint[] }>(`/projects/${projectId}/webhooks`)
    return res.data
  },

  async upsertWebhook(projectId: string, input: { url: string; enabled: boolean }) {
    const res = await apiClient.post<{ data: WebhookEndpoint }>(`/projects/${projectId}/webhooks`, input)
    return res.data
  },

  async regenerateWebhookSecret(projectId: string, webhookId: string) {
    const res = await apiClient.post<{ data: { secret: string; secret_prefix: string } }>(
      `/projects/${projectId}/webhooks/${webhookId}/regenerate-secret`
    )
    return res.data
  },

  async listWebhookDeliveries(projectId: string) {
    const res = await apiClient.get<{ data: WebhookDelivery[] }>(`/projects/${projectId}/webhooks/deliveries`)
    return res.data
  },

  async getBillingOverview() {
    const res = await apiClient.get<{ data: BillingOverview }>('/billing')
    return res.data
  },
}

export const portalApi: PortalApi = process.env.NEXT_PUBLIC_PORTAL_MOCK === 'true' ? mockPortalApi : realPortalApi

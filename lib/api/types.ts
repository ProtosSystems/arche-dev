export type Environment = 'sandbox' | 'production'

export type Project = {
  id: string
  name: string
  created_at: string
  environment?: Environment
}

export type APIKey = {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export type APIKeyCreateResult = {
  key: APIKey
  secret: string
}

export type WebhookEndpoint = {
  id: string
  url: string
  created_at: string
  secret_prefix: string
  enabled: boolean
}

export type WebhookDelivery = {
  id: string
  ts: string
  event: string
  status: number
  retries: number
}

export type UsageRow = {
  ts_bucket: string
  route: string
  status: number
  count: number
}

export type UsageRange = '24h' | '7d'

export type ProjectSummary = {
  project: Project
  key_count: number
  webhook_count: number
  usage_24h: number
  usage_7d: number
}

export type BillingOverview = {
  plan_name: string
  plan_status: string
  invoices: Array<{ id: string; amount_usd: number; issued_at: string; status: string }>
}

export type PortalApi = {
  listProjects: () => Promise<Project[]>
  createProject: (input: { name: string; environment?: Environment }) => Promise<Project>
  getProjectSummary: (projectId: string) => Promise<ProjectSummary>
  listApiKeys: (projectId: string) => Promise<APIKey[]>
  createApiKey: (projectId: string, input: { name: string }) => Promise<APIKeyCreateResult>
  revokeApiKey: (projectId: string, keyId: string) => Promise<void>
  listUsage: (projectId: string, range: UsageRange) => Promise<UsageRow[]>
  listWebhooks: (projectId: string) => Promise<WebhookEndpoint[]>
  upsertWebhook: (projectId: string, input: { url: string; enabled: boolean }) => Promise<WebhookEndpoint>
  regenerateWebhookSecret: (projectId: string, webhookId: string) => Promise<{ secret: string; secret_prefix: string }>
  listWebhookDeliveries: (projectId: string) => Promise<WebhookDelivery[]>
  getBillingOverview: () => Promise<BillingOverview>
}

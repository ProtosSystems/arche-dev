export type Environment = 'sandbox' | 'production'

export type Project = {
  id: string
  name: string
  created_at: string
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
  enabled: boolean
  secret_prefix: string
  created_at: string
}

export type WebhookDelivery = {
  id: string
  ts: string
  event_type: string
  status: number
  attempts: number
  last_error: string | null
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
  createProject: (input: { name: string }) => Promise<Project>
  getProjectSummary: (projectId: string, environment: Environment) => Promise<ProjectSummary>
  listApiKeys: (projectId: string, environment: Environment) => Promise<APIKey[]>
  createApiKey: (projectId: string, input: { name: string; environment: Environment }) => Promise<APIKeyCreateResult>
  revokeApiKey: (projectId: string, keyId: string, environment: Environment) => Promise<void>
  listUsage: (projectId: string, range: UsageRange, environment: Environment) => Promise<UsageRow[]>
  listWebhooks: (projectId: string, environment: Environment) => Promise<WebhookEndpoint[]>
  upsertWebhook: (
    projectId: string,
    input: { url: string; enabled: boolean; environment: Environment }
  ) => Promise<WebhookEndpoint>
  regenerateWebhookSecret: (
    projectId: string,
    webhookId: string,
    environment: Environment
  ) => Promise<{ secret: string; secret_prefix: string }>
  listWebhookDeliveries: (
    projectId: string,
    environment: Environment,
    statusFilter?: 'success' | 'fail' | 'all'
  ) => Promise<WebhookDelivery[]>
  getBillingOverview: () => Promise<BillingOverview>
}

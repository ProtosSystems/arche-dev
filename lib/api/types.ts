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
  route: string | null
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

export type SuccessEnvelope<T> = {
  data: T
}

export type ControlPlaneEnvironment = {
  id: string
  project_id: string
  name: string
  kind: Environment
  created_at: string
}

export type ControlPlaneEnvironmentList = {
  items: ControlPlaneEnvironment[]
}

export type ControlPlaneApiKey = {
  id: string
  env_id: string
  key_prefix: string
  status: 'active' | 'revoked' | string
  scopes: string[]
  tier: string | null
  name: string | null
  created_at: string
  revoked_at: string | null
  last_used_at: string | null
}

export type ControlPlaneApiKeyList = {
  items: ControlPlaneApiKey[]
}

export type UsageSummaryItem = {
  endpoint_class: string | null
  requests: number
  errors: number
}

export type UsageSummary = {
  window: string
  window_start: string
  window_end: string
  total_requests: number
  total_errors: number
  items: UsageSummaryItem[]
}

export type UsageTimeseriesStatusItem = {
  ts_bucket: string
  route: string | null
  status: number
  count: number
}

export type UsageTimeseriesAggregateItem = {
  day: string
  endpoint_class: string | null
  requests: number
  errors: number
}

export type UsageTimeseries = {
  window: string
  window_start: string
  window_end: string
  items: Array<UsageTimeseriesStatusItem | UsageTimeseriesAggregateItem>
}

export type UsageByEndpointItem = {
  handler: string
  endpoint_class: string | null
  requests: number
  errors: number
  rate_limited?: number
}

export type UsageByEndpoint = {
  window: string
  window_start: string
  window_end: string
  items: UsageByEndpointItem[]
}

export type BillingSubscription = {
  status: string
  plan_id: string | null
  current_period_end: string | null
  updated_at: string | null
}

export type EntitlementDashboard = {
  environment: Environment
  plan: {
    name: string
    tier: string | null
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | 'unknown'
  }
  period: {
    start_at: string | null
    end_at: string | null
    reset_at: string | null
  }
  requests: {
    limit: number | null
    used: number
    remaining: number | null
  }
  ai_budget:
    | {
        limit_usd: number | null
        used_usd: number
        remaining_usd: number | null
      }
    | null
  features: Record<string, boolean>
  updated_at: string | null
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

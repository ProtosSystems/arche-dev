export type APIKey = {
  id: string
  name: string
  masked_key: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export type APIKeyCreateResult = {
  key: APIKey
  secret: string
}

export type AccountApiKeyCreateResult = {
  id: string
  name: string | null
  masked_key: string
  secret: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export type UsageRow = {
  ts_bucket: string
  route: string | null
  status: number
  count: number
}

export type UsageRange = '24h' | '7d'

export type BillingOverview = {
  plan_name: string
  plan_status: string
  invoices: Array<{ id: string; amount_usd: number; issued_at: string; status: string }>
}

export type SuccessEnvelope<T> = {
  data: T
}

export type AccountApiKey = {
  id: string
  masked_key: string
  name: string | null
  created_at: string
  revoked_at: string | null
  last_used_at: string | null
  status?: 'active' | 'revoked' | string
}

export type ControlPlaneApiKeyList = {
  items: AccountApiKey[]
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

export type EntitlementState = 'inactive' | 'trial' | 'active' | 'past_due' | 'cancelled'

export type AccountEntitlements = {
  plan: string | null
  status: EntitlementState
  api_key_limit: number | null
  usage_limits: {
    requests_per_day?: number | null
    ai_budget_usd?: number | null
    ai_budget_limit_usd?: number | null
    ai_budget_used_usd?: number | null
    [key: string]: number | null | undefined
  }
  subscription_status?: string | null
  active_api_key_count: number
  updated_at?: string | null
  source_of_truth?: 'arche_api'
}

export type SelfServeAccessState = {
  entitlement: AccountEntitlements
  can_create_api_keys: boolean
  purchase_required: boolean
  reason: string | null
}

export type PortalApi = {
  getSelfServeAccessState: () => Promise<SelfServeAccessState>
  listApiKeys: () => Promise<APIKey[]>
  createApiKey: (input: { name: string }) => Promise<APIKeyCreateResult>
  revokeApiKey: (keyId: string) => Promise<void>
  listUsage: (range: UsageRange) => Promise<UsageRow[]>
  getBillingOverview: () => Promise<BillingOverview>
}

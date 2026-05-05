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
export type PortalEnvironment = 'sandbox' | 'production'

export type OrgSummary = {
  id: string
  name: string
}

export type OrgContext = {
  selected_org_id: string | null
  organizations: OrgSummary[]
  requires_selection: boolean
}

export type AccountEntitlements = {
  current_environment: PortalEnvironment
  entitlement_status: EntitlementState
  plan_name: string | null
  allowed_environments: PortalEnvironment[]
  sandbox_access_status: EntitlementState
  production_access_status: EntitlementState
  api_key_limit: number | null
  api_key_count: number
  can_create_sandbox_key: boolean
  can_create_production_key: boolean
  blocked_reason_codes: string[]
  feature_flags: Record<string, boolean>
  environment_ids: {
    sandbox: string | null
    production: string | null
  }
}

export type IntegrationHealthError = {
  request_id: string
  handler: string
  endpoint_class: string
  status_code: number
  requested_at: string
}

export type IntegrationHealth = {
  current_environment: PortalEnvironment
  first_successful_api_call_at: string | null
  latest_request_at: string | null
  latest_request_endpoint: string | null
  latest_request_status: number | null
  latest_request_id: string | null
  recent_errors: IntegrationHealthError[]
}

export type RateLimitState = {
  current_environment: PortalEnvironment
  current_tier: string | null
  current_endpoint_class: string | null
  limit: number | null
  remaining: number | null
  reset_at: string | null
  backend: string | null
  window_seconds: number | null
}

export type SelfServeAccessState = AccountEntitlements

export type PortalApi = {
  getSelfServeAccessState: () => Promise<SelfServeAccessState>
  listApiKeys: () => Promise<APIKey[]>
  createApiKey: (input: { name: string }) => Promise<APIKeyCreateResult>
  revokeApiKey: (keyId: string) => Promise<void>
  listUsage: (range: UsageRange) => Promise<UsageRow[]>
  getBillingOverview: () => Promise<BillingOverview>
}

export function getEnvironmentAccess(accessState, environment) {
  const isProduction = environment === 'production'
  return {
    entitlementStatus: isProduction
      ? (accessState?.production_access_status ?? 'inactive')
      : (accessState?.sandbox_access_status ?? 'inactive'),
    canCreateKey: isProduction
      ? Boolean(accessState?.can_create_production_key)
      : Boolean(accessState?.can_create_sandbox_key),
    environmentId: isProduction
      ? (accessState?.environment_ids?.production ?? null)
      : (accessState?.environment_ids?.sandbox ?? null),
    blockedReasonCodes: Array.isArray(accessState?.blocked_reason_codes) ? accessState.blocked_reason_codes : [],
  }
}

export function describeKeyLimit(accessState) {
  const limit = accessState?.api_key_limit ?? null
  const active = accessState?.api_key_count ?? 0
  if (limit === null) {
    return `${active} active keys (no plan limit reported)`
  }
  return `${active}/${limit} active keys`
}

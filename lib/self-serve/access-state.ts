import type { AccountApiKey, AccountEntitlements, SelfServeAccessState } from '@/lib/api/types'

const ACTIVE_STATUSES = new Set(['active', 'trial'])

function isRevoked(key: AccountApiKey): boolean {
  const normalizedStatus = typeof key.status === 'string' ? key.status.toLowerCase() : null
  return key.revoked_at !== null || normalizedStatus === 'revoked'
}

export function buildSelfServeAccessState(params: {
  entitlements: AccountEntitlements
  apiKeys: AccountApiKey[]
}): SelfServeAccessState {
  const { entitlements, apiKeys } = params
  const activeApiKeyCount = apiKeys.filter((key) => !isRevoked(key)).length
  const withinLimit = entitlements.api_key_limit === null ? true : activeApiKeyCount < entitlements.api_key_limit
  const canCreate = ACTIVE_STATUSES.has(entitlements.status) && withinLimit

  let reason: string | null = null
  if (!ACTIVE_STATUSES.has(entitlements.status)) {
    reason = 'Purchase or reactivation is required before API key creation.'
  } else if (!withinLimit) {
    reason = 'API key plan limit reached. Revoke an existing key or upgrade your plan.'
  }

  return {
    entitlement: {
      ...entitlements,
      active_api_key_count: activeApiKeyCount,
    },
    can_create_api_keys: canCreate,
    purchase_required: !ACTIVE_STATUSES.has(entitlements.status),
    reason,
  }
}

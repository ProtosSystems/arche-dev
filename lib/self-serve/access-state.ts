import type { AccountApiKey, AccountEntitlements, SelfServeAccessState } from '@/lib/api/types'

function isRevoked(key: AccountApiKey): boolean {
  const normalizedStatus = typeof key.status === 'string' ? key.status.toLowerCase() : null
  return key.revoked_at !== null || normalizedStatus === 'revoked'
}

export function buildSelfServeAccessState(params: {
  entitlements: AccountEntitlements
  apiKeys: AccountApiKey[]
}): SelfServeAccessState {
  const { entitlements, apiKeys } = params
  const apiKeyCount = apiKeys.filter((key) => !isRevoked(key)).length
  return {
    ...entitlements,
    api_key_count: apiKeyCount,
  }
}

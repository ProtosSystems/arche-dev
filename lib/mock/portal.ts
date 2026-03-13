'use client'

import { fixtureApiKeys, fixtureBillingOverview, fixtureUsageRows } from '@/lib/mock/fixtures'
import type {
  APIKey,
  APIKeyCreateResult,
  BillingOverview,
  PortalApi,
  SelfServeAccessState,
  UsageRange,
  UsageRow,
} from '@/lib/api/types'

type MockState = {
  apiKeys: APIKey[]
  usageRows: UsageRow[]
  entitlement: SelfServeAccessState
}

const STORAGE_KEY = 'portal_mock_state_v3'

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T
}

function readState(): MockState {
  const seed: MockState = {
    apiKeys: clone(fixtureApiKeys),
    usageRows: clone(fixtureUsageRows),
    entitlement: {
      entitlement: {
        source_of_truth: 'arche_api',
        plan: 'Developer',
        status: 'active',
        api_key_limit: 5,
        usage_limits: {
          requests_per_day: 50000,
          ai_budget_usd: null,
        },
        active_api_key_count: fixtureApiKeys.filter((item) => item.revoked_at === null).length,
        updated_at: new Date().toISOString(),
      },
      can_create_api_keys: true,
      purchase_required: false,
      reason: null,
    },
  }

  if (typeof window === 'undefined') {
    return seed
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    return JSON.parse(raw) as MockState
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

function writeState(state: MockState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function nowIso() {
  return new Date().toISOString()
}

function randomId() {
  return crypto.randomUUID()
}

function randomToken(size = 6) {
  return Math.random().toString(36).slice(2, 2 + size).toUpperCase()
}

function keyPrefix() {
  return `ak_live_${randomToken(4)}`
}

function secret(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

function filterByRange(rows: UsageRow[], range: UsageRange) {
  const now = Date.now()
  const hours = range === '24h' ? 24 : 24 * 7
  const minTs = now - hours * 60 * 60 * 1000
  return rows.filter((row) => new Date(row.ts_bucket).getTime() >= minTs)
}

function syncEntitlementCounts(state: MockState): MockState {
  state.entitlement.entitlement.active_api_key_count = state.apiKeys.filter((key) => key.revoked_at === null).length
  state.entitlement.entitlement.updated_at = nowIso()
  const limit = state.entitlement.entitlement.api_key_limit
  state.entitlement.can_create_api_keys =
    state.entitlement.entitlement.status === 'active' &&
    (limit === null || state.entitlement.entitlement.active_api_key_count < limit)
  return state
}

export const mockPortalApi: PortalApi = {
  async getSelfServeAccessState() {
    const state = syncEntitlementCounts(readState())
    writeState(state)
    return state.entitlement
  },

  async listApiKeys() {
    const state = readState()
    return state.apiKeys
  },

  async createApiKey(input): Promise<APIKeyCreateResult> {
    const state = syncEntitlementCounts(readState())
    if (!state.entitlement.can_create_api_keys) {
      throw new Error('Entitlement is not active for API key creation.')
    }

    const limit = state.entitlement.entitlement.api_key_limit
    const active = state.entitlement.entitlement.active_api_key_count
    if (typeof limit === 'number' && active >= limit) {
      throw new Error('API key limit reached for current plan.')
    }

    const key: APIKey = {
      id: randomId(),
      name: input.name.trim(),
      masked_key: `${keyPrefix()}********`,
      created_at: nowIso(),
      last_used_at: null,
      revoked_at: null,
    }

    state.apiKeys.unshift(key)
    writeState(syncEntitlementCounts(state))

    return {
      key,
      secret: secret('ak_live_'),
    }
  },

  async revokeApiKey(keyId) {
    const state = readState()
    state.apiKeys = state.apiKeys.map((item) => {
      if (item.id !== keyId) {
        return item
      }
      return { ...item, revoked_at: nowIso() }
    })
    writeState(syncEntitlementCounts(state))
  },

  async listUsage(range) {
    const rows = readState().usageRows
    return filterByRange(rows, range)
  },

  async getBillingOverview(): Promise<BillingOverview> {
    return fixtureBillingOverview
  },
}

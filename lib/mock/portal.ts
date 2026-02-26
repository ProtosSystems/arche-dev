'use client'

import {
  fixtureApiKeysByProject,
  fixtureBillingOverview,
  fixtureProjects,
  fixtureUsageByProject,
  fixtureWebhookDeliveriesByProject,
  fixtureWebhooksByProject,
} from '@/lib/mock/fixtures'
import type {
  APIKey,
  APIKeyCreateResult,
  BillingOverview,
  Environment,
  PortalApi,
  Project,
  ProjectSummary,
  UsageRange,
  UsageRow,
  WebhookDelivery,
  WebhookEndpoint,
} from '@/lib/api/types'

type EnvState<T> = Record<Environment, T>

type MockState = {
  projects: Project[]
  apiKeysByProject: Record<string, EnvState<APIKey[]>>
  webhooksByProject: Record<string, EnvState<WebhookEndpoint[]>>
  usageByProject: Record<string, EnvState<UsageRow[]>>
  deliveriesByProject: Record<string, EnvState<WebhookDelivery[]>>
}

const STORAGE_KEY = 'portal_mock_state_v2'

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T
}

function emptyEnvState<T>(value: T): EnvState<T> {
  return { sandbox: clone(value), production: clone(value) }
}

function readState(): MockState {
  const seed: MockState = {
    projects: clone(fixtureProjects),
    apiKeysByProject: clone(fixtureApiKeysByProject),
    webhooksByProject: clone(fixtureWebhooksByProject),
    usageByProject: clone(fixtureUsageByProject),
    deliveriesByProject: clone(fixtureWebhookDeliveriesByProject),
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

function keyPrefix(environment: Environment) {
  return environment === 'production' ? `ak_live_${randomToken(4)}` : `ak_sbx_${randomToken(4)}`
}

function webhookPrefix(environment: Environment) {
  return environment === 'production' ? `whsec_live_${randomToken(4)}` : `whsec_sbx_${randomToken(4)}`
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

function getEnvRows<T>(source: EnvState<T>, environment: Environment): T {
  return source[environment]
}

export const mockPortalApi: PortalApi = {
  async listProjects() {
    return readState().projects
  },

  async createProject(input) {
    const state = readState()
    const project: Project = {
      id: randomId(),
      name: input.name.trim(),
      created_at: nowIso(),
    }

    state.projects.unshift(project)
    state.apiKeysByProject[project.id] = emptyEnvState([] as APIKey[])
    state.webhooksByProject[project.id] = emptyEnvState([] as WebhookEndpoint[])
    state.usageByProject[project.id] = emptyEnvState([] as UsageRow[])
    state.deliveriesByProject[project.id] = emptyEnvState([] as WebhookDelivery[])
    writeState(state)
    return project
  },

  async getProjectSummary(projectId, environment) {
    const state = readState()
    const project = state.projects.find((item) => item.id === projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const usage = getEnvRows(state.usageByProject[projectId] ?? emptyEnvState([] as UsageRow[]), environment)
    const usage24h = filterByRange(usage, '24h').reduce((sum, row) => sum + row.count, 0)
    const usage7d = filterByRange(usage, '7d').reduce((sum, row) => sum + row.count, 0)

    const keys = getEnvRows(state.apiKeysByProject[projectId] ?? emptyEnvState([] as APIKey[]), environment)
    const webhooks = getEnvRows(
      state.webhooksByProject[projectId] ?? emptyEnvState([] as WebhookEndpoint[]),
      environment
    )

    const summary: ProjectSummary = {
      project,
      key_count: keys.filter((key) => key.revoked_at === null).length,
      webhook_count: webhooks.length,
      usage_24h: usage24h,
      usage_7d: usage7d,
    }

    return summary
  },

  async listApiKeys(projectId, environment) {
    const state = readState()
    return getEnvRows(state.apiKeysByProject[projectId] ?? emptyEnvState([] as APIKey[]), environment)
  },

  async createApiKey(projectId, input): Promise<APIKeyCreateResult> {
    const state = readState()
    const key: APIKey = {
      id: randomId(),
      name: input.name.trim(),
      prefix: keyPrefix(input.environment),
      created_at: nowIso(),
      last_used_at: null,
      revoked_at: null,
    }

    const envState = state.apiKeysByProject[projectId] ?? emptyEnvState([] as APIKey[])
    envState[input.environment].unshift(key)
    state.apiKeysByProject[projectId] = envState
    writeState(state)

    return {
      key,
      secret: secret(key.prefix.slice(0, key.prefix.lastIndexOf('_') + 1)),
    }
  },

  async revokeApiKey(projectId, keyId, environment) {
    const state = readState()
    const envState = state.apiKeysByProject[projectId] ?? emptyEnvState([] as APIKey[])
    envState[environment] = envState[environment].map((item) => {
      if (item.id !== keyId) {
        return item
      }
      return { ...item, revoked_at: nowIso() }
    })
    state.apiKeysByProject[projectId] = envState
    writeState(state)
  },

  async listUsage(projectId, range, environment) {
    const rows = getEnvRows(stateOrEmptyUsage(readState(), projectId), environment)
    return filterByRange(rows, range)
  },

  async listWebhooks(projectId, environment) {
    const state = readState()
    return getEnvRows(
      state.webhooksByProject[projectId] ?? emptyEnvState([] as WebhookEndpoint[]),
      environment
    )
  },

  async upsertWebhook(projectId, input) {
    const state = readState()
    const envState = state.webhooksByProject[projectId] ?? emptyEnvState([] as WebhookEndpoint[])
    const current = envState[input.environment][0]

    const next: WebhookEndpoint = current
      ? { ...current, url: input.url, enabled: input.enabled }
      : {
          id: randomId(),
          url: input.url,
          enabled: input.enabled,
          created_at: nowIso(),
          secret_prefix: webhookPrefix(input.environment),
        }

    envState[input.environment] = [next]
    state.webhooksByProject[projectId] = envState
    writeState(state)
    return next
  },

  async regenerateWebhookSecret(projectId, webhookId, environment) {
    const state = readState()
    const envState = state.webhooksByProject[projectId] ?? emptyEnvState([] as WebhookEndpoint[])
    const nextPrefix = webhookPrefix(environment)

    envState[environment] = envState[environment].map((hook) =>
      hook.id === webhookId ? { ...hook, secret_prefix: nextPrefix } : hook
    )

    state.webhooksByProject[projectId] = envState
    writeState(state)

    return {
      secret: secret(nextPrefix),
      secret_prefix: nextPrefix,
    }
  },

  async listWebhookDeliveries(projectId, environment, statusFilter = 'all') {
    const state = readState()
    const rows = getEnvRows(
      state.deliveriesByProject[projectId] ?? emptyEnvState([] as WebhookDelivery[]),
      environment
    )

    if (statusFilter === 'all') {
      return rows
    }

    if (statusFilter === 'success') {
      return rows.filter((row) => row.status >= 200 && row.status < 300)
    }

    return rows.filter((row) => row.status >= 400)
  },

  async getBillingOverview(): Promise<BillingOverview> {
    return fixtureBillingOverview
  },
}

function stateOrEmptyUsage(state: MockState, projectId: string): EnvState<UsageRow[]> {
  return state.usageByProject[projectId] ?? emptyEnvState([] as UsageRow[])
}

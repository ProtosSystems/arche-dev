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

type MockState = {
  projects: Project[]
  apiKeysByProject: Record<string, APIKey[]>
  webhooksByProject: Record<string, WebhookEndpoint[]>
  usageByProject: Record<string, UsageRow[]>
  deliveriesByProject: Record<string, WebhookDelivery[]>
}

const STORAGE_KEY = 'portal_mock_state_v1'

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input)) as T
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

function randomPrefix(prefix: string) {
  const token = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}${token}`
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

export const mockPortalApi: PortalApi = {
  async listProjects() {
    return readState().projects
  },

  async createProject(input: { name: string; environment?: Environment }) {
    const state = readState()
    const project: Project = {
      id: randomId(),
      name: input.name,
      created_at: nowIso(),
      environment: input.environment,
    }

    state.projects.unshift(project)
    state.apiKeysByProject[project.id] = []
    state.webhooksByProject[project.id] = []
    state.usageByProject[project.id] = []
    state.deliveriesByProject[project.id] = []
    writeState(state)
    return project
  },

  async getProjectSummary(projectId: string) {
    const state = readState()
    const project = state.projects.find((item) => item.id === projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const usage = state.usageByProject[projectId] ?? []
    const usage24h = filterByRange(usage, '24h').reduce((sum, row) => sum + row.count, 0)
    const usage7d = filterByRange(usage, '7d').reduce((sum, row) => sum + row.count, 0)

    const summary: ProjectSummary = {
      project,
      key_count: (state.apiKeysByProject[projectId] ?? []).filter((key) => key.revoked_at === null).length,
      webhook_count: (state.webhooksByProject[projectId] ?? []).length,
      usage_24h: usage24h,
      usage_7d: usage7d,
    }

    return summary
  },

  async listApiKeys(projectId: string) {
    const state = readState()
    return state.apiKeysByProject[projectId] ?? []
  },

  async createApiKey(projectId: string, input: { name: string }): Promise<APIKeyCreateResult> {
    const state = readState()
    const key: APIKey = {
      id: randomId(),
      name: input.name.trim(),
      prefix: randomPrefix('ak_sbx_'),
      created_at: nowIso(),
      last_used_at: null,
      revoked_at: null,
    }

    const projectKeys = state.apiKeysByProject[projectId] ?? []
    projectKeys.unshift(key)
    state.apiKeysByProject[projectId] = projectKeys
    writeState(state)

    return {
      key,
      secret: secret('ak_sbx_'),
    }
  },

  async revokeApiKey(projectId: string, keyId: string) {
    const state = readState()
    state.apiKeysByProject[projectId] = (state.apiKeysByProject[projectId] ?? []).map((item) => {
      if (item.id !== keyId) {
        return item
      }
      return { ...item, revoked_at: nowIso() }
    })
    writeState(state)
  },

  async listUsage(projectId: string, range: UsageRange) {
    return filterByRange(readState().usageByProject[projectId] ?? [], range)
  },

  async listWebhooks(projectId: string) {
    return readState().webhooksByProject[projectId] ?? []
  },

  async upsertWebhook(projectId: string, input: { url: string; enabled: boolean }) {
    const state = readState()
    const existing = (state.webhooksByProject[projectId] ?? [])[0]

    const next: WebhookEndpoint = existing
      ? { ...existing, url: input.url, enabled: input.enabled }
      : {
          id: randomId(),
          url: input.url,
          enabled: input.enabled,
          created_at: nowIso(),
          secret_prefix: randomPrefix('whsec_'),
        }

    state.webhooksByProject[projectId] = [next]
    writeState(state)
    return next
  },

  async regenerateWebhookSecret(projectId: string, webhookId: string) {
    const state = readState()
    const hooks = state.webhooksByProject[projectId] ?? []
    const nextPrefix = randomPrefix('whsec_')

    state.webhooksByProject[projectId] = hooks.map((hook) =>
      hook.id === webhookId ? { ...hook, secret_prefix: nextPrefix } : hook
    )

    writeState(state)

    return {
      secret: secret('whsec_'),
      secret_prefix: nextPrefix,
    }
  },

  async listWebhookDeliveries(projectId: string) {
    return readState().deliveriesByProject[projectId] ?? []
  },

  async getBillingOverview(): Promise<BillingOverview> {
    return fixtureBillingOverview
  },
}

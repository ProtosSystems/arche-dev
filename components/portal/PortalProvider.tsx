'use client'

import { ApiError, normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { OrgContext, PortalEnvironment, SelfServeAccessState } from '@/lib/api/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ENV_COOKIE_NAME = 'portal_environment'

type PortalContextValue = {
  accessState: SelfServeAccessState | null
  loadingAccess: boolean
  accessError: string | null
  selectedEnvironment: PortalEnvironment
  setSelectedEnvironment: (environment: PortalEnvironment) => void
  orgContext: OrgContext | null
  loadingOrgContext: boolean
  orgSelectionRequired: boolean
  orgContextError: string | null
  refreshAccess: () => Promise<void>
  refreshOrgContext: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
  renameOrganization: (orgId: string, name: string) => Promise<void>
}

const PortalContext = createContext<PortalContextValue | null>(null)

function readEnvironmentCookie(): PortalEnvironment | null {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ENV_COOKIE_NAME}=`))
  if (!match) {
    return null
  }
  const value = decodeURIComponent(match.slice(`${ENV_COOKIE_NAME}=`.length)).trim().toLowerCase()
  return value === 'sandbox' || value === 'production' ? value : null
}

function writeEnvironmentCookie(environment: PortalEnvironment) {
  document.cookie = `${ENV_COOKIE_NAME}=${environment}; path=/; SameSite=Lax`
}

async function fetchOrgContext(): Promise<OrgContext> {
  const response = await fetch('/api/org-context', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Unable to load organization context.')
  }
  return payload as OrgContext
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<SelfServeAccessState | null>(null)
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [selectedEnvironment, setSelectedEnvironmentState] = useState<PortalEnvironment>('sandbox')
  const [orgContext, setOrgContext] = useState<OrgContext | null>(null)
  const [loadingOrgContext, setLoadingOrgContext] = useState(true)
  const [orgSelectionRequired, setOrgSelectionRequired] = useState(false)
  const [orgContextError, setOrgContextError] = useState<string | null>(null)

  const refreshOrgContext = useCallback(async () => {
    setLoadingOrgContext(true)
    try {
      const next = await fetchOrgContext()
      setOrgContext(next)
      setOrgSelectionRequired(next.requires_selection)
      setOrgContextError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load organization context.'
      setOrgContextError(message)
      setOrgContext(null)
    } finally {
      setLoadingOrgContext(false)
    }
  }, [])

  const refreshAccess = useCallback(async () => {
    setLoadingAccess(true)
    setAccessError(null)

    try {
      const state = await portalApi.getSelfServeAccessState()
      setAccessState(state)
      setOrgSelectionRequired(false)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && error.message.includes('org_context_required')) {
        const organizations = Array.isArray((error.details as { organizations?: unknown } | undefined)?.organizations)
          ? ((error.details as { organizations: OrgContext['organizations'] }).organizations ?? [])
          : []
        setAccessState(null)
        setAccessError(null)
        setOrgSelectionRequired(true)
        setOrgContextError(null)
        setOrgContext((current) => ({
          selected_org_id: current?.selected_org_id ?? null,
          organizations,
          requires_selection: true,
        }))
        return
      }

      const normalized = normalizeApiError(error)
      setAccessError(normalized.userMessage)
      setAccessState(null)
    } finally {
      setLoadingAccess(false)
    }
  }, [])

  const switchOrganization = useCallback(
    async (orgId: string) => {
      const response = await fetch('/api/org-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ org_id: orgId }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Unable to set organization context.')
      }
      await Promise.all([refreshOrgContext(), refreshAccess()])
    },
    [refreshAccess, refreshOrgContext]
  )

  const renameOrganization = useCallback(
    async (orgId: string, name: string) => {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Unable to rename organization.')
      }
      await refreshOrgContext()
    },
    [refreshOrgContext]
  )

  const setSelectedEnvironment = useCallback(
    (environment: PortalEnvironment) => {
      writeEnvironmentCookie(environment)
      setSelectedEnvironmentState(environment)
      void refreshAccess()
    },
    [refreshAccess]
  )

  useEffect(() => {
    const fromCookie = readEnvironmentCookie()
    const initialEnvironment = fromCookie ?? 'sandbox'
    writeEnvironmentCookie(initialEnvironment)
    setSelectedEnvironmentState(initialEnvironment)
    void Promise.all([refreshOrgContext(), refreshAccess()])
  }, [refreshAccess, refreshOrgContext])

  const value = useMemo<PortalContextValue>(
    () => ({
      accessState,
      loadingAccess,
      accessError,
      selectedEnvironment,
      setSelectedEnvironment,
      orgContext,
      loadingOrgContext,
      orgSelectionRequired,
      orgContextError,
      refreshAccess,
      refreshOrgContext,
      switchOrganization,
      renameOrganization,
    }),
    [
      accessState,
      loadingAccess,
      accessError,
      selectedEnvironment,
      setSelectedEnvironment,
      orgContext,
      loadingOrgContext,
      orgSelectionRequired,
      orgContextError,
      refreshAccess,
      refreshOrgContext,
      switchOrganization,
      renameOrganization,
    ]
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const ctx = useContext(PortalContext)
  if (!ctx) {
    throw new Error('usePortal must be used within PortalProvider')
  }
  return ctx
}

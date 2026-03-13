'use client'

import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { SelfServeAccessState } from '@/lib/api/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type PortalContextValue = {
  accessState: SelfServeAccessState | null
  loadingAccess: boolean
  accessError: string | null
  refreshAccess: () => Promise<void>
}

const PortalContext = createContext<PortalContextValue | null>(null)

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [accessState, setAccessState] = useState<SelfServeAccessState | null>(null)
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)

  const refreshAccess = useCallback(async () => {
    setLoadingAccess(true)
    setAccessError(null)

    try {
      const state = await portalApi.getSelfServeAccessState()
      setAccessState(state)
    } catch (error) {
      const normalized = normalizeApiError(error)
      setAccessError(normalized.userMessage)
      setAccessState(null)
    } finally {
      setLoadingAccess(false)
    }
  }, [])

  useEffect(() => {
    void refreshAccess()
  }, [refreshAccess])

  const value = useMemo<PortalContextValue>(
    () => ({
      accessState,
      loadingAccess,
      accessError,
      refreshAccess,
    }),
    [accessState, loadingAccess, accessError, refreshAccess]
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

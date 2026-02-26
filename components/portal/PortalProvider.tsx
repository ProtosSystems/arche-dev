'use client'

import { normalizeApiError } from '@/lib/api/errors'
import { portalApi } from '@/lib/api/portal'
import type { Environment, Project } from '@/lib/api/types'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type PortalContextValue = {
  projects: Project[]
  selectedProjectId: string | null
  selectedProject: Project | null
  loadingProjects: boolean
  projectError: string | null
  onboardingComplete: boolean
  environment: Environment
  setEnvironment: (value: Environment) => void
  setOnboardingComplete: (value: boolean) => void
  selectProject: (projectId: string) => void
  refreshProjects: () => Promise<void>
  createProject: (name: string, environment?: Environment) => Promise<Project>
}

const PortalContext = createContext<PortalContextValue | null>(null)

const SELECTED_PROJECT_KEY = 'portal_selected_project_id'
const ONBOARDING_KEY = 'portal_onboarding_complete'
const ENV_KEY = 'portal_environment'

function getStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(key)
}

function setStoredValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, value)
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [onboardingComplete, setOnboardingCompleteState] = useState(false)
  const [environment, setEnvironmentState] = useState<Environment>('sandbox')

  const refreshProjects = useCallback(async () => {
    setLoadingProjects(true)
    setProjectError(null)

    try {
      const items = await portalApi.listProjects()
      setProjects(items)
      if (items.length === 0) {
        setSelectedProjectId(null)
        return
      }

      const fromPath = pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? null
      const stored = getStoredValue(SELECTED_PROJECT_KEY)
      const next = fromPath || stored || items[0].id

      if (items.some((item) => item.id === next)) {
        setSelectedProjectId(next)
      } else {
        setSelectedProjectId(items[0].id)
      }
    } catch (error) {
      const normalized = normalizeApiError(error)
      setProjectError(normalized.userMessage)
      setProjects([])
      setSelectedProjectId(null)
    } finally {
      setLoadingProjects(false)
    }
  }, [pathname])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  useEffect(() => {
    const env = getStoredValue(ENV_KEY)
    if (env === 'sandbox' || env === 'production') {
      setEnvironmentState(env)
    }

    const onboarding = getStoredValue(ONBOARDING_KEY)
    setOnboardingCompleteState(onboarding === 'true')
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      setStoredValue(SELECTED_PROJECT_KEY, selectedProjectId)
    }
  }, [selectedProjectId])

  const setOnboardingComplete = useCallback((value: boolean) => {
    setOnboardingCompleteState(value)
    setStoredValue(ONBOARDING_KEY, String(value))
  }, [])

  const setEnvironment = useCallback((value: Environment) => {
    setEnvironmentState(value)
    setStoredValue(ENV_KEY, value)
  }, [])

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
    setStoredValue(SELECTED_PROJECT_KEY, projectId)
  }, [])

  const createProject = useCallback(
    async (name: string, env?: Environment) => {
      const project = await portalApi.createProject({ name, environment: env })
      await refreshProjects()
      selectProject(project.id)
      router.push(`/projects/${project.id}`)
      return project
    },
    [refreshProjects, router, selectProject]
  )

  const selectedProject = useMemo(() => {
    return projects.find((item) => item.id === selectedProjectId) ?? null
  }, [projects, selectedProjectId])

  const value = useMemo<PortalContextValue>(
    () => ({
      projects,
      selectedProjectId,
      selectedProject,
      loadingProjects,
      projectError,
      onboardingComplete,
      environment,
      setEnvironment,
      setOnboardingComplete,
      selectProject,
      refreshProjects,
      createProject,
    }),
    [
      projects,
      selectedProjectId,
      selectedProject,
      loadingProjects,
      projectError,
      onboardingComplete,
      environment,
      setEnvironment,
      setOnboardingComplete,
      selectProject,
      refreshProjects,
      createProject,
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

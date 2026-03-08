'use client'

import { Avatar } from '@/components/catalyst/avatar'
import { Select } from '@/components/catalyst/select'
import { Text } from '@/components/catalyst/text'
import { usePortal } from '@/components/portal/PortalProvider'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview'
  if (pathname === '/account') return 'Account'
  if (pathname === '/billing') return 'Billing'
  if (pathname === '/onboarding') return 'Onboarding'
  if (pathname === '/keys') return 'API Keys'
  if (pathname === '/usage') return 'Usage'
  if (/^\/projects\/[^/]+\/api-keys$/.test(pathname)) return 'API Keys'
  if (/^\/projects\/[^/]+\/usage$/.test(pathname)) return 'Usage'
  return 'Developer Portal'
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { projects, selectedProjectId, selectProject, loadingProjects, projectError, environment, setEnvironment } =
    usePortal()
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="space-y-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-zinc-900">
            Arche Developer Portal
          </Link>
          <Text className="truncate text-sm text-zinc-500">/ {pageTitle}</Text>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedProjectId ?? ''}
            onChange={(event) => {
              const id = event.target.value
              if (!id) return
              selectProject(id)
              router.push('/')
            }}
            disabled={loadingProjects || projects.length === 0}
            className="min-w-56"
          >
            {projects.length === 0 ? <option value="">No projects</option> : null}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>

          <Select
            value={environment}
            onChange={(event) => setEnvironment(event.target.value as 'sandbox' | 'production')}
            className="w-36"
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </Select>

          {authDisabled ? (
            <Avatar initials="DV" className="size-8 bg-zinc-200 text-zinc-700" />
          ) : (
            <div className="shrink-0">
              <UserButton afterSignOutUrl="/login" />
            </div>
          )}
        </div>
      </div>

      {projectError ? <Text className="text-sm text-amber-700">{projectError}</Text> : null}
    </header>
  )
}

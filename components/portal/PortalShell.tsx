'use client'

import { Select } from '@/components/catalyst/select'
import { SidebarLayout } from '@/components/catalyst/sidebar-layout'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/catalyst/sidebar'
import { Text } from '@/components/catalyst/text'
import { getEnvBaseUrl } from '@/components/portal/env'
import { usePortal } from '@/components/portal/PortalProvider'
import {
  BoltIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  KeyIcon,
  LifebuoyIcon,
  LockClosedIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/20/solid'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type NavItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function NavLinks() {
  const pathname = usePathname()
  const { selectedProjectId } = usePortal()

  const usageHref = selectedProjectId ? `/projects/${selectedProjectId}/usage` : '/projects'
  const webhooksHref = selectedProjectId ? `/projects/${selectedProjectId}/webhooks` : '/projects'

  const links: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: HomeIcon },
    { id: 'projects', label: 'Projects', href: '/projects', icon: KeyIcon },
    { id: 'usage', label: 'Usage', href: usageHref, icon: ChartBarIcon },
    { id: 'webhooks', label: 'Webhooks', href: webhooksHref, icon: BoltIcon },
    { id: 'billing', label: 'Billing', href: '/billing', icon: ReceiptPercentIcon },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    { id: 'security', label: 'Security', href: '/security', icon: LockClosedIcon },
    { id: 'support', label: 'Support', href: '/support', icon: LifebuoyIcon },
  ]

  return (
    <SidebarSection>
      {links.map((link) => {
        const current = pathname === link.href || pathname.startsWith(`${link.href}/`)
        const Icon = link.icon
        return (
          <SidebarItem key={link.id} href={link.href} current={current}>
            <Icon className="size-4" />
            <SidebarLabel>{link.label}</SidebarLabel>
          </SidebarItem>
        )
      })}
    </SidebarSection>
  )
}

function TopBar() {
  const router = useRouter()
  const { projects, selectedProjectId, selectProject, loadingProjects, projectError, environment, setEnvironment } =
    usePortal()
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm font-semibold text-zinc-900">
          Arche Developer Portal
        </Link>
        <Text className="text-xs uppercase tracking-wide text-zinc-500">{environment}</Text>
        <Text className="text-xs text-zinc-500">{getEnvBaseUrl(environment)}</Text>
        <Text className="text-xs uppercase tracking-wide text-zinc-500">
          {process.env.NEXT_PUBLIC_PORTAL_MOCK === 'true' ? 'Mock mode' : 'Live mode'}
        </Text>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={selectedProjectId ?? ''}
          onChange={(event) => {
            const id = event.target.value
            selectProject(id)
            router.push(`/projects/${id}`)
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
          <div className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500">Auth disabled (dev)</div>
        ) : (
          <UserButton afterSignOutUrl="/login" />
        )}
      </div>

      {projectError ? <Text className="w-full text-sm text-amber-700">{projectError}</Text> : null}
    </header>
  )
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      navbar={<div className="px-2 text-sm font-semibold text-zinc-900">Arche Portal</div>}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 py-2">
              <div className="text-sm font-semibold text-zinc-900">app.arche.fi</div>
              <div className="text-xs text-zinc-500">Developer Portal</div>
            </div>
          </SidebarHeader>
          <SidebarBody>
            <NavLinks />
          </SidebarBody>
          <SidebarFooter>
            <SidebarSection>
              <SidebarItem href="/support" current={false}>
                <LifebuoyIcon className="size-4" />
                <SidebarLabel>Need help?</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <div className="space-y-6">
        <TopBar />
        <main>{children}</main>
      </div>
    </SidebarLayout>
  )
}

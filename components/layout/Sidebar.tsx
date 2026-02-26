'use client'

import { Avatar } from '@/components/catalyst/avatar'
import {
  Sidebar as CatalystSidebar,
  SidebarBody,
  SidebarDivider,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/catalyst/sidebar'
import {
  ChartBarIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  KeyIcon,
  Squares2X2Icon,
  UsersIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: Squares2X2Icon },
  { label: 'Organizations', href: '/dashboard/orgs', icon: BuildingOfficeIcon },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: KeyIcon },
  { label: 'Usage', href: '/dashboard/usage', icon: ChartBarIcon },
  { label: 'Entitlements', href: '/dashboard/entitlements', icon: CircleStackIcon },
  { label: 'Team', href: '/dashboard/team', icon: UsersIcon },
  { label: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

const resourceItems = [
  { label: 'Documentation', href: '#', icon: DocumentTextIcon },
  { label: 'Status', href: 'https://status.arche.fi', icon: ChartBarIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const [workspaceName, setWorkspaceName] = useState('Protos')

  useEffect(() => {
    const loadWorkspaceName = async () => {
      const res = await fetch('/api/workspace-settings')
      if (!res.ok) return
      const payload = await res.json().catch(() => null)
      const value = typeof payload?.workspace_name === 'string' ? payload.workspace_name.trim() : ''
      if (value) setWorkspaceName(value)
    }

    loadWorkspaceName()

    const onWorkspaceNameUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ workspaceName?: string }>
      const value = customEvent.detail?.workspaceName?.trim()
      if (value) setWorkspaceName(value)
    }

    window.addEventListener('workspace-name-updated', onWorkspaceNameUpdated as EventListener)
    return () => {
      window.removeEventListener('workspace-name-updated', onWorkspaceNameUpdated as EventListener)
    }
  }, [])

  return (
    <CatalystSidebar>
      <SidebarHeader>
        <div className="flex w-full items-center gap-3 px-2 py-2.5 sm:py-2">
          <Avatar initials="PD" className="size-9 bg-primary text-white" />
          <div className="min-w-0">
            <SidebarLabel className="text-sm font-semibold text-primary dark:text-white">{workspaceName}</SidebarLabel>
            <span className="block text-xs/5 text-zinc-500 dark:text-zinc-400">Developer Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarBody>
        <SidebarSection>
          {navItems.map((item) => {
            const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <SidebarItem key={item.href} href={item.href} current={isCurrent}>
                <item.icon data-slot="icon" />
                <SidebarLabel>{item.label}</SidebarLabel>
              </SidebarItem>
            )
          })}
        </SidebarSection>

        <SidebarDivider />

        <SidebarSection className="max-lg:hidden">
          <SidebarHeading>Resources</SidebarHeading>
          {resourceItems.map((item) => (
            <SidebarItem key={item.label} href={item.href}>
              <item.icon data-slot="icon" />
              <SidebarLabel>{item.label}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>

        <SidebarSpacer />
      </SidebarBody>

      <SidebarFooter className="max-lg:hidden">
        <SidebarSection>
          <SidebarItem href="/support">
            <UsersIcon data-slot="icon" />
            <SidebarLabel>Contact support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarFooter>
    </CatalystSidebar>
  )
}

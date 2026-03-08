'use client'

import { AppHeader } from '@/components/app/AppHeader'
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
import { usePortal } from '@/components/portal/PortalProvider'
import {
  ChartBarIcon,
  HomeIcon,
  KeyIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'

type NavItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function NavLinks() {
  const pathname = usePathname()
  const { selectedProjectId } = usePortal()

  const usageHref = selectedProjectId ? `/projects/${selectedProjectId}/usage` : '/usage'

  const links: NavItem[] = [
    { id: 'overview', label: 'Overview', href: '/', icon: HomeIcon },
    { id: 'onboarding', label: 'Onboarding', href: '/onboarding', icon: KeyIcon },
    { id: 'keys', label: 'API Keys', href: '/keys', icon: KeyIcon },
    { id: 'usage', label: 'Usage', href: usageHref, icon: ChartBarIcon },
    { id: 'billing', label: 'Billing', href: '/billing', icon: ReceiptPercentIcon },
    { id: 'account', label: 'Account', href: '/account', icon: UserCircleIcon },
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
          <SidebarFooter />
        </Sidebar>
      }
    >
      <div className="space-y-6">
        <AppHeader />
        <main>{children}</main>
      </div>
    </SidebarLayout>
  )
}

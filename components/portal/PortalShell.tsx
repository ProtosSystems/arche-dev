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
import {
  ChartBarIcon,
  HomeIcon,
  KeyIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { usePortal } from './PortalProvider'

type NavItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function NavLinks() {
  const pathname = usePathname()

  const links: NavItem[] = [
    { id: 'overview', label: 'Overview', href: '/', icon: HomeIcon },
    { id: 'onboarding', label: 'Onboarding', href: '/onboarding', icon: KeyIcon },
    { id: 'keys', label: 'API Keys', href: '/keys', icon: KeyIcon },
    { id: 'usage', label: 'Usage', href: '/usage', icon: ChartBarIcon },
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
  const { orgContext, orgContextError, orgSelectionRequired, switchOrganization } = usePortal()
  const [pending, startTransition] = useTransition()
  const [pickerError, setPickerError] = useState<string | null>(null)

  const onOrgSelect = (orgId: string) => {
    setPickerError(null)
    startTransition(async () => {
      try {
        await switchOrganization(orgId)
      } catch (error) {
        setPickerError(error instanceof Error ? error.message : 'Unable to switch organization.')
      }
    })
  }

  return (
    <SidebarLayout
      navbar={<div className="px-2 text-sm font-semibold text-zinc-900">Arche Portal</div>}
      sidebar={
        <Sidebar className="dark:!bg-[var(--protos-navy-deep)]">
          <SidebarHeader>
            <div className="px-2 py-2">
              <div className="text-2xl text-zinc-900 dark:text-white">⍺rche</div>
              <div className="text-xs text-zinc-700 dark:text-[var(--protos-mist-300)]">Developer Portal</div>
            </div>
          </SidebarHeader>
          <SidebarBody>
            <NavLinks />
          </SidebarBody>
          <SidebarFooter>
            <SidebarSection>
              <SidebarItem href="https://docs.arche.fi/changelog" target="_blank" rel="noreferrer">
                <span className="grid size-5 place-items-center rounded-full bg-[#0B1F3A] text-white">
                  <span className="block pl-px text-[17px] font-normal leading-none [transform:translateY(-2px)]">
                    ⍺
                  </span>
                </span>
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <div className="portal-shell space-y-6">
        <AppHeader />
        {orgSelectionRequired ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="font-semibold">Organization selection required</div>
            <div className="mt-1">Pick an organization before using billing, keys, or other access-managed portal actions.</div>
            {orgContext?.organizations.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  value={orgContext.selected_org_id ?? ''}
                  disabled={pending}
                  onChange={(event) => onOrgSelect(event.target.value)}
                >
                  <option value="" disabled>
                    Select organization
                  </option>
                  {orgContext.organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {pickerError ? <div className="mt-2 text-xs text-amber-700">{pickerError}</div> : null}
            {orgContextError ? <div className="mt-2 text-xs text-amber-700">{orgContextError}</div> : null}
          </section>
        ) : null}
        <main>{children}</main>
      </div>
    </SidebarLayout>
  )
}

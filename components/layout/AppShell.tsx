'use client'

import { Navbar, NavbarSection, NavbarSpacer } from '@/components/catalyst/navbar'
import { SidebarLayout } from '@/components/catalyst/sidebar-layout'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <span className="text-sm font-semibold text-primary">Protos</span>
          </NavbarSection>
        </Navbar>
      }
      sidebar={<Sidebar />}
    >
      <div className="space-y-8">
        <TopNav />
        {children}
      </div>
    </SidebarLayout>
  )
}

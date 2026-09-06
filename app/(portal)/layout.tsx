import { DocsReferralTracker } from '@/components/portal/DocsReferralTracker'
import { PortalProvider } from '@/components/portal/PortalProvider'
import { PortalShell } from '@/components/portal/PortalShell'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <DocsReferralTracker />
      <PortalShell>{children}</PortalShell>
    </PortalProvider>
  )
}

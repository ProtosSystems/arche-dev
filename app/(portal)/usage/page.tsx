'use client'

import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UsageRedirectPage() {
  const router = useRouter()
  const { selectedProjectId } = usePortal()

  useEffect(() => {
    if (!selectedProjectId) return
    router.replace(`/projects/${selectedProjectId}/usage`)
  }, [router, selectedProjectId])

  return (
    <PageShell title="Usage" description="Redirecting to usage details.">
      <Text className="text-sm text-zinc-600">Select a project to view usage.</Text>
    </PageShell>
  )
}

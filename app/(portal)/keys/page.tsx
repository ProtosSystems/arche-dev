'use client'

import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function KeysRedirectPage() {
  const router = useRouter()
  const { selectedProjectId } = usePortal()

  useEffect(() => {
    if (!selectedProjectId) return
    router.replace(`/projects/${selectedProjectId}/api-keys`)
  }, [router, selectedProjectId])

  return (
    <PageShell title="API Keys" description="Redirecting to keys management.">
      <Text className="text-sm text-zinc-600">Select a project to manage API keys.</Text>
    </PageShell>
  )
}

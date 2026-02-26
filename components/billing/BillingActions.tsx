'use client'

import { Button } from '@/components/catalyst/button'
import { useState, useTransition } from 'react'

type BillingActionsProps = {
  status: string | null
  showUpgrade?: boolean
}

export function BillingActions({ status, showUpgrade }: BillingActionsProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const runCheckout = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const payload = await res.json().catch(() => ({}))
      const url = payload?.data?.checkout_url
      if (!res.ok || !url) {
        setError(payload?.error?.message || 'Unable to create checkout session.')
        return
      }
      window.location.href = url
    })
  }

  const runPortal = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const payload = await res.json().catch(() => ({}))
      const url = payload?.data?.portal_url
      if (!res.ok || !url) {
        setError(payload?.error?.message || 'Billing portal is not available.')
        return
      }
      window.location.href = url
    })
  }

  const normalized = status?.toLowerCase() || 'not_configured'
  const showUpgradeButton = showUpgrade ?? normalized === 'not_configured'
  const showManageButton = !showUpgradeButton

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-2">
        {showUpgradeButton && (
          <Button color="dark/zinc" onClick={runCheckout} disabled={pending}>
            Upgrade
          </Button>
        )}
        {showManageButton && (
          <Button color="dark/zinc" onClick={runPortal} disabled={pending}>
            Manage billing
          </Button>
        )}
      </div>
      {error && <div className="text-sm text-amber-600">{error}</div>}
    </div>
  )
}

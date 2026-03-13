'use client'

import { Avatar } from '@/components/catalyst/avatar'
import { Text } from '@/components/catalyst/text'
import { usePortal } from '@/components/portal/PortalProvider'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { formatPlanNameLabel } from '@/components/portal/utils'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview'
  if (pathname === '/account') return 'Account'
  if (pathname === '/billing') return 'Billing'
  if (pathname === '/onboarding') return 'Onboarding'
  if (pathname === '/keys') return 'API Keys'
  if (pathname === '/usage') return 'Usage'
  return 'Developer Portal'
}

export function AppHeader() {
  const pathname = usePathname()
  const { accessState, loadingAccess, accessError } = usePortal()
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'
  const pageTitle = getPageTitle(pathname)
  const planLabel = formatPlanNameLabel(accessState?.entitlement.plan)

  return (
    <header className="space-y-3 rounded-xl bg-white py-3">
      <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <Link
            href="https://docs.arche.fi"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
          >
            Docs
          </Link>
          <Link
            href="https://docs.arche.fi/reference"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
          >
            API Reference
          </Link>
          <ThemeToggle />
          {authDisabled ? (
            <Avatar initials="DV" className="size-8 border border-zinc-200 bg-zinc-200 text-zinc-700 dark:border-white/15" />
          ) : (
            <div className="shrink-0">
              <UserButton afterSignOutUrl="/login" />
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" className="text-sm font-semibold text-zinc-900">
          Arche Developer Portal
        </Link>
        <Text className="truncate text-sm text-zinc-500">/ {pageTitle}</Text>
      </div>

      {loadingAccess ? <Text className="text-sm text-zinc-500">Loading entitlement state…</Text> : null}
      {!loadingAccess && accessState ? (
        <Text className="text-sm text-zinc-700">Plan: {planLabel}</Text>
      ) : null}
      {accessError ? <Text className="text-sm text-amber-700">{accessError}</Text> : null}
    </header>
  )
}

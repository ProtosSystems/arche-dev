'use client'

import { Avatar } from '@/components/catalyst/avatar'
import { Text } from '@/components/catalyst/text'
import { usePortal } from '@/components/portal/PortalProvider'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { formatPlanNameLabel } from '@/components/portal/utils'
import type { PortalEnvironment } from '@/lib/api/types'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview'
  if (pathname === '/account') return 'Account'
  if (pathname === '/billing') return 'Billing'
  if (pathname === '/onboarding') return 'Onboarding'
  if (pathname === '/keys') return 'API Keys'
  if (pathname === '/usage') return 'Usage'
  return 'Developer Portal'
}

function EnvironmentBadge({
  environment,
  active,
  onClick,
}: {
  environment: PortalEnvironment
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
        active
          ? 'border-zinc-900 bg-zinc-900 text-white'
          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-900'
      }`}
    >
      {environment}
    </button>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const {
    accessState,
    loadingAccess,
    accessError,
    selectedEnvironment,
    setSelectedEnvironment,
    orgContext,
    orgSelectionRequired,
    switchOrganization,
  } = usePortal()
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'
  const pageTitle = getPageTitle(pathname)
  const planLabel = formatPlanNameLabel(accessState?.plan_name)
  const [pending, startTransition] = useTransition()
  const [orgError, setOrgError] = useState<string | null>(null)

  const onOrgChange = (orgId: string) => {
    setOrgError(null)
    startTransition(async () => {
      try {
        await switchOrganization(orgId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to switch organization.'
        setOrgError(message)
      }
    })
  }

  return (
    <header className="space-y-4 rounded-xl bg-white py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-zinc-900">
            Arche Developer Portal
          </Link>
          <Text className="truncate text-sm text-zinc-500">/ {pageTitle}</Text>
        </div>

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

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Organization</div>
          {orgContext && orgContext.organizations.length > 1 ? (
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              value={orgContext.selected_org_id ?? ''}
              disabled={pending}
              onChange={(event) => onOrgChange(event.target.value)}
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
          ) : (
            <Text className="text-sm text-zinc-900">
              {orgContext?.organizations[0]?.name ?? (orgSelectionRequired ? 'Organization selection required' : 'Loading…')}
            </Text>
          )}
          {orgError ? <Text className="text-xs text-amber-700">{orgError}</Text> : null}
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Environment</div>
          <div className="flex items-center gap-2">
            <EnvironmentBadge
              environment="sandbox"
              active={selectedEnvironment === 'sandbox'}
              onClick={() => setSelectedEnvironment('sandbox')}
            />
            <EnvironmentBadge
              environment="production"
              active={selectedEnvironment === 'production'}
              onClick={() => setSelectedEnvironment('production')}
            />
          </div>
        </div>
      </div>

      {loadingAccess ? <Text className="text-sm text-zinc-500">Loading entitlement state…</Text> : null}
      {!loadingAccess && accessState ? (
        <Text className="text-sm text-zinc-700">Plan: {planLabel}</Text>
      ) : null}
      {accessError ? <Text className="text-sm text-amber-700">{accessError}</Text> : null}
    </header>
  )
}

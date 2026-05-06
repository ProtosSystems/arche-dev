'use client'

import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { useClerk, useUser } from '@clerk/nextjs'
import { type FormEvent, useEffect, useState } from 'react'

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-zinc-200 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{value}</dd>
    </div>
  )
}

export default function AccountPage() {
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'
  const { openUserProfile } = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const { accessState, loadingOrgContext, orgContext, orgSelectionRequired, renameOrganization } = usePortal()
  const [draftOrgName, setDraftOrgName] = useState('')
  const [renameBusy, setRenameBusy] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [renameSuccess, setRenameSuccess] = useState<string | null>(null)

  const email = user?.primaryEmailAddress?.emailAddress ?? null
  const userId = user?.id ?? null
  const currentOrganization =
    orgContext?.organizations.find((org) => org.id === orgContext.selected_org_id) ?? null
  const organizationName = currentOrganization?.name ?? 'No organization selected'
  const subscriptionStatus =
    accessState && (accessState.production_access_status !== 'inactive' || accessState.sandbox_access_status !== 'inactive')
      ? `${accessState.sandbox_access_status} sandbox / ${accessState.production_access_status} production`
      : null
  const renameDisabled = !currentOrganization || orgSelectionRequired || renameBusy

  useEffect(() => {
    setDraftOrgName(currentOrganization?.name ?? '')
  }, [currentOrganization?.id, currentOrganization?.name])

  async function handleRenameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentOrganization) {
      setRenameError('Select an organization before renaming it.')
      setRenameSuccess(null)
      return
    }

    const nextName = draftOrgName.trim()
    if (!nextName) {
      setRenameError('Organization name is required.')
      setRenameSuccess(null)
      return
    }
    if (nextName === currentOrganization.name) {
      setRenameError(null)
      setRenameSuccess('Organization name is already up to date.')
      return
    }

    setRenameBusy(true)
    setRenameError(null)
    setRenameSuccess(null)
    try {
      await renameOrganization(currentOrganization.id, nextName)
      setRenameSuccess('Organization name updated.')
    } catch (error) {
      setRenameError(error instanceof Error ? error.message : 'Unable to rename organization.')
    } finally {
      setRenameBusy(false)
    }
  }

  return (
    <PageShell title="Account" description="Who owns this API access.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        {!authDisabled && !userLoaded ? (
          <Text className="text-sm text-zinc-600">Loading account identity…</Text>
        ) : loadingOrgContext ? (
          <Text className="text-sm text-zinc-600">Loading organization…</Text>
        ) : (
          <dl>
            <AccountRow label="Email" value={email ?? 'Unavailable'} />
            <AccountRow label="Organization / account name" value={organizationName} />
            {userId ? <AccountRow label="User ID" value={userId} /> : null}
            {subscriptionStatus ? <AccountRow label="Billing status" value={subscriptionStatus} /> : null}
          </dl>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Organization</div>
        <Text className="mt-2 text-sm text-zinc-600">Change the display name shown across the Arche portal for this organization.</Text>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleRenameSubmit}>
          <Input
            value={draftOrgName}
            onChange={(event) => setDraftOrgName(event.target.value)}
            placeholder="Arche Workspace"
            disabled={renameDisabled}
            aria-label="Organization name"
          />
          <Button type="submit" color="light" disabled={renameDisabled}>
            {renameBusy ? 'Saving…' : 'Save name'}
          </Button>
        </form>
        {orgSelectionRequired ? (
          <Text className="mt-2 text-sm text-amber-700">Choose an organization in the header before renaming it.</Text>
        ) : null}
        {renameError ? <Text className="mt-2 text-sm text-rose-700">{renameError}</Text> : null}
        {!renameError && renameSuccess ? <Text className="mt-2 text-sm text-emerald-700">{renameSuccess}</Text> : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Authentication</div>
        {authDisabled ? (
          <Text className="mt-2 text-sm text-zinc-600">Profile management is unavailable while development auth bypass is enabled.</Text>
        ) : (
          <div className="mt-3">
            <Button
              color="light"
              className="dark:border-[var(--protos-mist-300)] dark:!text-[#0F172A] dark:[--btn-bg:var(--protos-mist-300)] dark:[--btn-border:var(--protos-mist-300)] dark:[--btn-hover-overlay:var(--color-white)]/25"
              onClick={() => openUserProfile()}
            >
              Manage profile
            </Button>
          </div>
        )}
      </section>
    </PageShell>
  )
}

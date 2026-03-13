'use client'

import { Button } from '@/components/catalyst/button'
import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'
import { usePortal } from '@/components/portal/PortalProvider'
import { useClerk, useUser } from '@clerk/nextjs'

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-zinc-200 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{value}</dd>
    </div>
  )
}

function metadataString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

export default function AccountPage() {
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'
  const { openUserProfile } = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const { accessState } = usePortal()

  const email = user?.primaryEmailAddress?.emailAddress ?? null
  const organizationName =
    metadataString(user?.unsafeMetadata?.organizationName) ??
    metadataString(user?.publicMetadata?.organizationName) ??
    user?.fullName ??
    email ??
    'Personal account'
  const userId = user?.id ?? null
  const subscriptionStatus = accessState?.entitlement.subscription_status ?? null

  return (
    <PageShell title="Account" description="Who owns this API access.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        {!authDisabled && !userLoaded ? (
          <Text className="text-sm text-zinc-600">Loading account identity…</Text>
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

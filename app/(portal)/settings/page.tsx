import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'

export default function SettingsPage() {
  return (
    <PageShell title="Settings" description="Account profile and session controls.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Profile</div>
        <Text className="mt-1 text-sm text-zinc-600">Profile editing is managed by your identity provider.</Text>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Sessions</div>
        <Text className="mt-1 text-sm text-zinc-600">
          Session management and device sign-out controls will appear here.
        </Text>
      </section>
    </PageShell>
  )
}

import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'

export default function AccountPage() {
  return (
    <PageShell title="Account" description="Identity, organization context, and session management.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Identity</div>
        <Text className="mt-1 text-sm text-zinc-600">
          Sign-in and profile management are handled by the identity provider used by this workspace.
        </Text>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Org and Environment</div>
        <Text className="mt-1 text-sm text-zinc-600">
          Select your project and environment from the header before creating keys or reviewing usage.
        </Text>
      </section>
    </PageShell>
  )
}

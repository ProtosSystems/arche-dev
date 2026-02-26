import { Text } from '@/components/catalyst/text'
import { PageShell } from '@/components/portal/PageShell'

export default function SupportPage() {
  return (
    <PageShell title="Support" description="Operational links and contact options.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Status</div>
        <a className="mt-2 inline-block text-sm text-blue-700 hover:underline" href="https://status.arche.fi" target="_blank">
          status.arche.fi
        </a>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Contact</div>
        <Text className="mt-1 text-sm">Email: support@arche.fi</Text>
        <a className="mt-2 inline-block text-sm text-blue-700 hover:underline" href="mailto:support@arche.fi?subject=Portal%20Support">
          Open support email
        </a>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Report data issue</div>
        <a
          className="mt-2 inline-block text-sm text-blue-700 hover:underline"
          href="mailto:data@arche.fi?subject=Data%20Issue%20Report"
        >
          data@arche.fi
        </a>
      </section>
    </PageShell>
  )
}

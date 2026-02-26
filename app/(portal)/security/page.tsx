import { PageShell } from '@/components/portal/PageShell'

export default function SecurityPage() {
  return (
    <PageShell title="Security" description="Authentication and request tracing model.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
        <p>Arche API supports JWT bearer auth for user-based access and API keys for service access.</p>
        <p className="mt-2">Trace requests with `x-request-id` and inspect downstream `trace-id` where available.</p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Header examples</div>
        <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-100">{`Authorization: Bearer <TOKEN>\nx-request-id: portal_123\nX-Org-Id: <ORG_ID>`}</pre>
      </section>
    </PageShell>
  )
}

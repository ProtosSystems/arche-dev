import { getEnvBaseUrl } from '@/components/portal/env'
import { PageShell } from '@/components/portal/PageShell'

export default function SecurityPage() {
  return (
    <PageShell title="Security" description="Authentication and request tracing model.">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
        <p>Arche API supports Bearer JWT for user-scoped access and `X-Api-Key` for service access.</p>
        <p className="mt-2">All requests should include `X-Request-ID` to correlate logs and traces.</p>
        <p className="mt-2">Sandbox and production are logically separated and use different base URLs and credentials.</p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">Header examples</div>
        <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-100">{`Authorization: Bearer <JWT>\nX-Api-Key: <API_KEY>\nX-Request-ID: portal_123`}</pre>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold">cURL examples</div>
        <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-3 text-xs text-zinc-100">{`# Sandbox\ncurl -H "X-Api-Key: <KEY>" -H "X-Request-ID: req_1" ${getEnvBaseUrl('sandbox')}/v1/models/infer\n\n# Production\ncurl -H "Authorization: Bearer <JWT>" -H "X-Request-ID: req_2" ${getEnvBaseUrl('production')}/v1/models/infer`}</pre>
      </section>
    </PageShell>
  )
}

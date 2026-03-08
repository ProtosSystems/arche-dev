import { Text } from '@/components/catalyst/text'
import type { NormalizedApiError } from '@/lib/api/errors'

type ApiErrorNoticeProps = {
  error: NormalizedApiError
  title?: string
}

export function ApiErrorNotice({ error, title = 'Service issue' }: ApiErrorNoticeProps) {
  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
      <div className="text-sm font-semibold">{title}</div>
      <Text className="mt-1 text-sm">{error.userMessage}</Text>
      {error.requestId ? (
        <Text className="mt-2 text-xs">
          Request ID: <code>{error.requestId}</code>
        </Text>
      ) : null}
      <a
        className="mt-2 inline-block text-xs font-medium text-amber-900 underline"
        href={error.troubleshootingUrl}
        target="_blank"
        rel="noreferrer"
      >
        Troubleshoot with request IDs
      </a>
    </section>
  )
}

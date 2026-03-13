import { Text } from '@/components/catalyst/text'
import type { NormalizedApiError } from '@/lib/api/errors'

type ApiErrorNoticeProps = {
  error: NormalizedApiError
  title?: string
}

export function ApiErrorNotice({ error, title = 'Service issue' }: ApiErrorNoticeProps) {
  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-300/20 dark:bg-amber-200/10 dark:text-amber-100">
      <div className="text-sm font-semibold">{title}</div>
      <Text className="mt-1 text-sm dark:text-amber-50">{error.userMessage}</Text>
      {error.requestId ? (
        <Text className="mt-2 text-xs dark:text-amber-100/80">
          Request ID:{' '}
          <code className="rounded bg-amber-100/70 px-1 py-0.5 text-[11px] text-amber-950 dark:bg-white/10 dark:text-amber-50">
            {error.requestId}
          </code>
        </Text>
      ) : null}
      <a
        className="mt-2 inline-block text-xs font-medium text-amber-900 underline decoration-amber-700/50 underline-offset-2 dark:text-amber-50 dark:decoration-amber-100/40"
        href={error.troubleshootingUrl}
        target="_blank"
        rel="noreferrer"
      >
        Troubleshoot with request IDs
      </a>
    </section>
  )
}

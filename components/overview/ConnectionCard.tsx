'use client'

import { Button } from '@/components/catalyst/button'
import { Text } from '@/components/catalyst/text'
import { getEnvBaseUrl } from '@/components/portal/env'
import type { Environment } from '@/lib/api/types'
import { useMemo, useState } from 'react'

const EXAMPLE_ENDPOINT = '/v1/views/metrics'

export function ConnectionCard({ environment }: { environment: Environment }) {
  const [copied, setCopied] = useState(false)
  const baseUrl = getEnvBaseUrl(environment)

  const curlSnippet = useMemo(
    () =>
      `curl -X GET '${baseUrl}${EXAMPLE_ENDPOINT}' \\
  -H 'X-Api-Key: <YOUR_API_KEY>' \\
  -H 'X-Request-ID: quickstart_001' \\
  -H 'Accept: application/json'`,
    [baseUrl]
  )

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Connection</div>
          <Text className="mt-1 text-xs text-zinc-600">Use this base URL for your current environment.</Text>
        </div>
        <Button
          color="white"
          onClick={async () => {
            await navigator.clipboard.writeText(baseUrl)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? 'Copied' : 'Copy base URL'}
        </Button>
      </div>

      <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <Text className="text-xs uppercase tracking-wide text-zinc-500">Base URL</Text>
        <code className="mt-1 block text-sm text-zinc-900">{baseUrl}</code>
      </div>

      <div className="mt-3">
        <Text className="text-xs uppercase tracking-wide text-zinc-500">Example request</Text>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">{curlSnippet}</pre>
      </div>
    </section>
  )
}

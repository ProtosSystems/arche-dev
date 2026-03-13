'use client'

import { Button } from '@/components/catalyst/button'
import { Text } from '@/components/catalyst/text'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const API_BASE_URL = 'https://api.arche.fi'
const EXAMPLE_ENDPOINT = '/v1/edgar/companies/AAPL'

type ConnectionCardProps = {
  hasActiveKey: boolean
}

export function ConnectionCard({ hasActiveKey }: ConnectionCardProps) {
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false)
  const [copiedRequest, setCopiedRequest] = useState(false)
  const baseUrl = API_BASE_URL

  const curlSnippet = useMemo(
    () =>
      `curl -X GET '${baseUrl}${EXAMPLE_ENDPOINT}' \\
  -H 'X-Api-Key: ${hasActiveKey ? '<YOUR_ACTIVE_API_KEY>' : '<CREATE_API_KEY_FIRST>'}' \\
  -H 'X-Request-ID: quickstart_001' \\
  -H 'Accept: application/json'`,
    [baseUrl, hasActiveKey]
  )

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Make your first request</div>
          <Text className="mt-1 text-xs text-zinc-600">
            Step 3: use your active API key to run one request against the production API.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="dark:border-[var(--protos-mist-300)] dark:!text-[#0F172A] dark:[--btn-bg:var(--protos-mist-300)] dark:[--btn-border:var(--protos-mist-300)] dark:[--btn-hover-overlay:var(--color-white)]/25"
            color="light"
            onClick={async () => {
              await navigator.clipboard.writeText(baseUrl)
              setCopiedBaseUrl(true)
              window.setTimeout(() => setCopiedBaseUrl(false), 1200)
            }}
          >
            {copiedBaseUrl ? 'Copied' : 'Copy base URL'}
          </Button>
          <Button
            outline
            className="min-h-10"
            onClick={async () => {
              await navigator.clipboard.writeText(curlSnippet)
              setCopiedRequest(true)
              window.setTimeout(() => setCopiedRequest(false), 1200)
            }}
          >
            {copiedRequest ? 'Copied' : 'Copy request'}
          </Button>
        </div>
      </div>

      {!hasActiveKey ? (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-300/25 dark:bg-amber-200/10 dark:text-amber-100">
          Step 2 is not complete yet. Create an API key in <Link href="/keys" className="font-semibold underline">API Keys</Link> first.
        </div>
      ) : null}

      <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
        <Text className="text-xs uppercase tracking-wide text-zinc-500">Base URL</Text>
        <code className="mt-1 block text-sm text-zinc-900 dark:text-white">{baseUrl}</code>
      </div>

      <div className="mt-3">
        <Text className="text-xs uppercase tracking-wide text-zinc-500">Example request</Text>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100 dark:border dark:border-white/10 dark:bg-[#07172C]">
          {curlSnippet}
        </pre>
      </div>

      <div className="mt-3">
        <Button outline href="https://docs.arche.fi/quickstart" target="_blank" rel="noreferrer">
          Open quickstart docs
        </Button>
      </div>
    </section>
  )
}

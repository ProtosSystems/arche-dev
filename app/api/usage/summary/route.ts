import { archeApiRequest, jsonError } from '@/lib/arche-api.server'
import type { SuccessEnvelope, UsageSummary } from '@/lib/api/types'
import { recordActivationEvent } from '@/lib/dev-metrics/store'
import { usageSignalFromSummary } from '@/lib/dev-metrics/usage-signals'
import { requireCurrentUserId } from '@/lib/dev-metrics/user'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const path = `/v1/protected/usage/summary${query ? `?${query}` : ''}`
  const res = await archeApiRequest<SuccessEnvelope<UsageSummary>>(request, path)
  if (!res.ok) {
    return jsonError(res)
  }

  const userId = await requireCurrentUserId().catch(() => null)
  const signal = usageSignalFromSummary(res.data.data)
  if (userId && signal) {
    queueMicrotask(() => {
      recordActivationEvent({
        userId,
        type: 'first_api_request',
        statusCode: signal.statusCode,
        endpoint: signal.endpoint,
      })
      if (signal.statusCode !== null && signal.statusCode >= 200 && signal.statusCode < 300) {
        recordActivationEvent({
          userId,
          type: 'first_successful_api_call',
          statusCode: signal.statusCode,
          endpoint: signal.endpoint,
        })
      }
    })
  }

  return NextResponse.json(res.data, { status: res.status })
}

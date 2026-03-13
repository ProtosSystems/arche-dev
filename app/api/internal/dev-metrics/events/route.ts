import { recordActivationEvent, type ActivationEventType } from '@/lib/dev-metrics/store'
import { requireCurrentUserId } from '@/lib/dev-metrics/user'
import { NextResponse } from 'next/server'

const ALLOWED: ActivationEventType[] = ['docs_quickstart_viewed']

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const event = typeof body?.event === 'string' ? (body.event as ActivationEventType) : null
  if (!event || !ALLOWED.includes(event)) {
    return NextResponse.json({ error: { message: 'event_not_allowed' } }, { status: 422 })
  }

  const userId = await requireCurrentUserId().catch(() => null)
  if (!userId) {
    return NextResponse.json({ error: { message: 'unauthorized' } }, { status: 401 })
  }

  queueMicrotask(() => {
    recordActivationEvent({ userId, type: event })
  })
  return NextResponse.json({ ok: true }, { status: 202 })
}

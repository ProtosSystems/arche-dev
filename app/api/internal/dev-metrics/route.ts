import { getDevMetricsSnapshot } from '@/lib/dev-metrics/store'
import { isAdminUser, resolveCurrentUserId } from '@/lib/dev-metrics/user'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = await resolveCurrentUserId()
  if (!isAdminUser(userId)) {
    return NextResponse.json({ error: { message: 'forbidden' } }, { status: 403 })
  }
  return NextResponse.json({ data: getDevMetricsSnapshot() }, { status: 200 })
}

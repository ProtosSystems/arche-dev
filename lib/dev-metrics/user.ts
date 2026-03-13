import { auth } from '@clerk/nextjs/server'

export async function resolveCurrentUserId(): Promise<string | null> {
  if (process.env.AUTH_DISABLED_FOR_DEV === 'true') {
    return 'dev-local-user'
  }
  const session = await auth()
  return session.userId ?? null
}

export async function requireCurrentUserId(): Promise<string> {
  const userId = await resolveCurrentUserId()
  if (!userId) {
    throw new Error('unauthorized')
  }
  return userId
}

export function isAdminUser(userId: string | null): boolean {
  if (!userId) {
    return false
  }
  if (process.env.AUTH_DISABLED_FOR_DEV === 'true') {
    return true
  }
  const allowed = (process.env.PORTAL_ADMIN_USER_IDS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return allowed.includes(userId)
}

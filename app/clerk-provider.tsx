'use client'

import { ClerkProvider } from '@clerk/nextjs'

export default function ClerkProviderClient({ children }: { children: React.ReactNode }) {
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (authDisabled) {
    return <>{children}</>
  }

  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}

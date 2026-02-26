'use client'

import { ClerkProvider } from '@clerk/clerk-react'

export default function ClerkProviderClient({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    if (process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true') {
      return <>{children}</>
    }
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
}

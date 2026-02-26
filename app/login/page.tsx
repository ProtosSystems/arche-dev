'use client'

import { SignIn } from '@clerk/clerk-react'

export default function LoginPage() {
  if (process.env.AUTH_DISABLED_FOR_DEV === 'true') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
          <h1 className="text-lg font-semibold text-zinc-900">Authentication disabled</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Set <code>AUTH_DISABLED_FOR_DEV=false</code> to use Clerk login.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <SignIn path="/login" routing="path" signUpUrl="/login" afterSignInUrl="/" />
    </div>
  )
}

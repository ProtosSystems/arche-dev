import Link from 'next/link'

export default function LoginPage() {
  if (process.env.AUTH_DISABLED_FOR_DEV === 'true') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
          <h1 className="text-lg font-semibold text-zinc-900">Authentication disabled</h1>
          <p className="mt-2 text-sm text-zinc-600">Set AUTH_DISABLED_FOR_DEV=false to enforce middleware auth.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
        <h1 className="text-lg font-semibold text-zinc-900">Sign in required</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Access protected routes to trigger Clerk sign-in via middleware redirect.
        </p>
        <Link className="mt-4 inline-block text-sm text-blue-700 hover:underline" href="/">
          Go to portal
        </Link>
      </div>
    </div>
  )
}

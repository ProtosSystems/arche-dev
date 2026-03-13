'use client'

import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED_FOR_DEV === 'true'

  if (authDisabled) {
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
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef2f7_0%,#e3e9f2_100%)] px-6">
      <div className="login-shell w-full max-w-md">
        <div className="mb-5 text-center">
          <div className="font-sans text-[1.65rem] font-normal tracking-[-0.02em] text-[#0F172A]">⍺rche developer portal</div>
        </div>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            variables: {
              colorPrimary: '#0F172A',
            },
            elements: {
              card: 'rounded-2xl border border-zinc-200 bg-white shadow-sm',
              cardBox: 'shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'font-sans text-sm text-zinc-600',
              socialButtonsBlockButton:
                'rounded-xl border border-zinc-200 text-zinc-900 shadow-none hover:bg-zinc-50 font-sans',
              dividerLine: 'bg-zinc-200',
              dividerText: 'font-sans text-zinc-500',
              formFieldLabel: 'font-sans text-zinc-700',
              formFieldInput:
                'font-sans rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-none focus:border-zinc-400 focus:ring-0',
              formButtonPrimary:
                'font-sans rounded-xl text-white shadow-none [&_svg]:hidden',
              footerActionText: 'font-sans text-zinc-500',
              footerActionLink: 'font-sans text-zinc-900 underline',
            },
          }}
        />
      </div>
      <style jsx global>{`
        .login-shell .cl-formButtonPrimary,
        .login-shell .cl-formButtonPrimary:hover,
        .login-shell .cl-formButtonPrimary:focus,
        .login-shell .cl-formButtonPrimary:active {
          background: #0f172a !important;
          border-color: #0f172a !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  )
}

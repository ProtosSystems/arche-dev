import { getSiteUrl } from '@/lib/site'
import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Arche Developer Portal',
  description:
    'Point-in-time financial fundamentals with audit lineage. Manage API keys, usage, and billing.',
  alternates: { canonical: '/' },
}

const COVERAGE = [
  { value: '15,500', label: 'companies' },
  { value: '92.7%', label: 'gap-free across each filer’s reporting life' },
  { value: '2011', label: 'history from' },
]

/**
 * Public landing page.
 *
 * Everything else on this host sits behind Clerk, which meant an anonymous
 * visitor -- including a payment provider verifying the domain -- was redirected
 * to a sign-in form and saw no site at all. This is the one page that answers
 * "what is this" without an account. Signed-in visitors go straight to the
 * dashboard.
 */
export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) {
    redirect('/dashboard')
  }

  const siteUrl = getSiteUrl()

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16">
      <div className="text-3xl text-zinc-900 dark:text-white">⍺rche</div>
      <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-white">
        Point-in-time financial fundamentals, with the audit trail attached
      </h1>
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        Arche serves normalized SEC filing data that answers what was knowable on a given date —
        statement versions, restatement lineage, reconciliation, and a reproducible snapshot
        fingerprint for every result. This portal is where you create API keys, watch usage, and
        manage billing.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {COVERAGE.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <dt className="text-xl font-semibold text-zinc-900 dark:text-white">{item.value}</dt>
            <dd className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{item.label}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950/2.5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
        >
          Create an account
        </Link>
        <a
          href="https://docs.arche.fi"
          className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
        >
          Documentation
        </a>
      </div>

      <p className="mt-12 text-xs text-zinc-500 dark:text-zinc-500">
        {new URL('/', siteUrl).host} · Operated by Protos Systems
      </p>
    </main>
  )
}

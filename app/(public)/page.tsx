import { PLANS, formatUsd } from '@/lib/pricing'
import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  // Absolute, or the root layout's `%s | Arche Developer Portal` template
  // renders the tab title as the name twice over.
  title: { absolute: 'Arche Developer Portal' },
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
 * Everything under `(portal)` sits behind Clerk, which meant an anonymous
 * visitor -- including a payment provider verifying the domain -- was
 * redirected to a sign-in form and saw no site at all. This page, and the rest
 * of the `(public)` group, answer "what is this, what does it cost, and who is
 * selling it" without an account. Signed-in visitors go straight to the
 * dashboard.
 */
export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) {
    redirect('/dashboard')
  }

  const entry = PLANS.find((plan) => plan.id === 'developer')

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
        Point-in-time financial fundamentals, with the audit trail attached
      </h1>
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        Arche serves normalized SEC filing data that answers what was knowable on a given date — statement versions,
        restatement lineage, reconciliation, and a reproducible snapshot fingerprint for every result. This portal is
        where you create API keys, watch usage, and manage billing.
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

      <p className="mt-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Free to start with the Dow 30 and no card. Paid plans widen the coverage universe and the rate limit, from{' '}
        {entry ? formatUsd(entry.monthlyUsd ?? 0) : '$99'} per month.{' '}
        <Link href="/pricing" className="font-medium underline">
          See all plans and prices
        </Link>
        .
      </p>

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
        <Link href="/pricing" className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300">
          Pricing
        </Link>
        <a href="https://docs.arche.fi" className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300">
          Documentation
        </a>
      </div>
    </main>
  )
}

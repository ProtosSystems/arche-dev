import { AuthFooter } from '@/components/public/AuthFooter'
import { MARKETING_ORIGIN, marketingUrl } from '@/lib/public-site'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Arche Developer Portal' },
  description:
    'Point-in-time financial fundamentals with audit lineage. Create API keys, watch usage, and manage billing.',
  alternates: { canonical: '/' },
}

const COVERAGE = [
  { value: '15,500', label: 'companies' },
  { value: '92.7%', label: 'gap-free across each filer’s reporting life' },
  { value: '2011', label: 'history from' },
]

/**
 * The front door of the application domain.
 *
 * This was a redirect to /login for a day, which is the convention for an
 * application domain and the wrong answer here. Paddle approves each domain
 * that opens a checkout, and its automated check reads a root that redirects
 * to a sign-in form as a login wall -- correctly, because that is what it is.
 * This domain has to pass that check, so it answers 200 and says what the
 * product is, who sells it, and where the pricing and policies are.
 *
 * It is not a second copy of arche.fi. Pricing, the four policies, and contact
 * live there and are linked, never duplicated; `next.config.mjs` forwards
 * those paths and the contract test fails if a page here shadows one.
 */
export default function RootPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16">
      <div className="text-3xl text-zinc-900">⍺rche</div>
      <h1 className="mt-6 text-2xl font-semibold text-zinc-900">
        Point-in-time financial fundamentals, with the audit trail attached
      </h1>
      <p className="mt-4 text-base leading-relaxed text-zinc-700">
        Arche serves normalized SEC filing data that answers what was knowable on a given date — statement versions,
        restatement lineage, reconciliation, and a reproducible snapshot fingerprint for every result. This portal is
        where you create API keys, watch usage, and manage billing.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {COVERAGE.map((item) => (
          <div key={item.label} className="rounded-xl border border-zinc-200 bg-white p-4">
            <dt className="text-xl font-semibold text-zinc-900">{item.value}</dt>
            <dd className="mt-1 text-xs text-zinc-600">{item.label}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-sm leading-relaxed text-zinc-700">
        Free to start with the Dow 30, no card required. Paid plans widen the coverage universe and the rate limit.{' '}
        <a href={marketingUrl('/pricing')} className="font-medium underline">
          See all plans and prices
        </a>{' '}
        on{' '}
        <a href={MARKETING_ORIGIN} className="font-medium underline">
          arche.fi
        </a>
        .
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950/2.5"
        >
          Create an account
        </Link>
        <a href="https://docs.arche.fi" className="text-sm font-medium text-zinc-700 underline">
          Documentation
        </a>
      </div>

      <AuthFooter />
    </main>
  )
}

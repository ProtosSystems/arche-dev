import { PLANS, formatUsd } from '@/lib/pricing'
import { MERCHANT_OF_RECORD, SUPPORT_EMAIL } from '@/lib/public-site'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Arche API plans and prices in USD: Free, Developer, Growth, Scale, and Enterprise, with the coverage universe, rate limits, and API key counts each one grants.',
  alternates: { canonical: '/pricing' },
}

/**
 * Published prices, on the domain that runs checkout.
 *
 * Neither this host nor the marketing site showed a number before: the
 * marketing pricing page says access is granted case by case and invites a
 * request for early access, which is accurate for enterprise licensing and
 * indistinguishable from an unfinished site to anyone verifying that a
 * self-serve checkout sells something at a stated price.
 */
export default function PricingPage() {
  const offers = PLANS.filter((plan) => plan.monthlyUsd !== null).map((plan) => ({
    '@type': 'Offer',
    name: `${plan.name} monthly`,
    price: plan.monthlyUsd,
    priceCurrency: 'USD',
    url: 'https://app.arche.fi/pricing',
  }))

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Arche API',
    description:
      'Point-in-time financial fundamentals from SEC filings, with statement versions, restatement lineage, and a reproducible snapshot fingerprint.',
    brand: { '@type': 'Brand', name: 'Arche' },
    offers,
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Pricing</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        Plans are priced per organization in US dollars and billed in advance, monthly or annually. Every plan gates
        on how many companies you can query, how fast you can query them, and which capabilities are enabled — never
        on the as-of date, because point-in-time retrieval is the product.
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => (
          <section
            key={plan.id}
            className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{plan.name}</h2>
              <div className="text-right">
                {plan.monthlyUsd === null ? (
                  <div className="text-xl font-semibold text-zinc-900 dark:text-white">Contact us</div>
                ) : (
                  <>
                    <div className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {formatUsd(plan.monthlyUsd)}
                      <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400"> /month</span>
                    </div>
                    {plan.annualUsd ? (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        or {formatUsd(plan.annualUsd)} /year
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{plan.tagline}</p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-500">Coverage</dt>
                <dd className="text-zinc-900 dark:text-white">{plan.universe}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-500">API keys</dt>
                <dd className="text-zinc-900 dark:text-white">{plan.apiKeys}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-500">Reads / minute</dt>
                <dd className="text-zinc-900 dark:text-white">{plan.readsPerMinute}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-500">Modeling calls / minute</dt>
                <dd className="text-zinc-900 dark:text-white">{plan.modelingPerMinute}</dd>
              </div>
            </dl>

            <ul className="mt-4 flex-1 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              {plan.capabilities.map((capability) => (
                <li key={capability} className="flex gap-2">
                  <span aria-hidden="true" className="text-zinc-400">
                    —
                  </span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <Link
                href={plan.cta.href}
                className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {plan.cta.label}
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-zinc-200 pt-8 dark:border-white/10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Billing</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <li>
            All prices are in US dollars and exclude any sales tax or VAT, which is calculated at checkout based on
            your billing country.
          </li>
          <li>
            Paid plans renew automatically for the term you selected until cancelled. Cancel at any time from
            Billing in the portal; access continues to the end of the period you have already paid for.
          </li>
          <li>
            Payments are processed by {MERCHANT_OF_RECORD}, our merchant of record. See the{' '}
            <Link href="/legal/refund-policy" className="underline">
              Refund Policy
            </Link>{' '}
            and{' '}
            <Link href="/legal/terms" className="underline">
              Terms of Service
            </Link>
            .
          </li>
          <li>
            Enterprise plans are quoted per agreement. Email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
              {SUPPORT_EMAIL}
            </a>{' '}
            with your coverage and SLA requirements.
          </li>
        </ul>
      </section>
    </main>
  )
}

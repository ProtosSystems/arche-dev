import { LEGAL_ADDRESS_LINES, LEGAL_ENTITY, MERCHANT_OF_RECORD, SUPPORT_EMAIL } from '@/lib/public-site'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Reach ${LEGAL_ENTITY} about Arche API support, billing, enterprise licensing, or security reports.`,
  alternates: { canonical: '/contact' },
}

const REASONS = [
  {
    heading: 'Support and technical questions',
    body: 'Include the request ID from the failing response. Every Arche API response carries one, and it is what lets us find your exact request in the logs.',
  },
  {
    heading: 'Billing and invoices',
    body: 'Include the invoice number. Subscriptions can also be changed or cancelled from the Billing page in the portal without contacting us.',
  },
  {
    heading: 'Enterprise licensing',
    body: 'Tell us the coverage, historical depth, and SLA you need. Enterprise plans are quoted per agreement rather than by the published plans.',
  },
  {
    heading: 'Security reports',
    body: 'Send reproduction details and impact context. Please do not perform intrusive testing without prior written authorization.',
  },
] as const

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Contact</h1>
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        The Arche API is operated by {LEGAL_ENTITY}. Email is the fastest route for everything below, and we answer
        within one business day.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">Email</div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-1 block text-lg font-semibold text-zinc-900 underline dark:text-white"
        >
          {SUPPORT_EMAIL}
        </a>

        <div className="mt-5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">Registered address</div>
        <address className="mt-1 text-sm not-italic leading-relaxed text-zinc-800 dark:text-zinc-200">
          {LEGAL_ENTITY}
          <br />
          {LEGAL_ADDRESS_LINES.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </address>
      </div>

      <dl className="mt-8 space-y-5">
        {REASONS.map((reason) => (
          <div key={reason.heading}>
            <dt className="text-sm font-semibold text-zinc-900 dark:text-white">{reason.heading}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{reason.body}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Payments and invoicing are handled by {MERCHANT_OF_RECORD} as merchant of record. For a refund or a billing
        correction, email us first — see the{' '}
        <Link href="/legal/refund-policy" className="underline">
          Refund Policy
        </Link>
        .
      </p>
    </main>
  )
}

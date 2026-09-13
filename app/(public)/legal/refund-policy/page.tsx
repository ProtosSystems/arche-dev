import { LegalHeading, LegalPage } from '@/components/public/LegalPage'
import { MERCHANT_OF_RECORD, SUPPORT_EMAIL } from '@/lib/public-site'
import type { Metadata } from 'next'
import Link from 'next/link'

const LAST_UPDATED = 'September 13, 2026'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'How Arche handles subscription billing, cancellation timing, and the limited circumstances in which refunds are issued.',
  alternates: { canonical: '/legal/refund-policy' },
}

/**
 * Rewritten against what checkout actually charges.
 *
 * The previous policy described a 7-day free trial converting to a paid annual
 * license. What Paddle sells is a monthly or annual subscription with no trial
 * step, alongside a free plan that does not expire, so the published terms
 * described billing that does not happen -- the one page a payment provider
 * reads most closely, disagreeing with the transaction it is reviewing.
 */
export default function RefundPolicyPage() {
  return (
    <LegalPage
      label="Billing"
      title="Refund Policy"
      subtitle="This Refund Policy explains how Arche subscriptions are billed, how to cancel, and when a refund is issued."
      lastUpdated={LAST_UPDATED}
      canonicalPath="/legal/refund-policy"
    >
      <p>By purchasing a subscription to the Arche API, you agree to this Refund Policy.</p>

      <LegalHeading>Evaluating before you buy</LegalHeading>
      <p>
        The Free plan requires no payment details and does not expire. It grants the same point-in-time retrieval,
        statement versioning, and lineage as the paid plans across a smaller universe of companies, so the service
        can be evaluated in full before any charge is made.
      </p>

      <LegalHeading>Subscription billing</LegalHeading>
      <p>
        Paid plans are billed in advance for the term selected at checkout — monthly or annual — at the price shown
        on the{' '}
        <Link href="/pricing" className="underline">
          pricing page
        </Link>
        . Subscriptions renew automatically for the same term until cancelled. If a plan includes a trial period, its
        length and end date are shown at checkout and no charge is made until it ends.
      </p>

      <LegalHeading>Cancellation</LegalHeading>
      <p>
        You can cancel at any time from the Billing page in the developer portal, or by emailing{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
          {SUPPORT_EMAIL}
        </a>
        . Cancelling stops the next renewal. Access continues until the end of the period you have already paid for,
        and the unused remainder of that period is not refunded.
      </p>

      <LegalHeading>Refunds</LegalHeading>
      <p>
        Because Arche provides immediate access to proprietary financial data infrastructure, charges are final once
        a billing period has begun. Refunds are issued in the following circumstances:
      </p>
      <ul className="list-disc space-y-1.5 pl-6">
        <li>Duplicate payments.</li>
        <li>Billing errors, including a charge at the wrong amount or for a plan that was not purchased.</li>
        <li>
          Where a refund is required by consumer protection or other law applicable in your jurisdiction.{' '}
          {MERCHANT_OF_RECORD}, as merchant of record, administers these.
        </li>
      </ul>
      <p>
        Other requests are reviewed case by case at our discretion. Email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        with the invoice number and we will respond within five business days.
      </p>

      <LegalHeading>How refunds are paid</LegalHeading>
      <p>
        Approved refunds are returned to the original payment method by {MERCHANT_OF_RECORD}. The time to appear on a
        statement depends on your bank, and is typically five to ten business days.
      </p>
    </LegalPage>
  )
}

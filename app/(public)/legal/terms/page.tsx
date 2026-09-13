import { LegalHeading, LegalPage } from '@/components/public/LegalPage'
import { LEGAL_ADDRESS_LINES, LEGAL_ENTITY, MERCHANT_OF_RECORD, SUPPORT_EMAIL } from '@/lib/public-site'
import type { Metadata } from 'next'
import Link from 'next/link'

const LAST_UPDATED = 'September 13, 2026'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms governing access to and use of the Arche API, including account security, billing, acceptable use, and service limitations.',
  alternates: { canonical: '/legal/terms' },
}

export default function TermsOfServicePage() {
  return (
    <LegalPage
      label="Terms"
      title="Terms of Service"
      subtitle="These Terms govern your use of the Arche API, including operational responsibilities, billing obligations, and permitted use."
      lastUpdated={LAST_UPDATED}
      canonicalPath="/legal/terms"
    >
      <LegalHeading>Who you are contracting with</LegalHeading>
      <p>
        The Arche API is operated by {LEGAL_ENTITY}, {LEGAL_ADDRESS_LINES.join(', ')}. Subscriptions are sold through{' '}
        {MERCHANT_OF_RECORD}, which acts as the merchant of record for the transaction and appears as the seller on
        your invoice and card statement.
      </p>

      <LegalHeading>Acceptance and eligibility</LegalHeading>
      <p>
        By accessing or using the Arche API, you agree to these Terms of Service. You represent that you have
        authority to bind the company or organization using the service and that you will use the service only in
        compliance with applicable laws and regulations.
      </p>

      <LegalHeading>Accounts and API keys</LegalHeading>
      <p>
        You must maintain accurate account information and keep API keys confidential. You are responsible for all
        activity under your credentials, including usage caused by unauthorized access resulting from your failure to
        secure keys.
      </p>
      <p>
        Arche may apply rate limits, traffic shaping, or access restrictions to protect reliability and prevent
        abuse. You may not attempt to bypass limits or interfere with service operation.
      </p>

      <LegalHeading>Fees and billing</LegalHeading>
      <p>
        Paid plans are billed in advance for the term you select at checkout, at the price shown on the{' '}
        <Link href="/pricing" className="underline">
          pricing page
        </Link>
        . Subscriptions renew automatically for the same term until cancelled. A free plan is available and does not
        expire. Enterprise access is priced per agreement rather than by the published plans.
      </p>
      <p>
        Payment processing, invoicing, and applicable sales tax or VAT are handled by {MERCHANT_OF_RECORD}. Refund
        eligibility and cancellation timing are described in the{' '}
        <Link href="/legal/refund-policy" className="underline">
          Refund Policy
        </Link>
        .
      </p>

      <LegalHeading>Acceptable use</LegalHeading>
      <p>
        You may not use the Arche API for unlawful activity, attempts to gain unauthorized access, disruption of
        service operation, reverse engineering except where legally protected, or security testing without prior
        written permission from Arche.
      </p>

      <LegalHeading>Usage limits</LegalHeading>
      <p>
        Access to the Arche API is subject to usage limits designed to ensure platform reliability and fair access
        for all users. Arche may enforce rate limits, throughput limits, or other technical controls. The limits that
        apply to each plan are published on the pricing page and returned on every response.
      </p>
      <p>
        You may not attempt to circumvent usage limits, extract data in a manner inconsistent with the intended use
        of the service, or operate automated systems that materially degrade service performance for other users.
      </p>
      <p>
        Arche reserves the right to suspend or restrict access if usage patterns threaten platform stability, violate
        these Terms, or exceed the limits of the applicable plan.
      </p>

      <LegalHeading>Service availability and changes</LegalHeading>
      <p>
        We work to maintain reliable service, but availability is not guaranteed except where an Enterprise agreement
        states otherwise. We may update, modify, or discontinue features, endpoints, or data fields over time,
        including for security, legal, or operational reasons.
      </p>

      <LegalHeading>Disclaimers</LegalHeading>
      <p>
        Arche API data and services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
        Arche provides financial data infrastructure and does not provide investment, legal, accounting, or tax
        advice.
      </p>

      <LegalHeading>Financial data disclaimer</LegalHeading>
      <p>
        The Arche API provides access to financial data derived from public disclosures and other sources. While we
        strive to maintain accurate and reliable data, Arche does not guarantee the completeness, accuracy, or
        timeliness of any data provided through the service.
      </p>
      <p>
        The service is intended for informational and analytical purposes only. Arche does not provide investment
        advice, financial advice, legal advice, accounting advice, or tax advice. Users are solely responsible for
        evaluating the suitability of any data for their particular use case.
      </p>

      <LegalHeading>Intellectual property</LegalHeading>
      <p>
        Arche and its licensors retain all rights in the service, software, and related materials. Subject to these
        Terms and any applicable agreement, you receive a limited, non-exclusive, non-transferable right to access
        and use the service.
      </p>

      <LegalHeading>Termination</LegalHeading>
      <p>
        Either party may terminate service access as permitted by the applicable agreement. Arche may suspend or
        terminate access for non-payment, security risk, legal compliance reasons, or material breach of these Terms.
      </p>

      <LegalHeading>Limitation of liability and warranty disclaimer</LegalHeading>
      <p>
        To the maximum extent permitted by law, Arche disclaims implied warranties and is not liable for indirect,
        incidental, special, consequential, or punitive damages, or for lost profits, revenues, data, or goodwill
        arising from use of the service.
      </p>

      <LegalHeading>Governing law</LegalHeading>
      <p>
        These Terms are governed by the laws of the Commonwealth of Virginia, without regard to conflict-of-laws
        rules. The parties consent to exclusive jurisdiction and venue in the state and federal courts located in
        Virginia.
      </p>

      <LegalHeading>Contact</LegalHeading>
      <p>
        {LEGAL_ENTITY}, {LEGAL_ADDRESS_LINES.join(', ')}. For legal or contractual questions, email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </LegalPage>
  )
}

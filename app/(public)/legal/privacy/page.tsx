import { LegalHeading, LegalPage } from '@/components/public/LegalPage'
import { LEGAL_ADDRESS_LINES, LEGAL_ENTITY, MERCHANT_OF_RECORD, SUPPORT_EMAIL } from '@/lib/public-site'
import type { Metadata } from 'next'

const LAST_UPDATED = 'September 13, 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Arche collects, uses, retains, and safeguards personal and technical information for accounts, billing, and API usage.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Privacy Policy"
      subtitle="This Privacy Policy explains how Arche handles personal data associated with account administration and developer use of the Arche API."
      lastUpdated={LAST_UPDATED}
      canonicalPath="/legal/privacy"
    >
      <LegalHeading>Overview</LegalHeading>
      <p>
        The Arche API is a developer-first financial data platform focused on deterministic, audit-grade EDGAR and
        normalized XBRL data, operated by {LEGAL_ENTITY}. This Privacy Policy describes how we collect, use, and
        share information when you use our website, the developer portal, the API, and our support channels.
      </p>

      <LegalHeading>Information we collect</LegalHeading>
      <p>
        We collect account information such as name, work email, organization, role, and authentication details when
        you register for access. For billing, subscription and transaction details are processed by{' '}
        {MERCHANT_OF_RECORD} as merchant of record. We do not receive or store full payment card numbers.
      </p>
      <p>
        We collect API telemetry to operate and secure the service, including timestamps, endpoint path, request
        volume, response status, IP address, and user agent. We also collect information you provide through support
        communications, and use privacy-preserving analytics on public pages to understand page performance and
        traffic trends.
      </p>

      <LegalHeading>How we use information</LegalHeading>
      <p>
        We use information to provide and maintain the Arche API, authenticate users, enforce usage policies, process
        billing, respond to support requests, detect abuse, and improve product reliability and documentation
        quality.
      </p>

      <LegalHeading>How we share information</LegalHeading>
      <p>
        We may share information with service providers that support hosting, observability, communications, and
        payment operations. We may also disclose information when required by law, legal process, or to protect the
        rights and safety of Arche, our users, or others. If Arche is involved in a merger, acquisition, or asset
        transfer, information may be transferred as part of that transaction. We do not sell personal information.
      </p>

      <LegalHeading>Retention</LegalHeading>
      <p>
        We retain information for as long as needed to provide services, maintain security and audit logs, resolve
        disputes, and satisfy legal, accounting, or contractual obligations. Retention periods vary by data category
        and operational need.
      </p>

      <LegalHeading>Security</LegalHeading>
      <p>
        We use administrative, technical, and organizational safeguards designed to protect information. No system
        can guarantee absolute security, but we continuously evaluate controls based on risk and service
        requirements. Our practices are described on the Security page.
      </p>

      <LegalHeading>Your choices and rights</LegalHeading>
      <p>
        Depending on applicable law, you may have rights to access, correct, delete, or restrict use of certain
        personal information. Email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        to make a request. We evaluate and respond to verified requests as required by law and consistent with
        platform security and business recordkeeping obligations.
      </p>

      <LegalHeading>Changes</LegalHeading>
      <p>
        We may update this Privacy Policy periodically. Material updates are reflected by revising the last updated
        date on this page.
      </p>

      <LegalHeading>Contact</LegalHeading>
      <p>
        {LEGAL_ENTITY}, {LEGAL_ADDRESS_LINES.join(', ')}. Privacy enquiries:{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </LegalPage>
  )
}

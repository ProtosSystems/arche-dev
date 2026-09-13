import { LegalHeading, LegalPage } from '@/components/public/LegalPage'
import { MERCHANT_OF_RECORD, SUPPORT_EMAIL } from '@/lib/public-site'
import type { Metadata } from 'next'

const LAST_UPDATED = 'September 13, 2026'

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Arche API security practices for encryption, access controls, monitoring, incident response, and vulnerability reporting.',
  alternates: { canonical: '/legal/security' },
}

export default function SecurityPage() {
  return (
    <LegalPage
      label="Security"
      title="Security"
      subtitle="Arche applies practical, risk-based security controls to protect customer data and maintain dependable API operations."
      lastUpdated={LAST_UPDATED}
      canonicalPath="/legal/security"
    >
      <LegalHeading>Security overview</LegalHeading>
      <p>
        Security at Arche is designed around protecting developer credentials, service integrity, and data
        confidentiality while supporting deterministic, audit-grade data delivery workflows.
      </p>

      <LegalHeading>Encryption</LegalHeading>
      <p>
        Arche API traffic is encrypted in transit using modern TLS. Data is encrypted at rest where supported by the
        underlying managed services and storage systems.
      </p>

      <LegalHeading>Access controls</LegalHeading>
      <p>
        Internal access is limited by role and business need. We apply least-privilege access principles, maintain
        key and secret management practices, and retain audit logs to support review and investigation.
      </p>

      <LegalHeading>Payment data</LegalHeading>
      <p>
        Card details are entered directly with {MERCHANT_OF_RECORD} and are never transmitted to or stored on Arche
        systems. Arche stores only the subscription identifiers needed to know what an organization is entitled to.
      </p>

      <LegalHeading>Monitoring and incident response</LegalHeading>
      <p>
        We maintain service and security monitoring for anomalous behavior, operational failures, and potential
        abuse. Incident response processes are designed to triage, contain, remediate, and communicate material
        issues in a timely manner.
      </p>

      <LegalHeading>Vulnerability reporting</LegalHeading>
      <p>
        If you identify a potential vulnerability, email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
          {SUPPORT_EMAIL}
        </a>{' '}
        with reproduction details and impact context. Please do not perform intrusive testing against Arche systems
        without prior written authorization.
      </p>

      <LegalHeading>Subprocessors</LegalHeading>
      <p>
        Arche uses third-party providers for infrastructure, observability, and billing operations. A subprocessors
        list is available on request for applicable agreements.
      </p>
    </LegalPage>
  )
}

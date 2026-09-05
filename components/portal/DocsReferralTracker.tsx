'use client'

import { useEffect } from 'react'

const REFERRAL_PARAM = 'ref'
const DOCS_QUICKSTART_REFERRAL = 'quickstart'
const SESSION_FLAG = 'portal_docs_quickstart_referral_recorded'

/**
 * Records `docs_quickstart_viewed` when a developer arrives from the docs
 * quickstart.
 *
 * The event previously fired on Onboarding mount, which meant
 * `docs_to_api_latency_ms` measured time from opening a portal page rather than
 * from reading the docs. Attributing on the portal side keeps the identity that
 * the metric needs without cross-origin cookies: docs.arche.fi links here with
 * `?ref=quickstart`, and this records it once the Clerk session is available.
 */
export function DocsReferralTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const referral = new URLSearchParams(window.location.search).get(REFERRAL_PARAM)
    if (referral !== DOCS_QUICKSTART_REFERRAL) {
      return
    }

    try {
      if (window.sessionStorage.getItem(SESSION_FLAG) === 'true') {
        return
      }
      window.sessionStorage.setItem(SESSION_FLAG, 'true')
    } catch {
      // Private browsing can reject sessionStorage; recording twice beats not
      // recording at all.
    }

    void fetch('/api/internal/dev-metrics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'docs_quickstart_viewed' }),
    }).catch(() => undefined)
  }, [])

  return null
}

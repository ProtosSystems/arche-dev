/**
 * Facts a payment provider's domain review looks for, in one place.
 *
 * Paddle rejected this domain twice. The first rejection was reachability --
 * every path redirected an anonymous visitor to Clerk. The second arrived with
 * a live root page and a valid certificate, because a reviewer checks the
 * domain rather than one URL, and every path other than `/`, `/login`, and
 * `/sign-up` still answered with a sign-in redirect. A domain whose only
 * public surface is a hero and two auth buttons reads as a login wall.
 *
 * So the pages a buyer needs before paying -- what is sold and at what price,
 * the terms, how data is handled, how refunds work, and who the seller legally
 * is -- are served here, on the domain that runs checkout, rather than linked
 * out to the marketing site.
 */

export const LEGAL_ENTITY = 'Protos Systems LLC'
export const LEGAL_ADDRESS_LINES = [
  '3419 Virginia Beach Blvd #547',
  'Virginia Beach, VA 23452',
  'United States',
] as const
export const SUPPORT_EMAIL = 'hello@protos.fi'

/** Paddle is the merchant of record; buyers see Paddle on their statement. */
export const MERCHANT_OF_RECORD = 'Paddle.com Market Ltd'

export type PublicLink = { label: string; href: string; external?: boolean }

/** Public, crawlable pages. Every entry must resolve without a session. */
export const PUBLIC_LINKS: readonly PublicLink[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Documentation', href: 'https://docs.arche.fi', external: true },
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Refund Policy', href: '/legal/refund-policy' },
  { label: 'Security', href: '/legal/security' },
  { label: 'Contact', href: '/contact' },
]

/**
 * The canonical copy of each legal document lives on the marketing site. These
 * pages carry the same text so the checkout domain stands on its own, and each
 * declares the marketing URL as its canonical so search engines are told which
 * one is authoritative.
 */
export const MARKETING_ORIGIN = 'https://arche.fi'

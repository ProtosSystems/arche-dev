/**
 * The seller's details, and where the public pages live.
 *
 * They live on arche.fi. This host is the application: its only anonymous
 * surface is the sign-in and sign-up forms, which carry these links so a
 * visitor who arrives without an account -- including a payment provider
 * verifying the domain -- can reach what is sold, the terms governing it, and
 * who is selling it.
 *
 * Nothing here is a second copy of those pages. `app/page.tsx` explains why.
 */

export const MARKETING_ORIGIN = 'https://arche.fi'

export const LEGAL_ENTITY = 'Protos Systems LLC'
export const LEGAL_ADDRESS_LINES = [
  '3419 Virginia Beach Blvd #547',
  'Virginia Beach, VA 23452',
  'United States',
] as const
export const SUPPORT_EMAIL = 'hello@protos.fi'

/** Paddle is the merchant of record; buyers see Paddle on their statement. */
export const MERCHANT_OF_RECORD = 'Paddle.com Market Ltd'

/**
 * Paths this host forwards to the public site, and the links shown on the auth
 * pages. `next.config.mjs` redirects each of these permanently, so a visitor or
 * crawler that guesses `app.arche.fi/pricing` reaches the real page instead of
 * a sign-in redirect -- which is what it used to get.
 */
export const FORWARDED_PATHS = ['/pricing', '/contact', '/legal/terms', '/legal/privacy', '/legal/refund-policy', '/legal/security'] as const

export type PublicLink = { label: string; path: string }

export const PUBLIC_LINKS: readonly PublicLink[] = [
  { label: 'Pricing', path: '/pricing' },
  { label: 'Terms of Service', path: '/legal/terms' },
  { label: 'Privacy Policy', path: '/legal/privacy' },
  { label: 'Refund Policy', path: '/legal/refund-policy' },
  { label: 'Security', path: '/legal/security' },
  { label: 'Contact', path: '/contact' },
]

export function marketingUrl(path: string): string {
  return `${MARKETING_ORIGIN}${path}`
}

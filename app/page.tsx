import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: { absolute: 'Arche Developer Portal' },
  // Nothing to index: this route only forwards.
  robots: { index: false, follow: true },
}

/**
 * The application root is a router, not a page.
 *
 * This briefly held a landing page, and then pricing, policies, and a contact
 * page grew beside it -- all of which already existed on arche.fi, so two live
 * sites answered the same questions and the pricing pair answered them
 * differently. The public site is the single home for that content now.
 *
 * What is left is the convention every comparable product follows: signed out
 * goes to the sign-in form, signed in goes to the dashboard. The sign-in page
 * carries the links to arche.fi, so a visitor who arrives here anonymously --
 * including a payment provider verifying the domain -- lands somewhere that
 * names the seller and links what it sells, rather than on a bare auth widget.
 */
export default async function RootPage() {
  const { userId } = await auth()
  redirect(userId ? '/dashboard' : '/login')
}

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
 * differently. The public site is the single home for that content now, and
 * the sign-in page carries the links to it.
 *
 * `middleware.ts` normally forwards this route before it renders, because a
 * redirect from here arrives after Clerk's provider has flushed a loading
 * shell and degrades to a client-side one. This is the fallback for the case
 * where middleware did not run, and it makes the same decision.
 */
export default async function RootPage() {
  const { userId } = await auth()
  redirect(userId ? '/dashboard' : '/login')
}

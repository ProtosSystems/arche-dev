import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Everything a visitor needs before buying -- what is sold and at what price,
// the policies governing it, and how to reach the seller -- has to answer
// without a session. A payment provider verifying this domain crawls it rather
// than loading one URL, and a host where every path but the root redirects to
// a sign-in form is indistinguishable from a login wall. These must stay in
// step with the pages under `app/(public)`.
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/pricing',
  '/contact',
  '/legal/terms',
  '/legal/privacy',
  '/legal/refund-policy',
  '/legal/security',
  '/internal/webhooks/paddle',
  '/internal/webhooks/paddle/sandbox',
  '/internal/webhooks/paddle/production',
])
const authDisabled = process.env.AUTH_DISABLED_FOR_DEV === 'true'

export default clerkMiddleware(
  async (auth, req) => {
    if (authDisabled) {
      return
    }

    if (!isPublicRoute(req)) {
      const { userId, redirectToSignIn } = await auth()
      if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url })
      }
    }
  },
  {
    signInUrl: '/login',
    signUpUrl: '/sign-up',
  }
)

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/(.*)'],
}

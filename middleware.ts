import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// The root is public because it decides where to send you: signed out to the
// sign-in form, signed in to the dashboard. It must not require a session to
// make that decision, or an anonymous visitor gets a redirect loop.
//
// The pages a buyer needs before paying live on arche.fi, and `next.config.mjs`
// forwards `/pricing`, `/contact`, and `/legal/*` there permanently. Those
// redirects run ahead of middleware, so they never reach this matcher -- they
// are listed anyway, so that removing one from next.config degrades to a public
// 404 rather than silently becoming a sign-in redirect again.
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/pricing',
  '/contact',
  '/legal/(.*)',
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

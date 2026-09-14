import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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

    // Signed-in visitors are sent to the dashboard from here rather than from
    // `app/page.tsx`, because a `redirect()` in the page is too late: Clerk's
    // provider streams a loading shell from the layout before the page's
    // `auth()` resolves, and once that shell has flushed Next cannot answer
    // with a 307 -- it embeds the redirect in the HTML instead.
    //
    // Signed-out visitors fall through to the page, which answers 200 with the
    // product, the entry points, and links to arche.fi. Forwarding them to
    // /login instead is the convention for an application domain, and it is
    // also what a payment provider's automated domain check reads, correctly,
    // as a login wall: the root redirects to a form. This domain has to pass
    // that check, so it presents as a site.
    if (req.nextUrl.pathname === '/') {
      const { userId } = await auth()
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
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

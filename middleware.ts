import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/internal/webhooks/paddle(.*)',
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

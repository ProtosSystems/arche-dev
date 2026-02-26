import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/login(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (process.env.AUTH_DISABLED_FOR_DEV === 'true') {
    return
  }

  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth()
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/(.*)'],
}

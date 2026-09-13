import { PublicFooter, PublicHeader } from '@/components/public/PublicChrome'

/**
 * Layout for pages that must render without a session.
 *
 * These routes are listed in `middleware.ts` as public. Adding a page here
 * without adding it there produces a sign-in redirect, which is the exact
 * failure this route group exists to prevent.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  )
}

import { MARKETING_ORIGIN, SUPPORT_EMAIL } from '@/lib/public-site'
import Link from 'next/link'

const LEGAL_LINKS = [
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/refund-policy', label: 'Refund Policy' },
  { href: '/legal/security', label: 'Security' },
] as const

/**
 * Shared frame for the four policy documents.
 *
 * Each one names a contact address in its own body. The marketing site's
 * copies say only "contact us through our support channel" and name no
 * channel, which leaves a reader of the terms with no way to reach the seller
 * -- a reviewer checking for contact details finds nothing on the page they
 * are reading.
 */
export function LegalPage({
  label,
  title,
  subtitle,
  lastUpdated,
  canonicalPath,
  children,
}: {
  label: string
  title: string
  subtitle: string
  lastUpdated: string
  canonicalPath: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-12">
      <article className="lg:col-span-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{label}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{subtitle}</p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">Last updated: {lastUpdated}</p>

        <div className="legal-body mt-8 space-y-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      </article>

      <aside className="lg:col-span-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Policies</h2>
          <ul className="mt-3 space-y-1">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-zinc-200 pt-4 text-xs leading-relaxed text-zinc-600 dark:border-white/10 dark:text-zinc-400">
            Questions about this policy:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            Also published at{' '}
            <a href={`${MARKETING_ORIGIN}${canonicalPath}`} className="underline">
              arche.fi{canonicalPath}
            </a>
            .
          </p>
        </div>
      </aside>
    </main>
  )
}

/** Section heading, so every policy renders its headings identically. */
export function LegalHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-3 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{children}</h2>
}

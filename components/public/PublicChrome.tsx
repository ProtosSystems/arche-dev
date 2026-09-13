import {
  LEGAL_ADDRESS_LINES,
  LEGAL_ENTITY,
  MERCHANT_OF_RECORD,
  PUBLIC_LINKS,
  SUPPORT_EMAIL,
} from '@/lib/public-site'
import { getSiteUrl } from '@/lib/site'
import Link from 'next/link'

/**
 * Header and footer shared by every page an anonymous visitor can reach.
 *
 * The footer is the part that matters for domain review: it names the selling
 * entity, its registered address, a contact address, and the merchant of
 * record, and it links every required policy on this domain rather than off
 * it, so a reviewer never leaves the host being verified.
 */

export function PublicHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-2xl text-zinc-900 dark:text-white">
          ⍺rche
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/pricing" className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">
            Pricing
          </Link>
          <a
            href="https://docs.arche.fi"
            className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Documentation
          </a>
          <Link href="/contact" className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">
            Contact
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function PublicFooter() {
  const host = getSiteUrl().host

  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <nav aria-label="Site and legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {PUBLIC_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <address className="mt-5 text-xs not-italic leading-relaxed text-zinc-500 dark:text-zinc-500">
          {host} · Operated by {LEGAL_ENTITY}
          <br />
          {LEGAL_ADDRESS_LINES.join(', ')}
          <br />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
            {SUPPORT_EMAIL}
          </a>
        </address>

        <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          Payments are processed by {MERCHANT_OF_RECORD}, our merchant of record. Charges appear on your statement
          under Paddle.
        </p>
      </div>
    </footer>
  )
}

import {
  LEGAL_ADDRESS_LINES,
  LEGAL_ENTITY,
  MARKETING_ORIGIN,
  MERCHANT_OF_RECORD,
  PUBLIC_LINKS,
  SUPPORT_EMAIL,
  marketingUrl,
} from '@/lib/public-site'

/**
 * The chrome under the sign-in and sign-up forms.
 *
 * A bare auth widget was the entire anonymous surface of this domain, and it
 * answers none of what a buyer -- or a payment provider verifying the domain --
 * needs before paying: what is sold, at what price, under which terms, and by
 * whom. Every comparable product's sign-in page carries these links.
 *
 * They point at arche.fi rather than duplicating the pages here.
 */
export function AuthFooter() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-md text-center">
      <nav aria-label="Product and legal" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        <a href={MARKETING_ORIGIN} className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
          About Arche
        </a>
        {PUBLIC_LINKS.map((link) => (
          <a
            key={link.path}
            href={marketingUrl(link.path)}
            className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://docs.arche.fi"
          className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
        >
          Documentation
        </a>
      </nav>

      <address className="mt-4 text-xs not-italic leading-relaxed text-zinc-500">
        Operated by {LEGAL_ENTITY} · {LEGAL_ADDRESS_LINES.join(', ')}
        <br />
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2">
          {SUPPORT_EMAIL}
        </a>
      </address>

      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Payments processed by {MERCHANT_OF_RECORD}, our merchant of record.
      </p>
    </footer>
  )
}

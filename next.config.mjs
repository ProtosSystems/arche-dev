import path from 'node:path'

/**
 * Paths this application forwards to the public site.
 *
 * These pages exist once, on arche.fi. They were briefly copied here, which
 * left two live pricing pages answering the same question differently. Before
 * that they were not served at all -- an anonymous request for
 * `app.arche.fi/pricing` hit Clerk and came back as a sign-in redirect, which
 * is what a crawler probing this domain would have recorded as a login wall.
 *
 * Forwarding permanently means a guessed or bookmarked URL reaches the real
 * page, and search engines consolidate on the public site. These run ahead of
 * middleware, so Clerk never sees them.
 */
const FORWARDED_TO_MARKETING = [
  '/pricing',
  '/contact',
  '/legal/terms',
  '/legal/privacy',
  '/legal/refund-policy',
  '/legal/security',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  experimental: {
    devtoolSegmentExplorer: false,
  },
  async redirects() {
    return FORWARDED_TO_MARKETING.map((source) => ({
      source,
      destination: `https://arche.fi${source}`,
      permanent: true,
    }))
  },
}

export default nextConfig

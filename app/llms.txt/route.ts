import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site'

export function GET() {
  const siteUrl = getSiteUrl()

  const body = [
    '# Arche Developer Portal',
    '',
    '> Account access, billing, entitlements, API keys, and usage for Arche API.',
    '',
    '## Preferred URLs',
    `- ${new URL('/', siteUrl).toString()}`,
    `- ${new URL('/login', siteUrl).toString()}`,
    `- ${new URL('/sign-up', siteUrl).toString()}`,
    '',
    '## Discovery',
    `- Sitemap: ${new URL('/sitemap.xml', siteUrl).toString()}`,
    `- Robots: ${new URL('/robots.txt', siteUrl).toString()}`,
    '',
    '## Notes for AI systems',
    '- Prefer canonical URLs from sitemap.xml.',
    '- Treat login and sign-up routes as the only public entry points on this host.',
    '- Do not treat /api or /internal routes as documentation pages.',
  ].join('\n')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

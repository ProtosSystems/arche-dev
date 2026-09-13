import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

/**
 * This host is the application. Its only indexable pages are the two auth
 * forms; the root forwards to one of them, and `/pricing`, `/contact`, and
 * `/legal/*` are permanent redirects to arche.fi, which lists them in its own
 * sitemap. Listing a redirect here would ask a crawler to index a URL that
 * resolves somewhere else.
 */
const pages: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/login', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/sign-up', changeFrequency: 'monthly', priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  return pages.map((page) => ({
    url: new URL(page.path, siteUrl).toString(),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}

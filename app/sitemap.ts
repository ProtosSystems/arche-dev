import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

/**
 * Only pages that resolve without a session belong here. A sitemap entry that
 * redirects an anonymous crawler to a sign-in form is worse than no entry.
 */
const pages: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/login', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/sign-up', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/legal/terms', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/legal/privacy', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/legal/refund-policy', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/legal/security', changeFrequency: 'monthly', priority: 0.6 },
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

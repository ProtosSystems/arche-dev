import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

const pages: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/login', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/sign-up', changeFrequency: 'weekly', priority: 0.8 },
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

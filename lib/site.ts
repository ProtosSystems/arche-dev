export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.arche.fi'

  try {
    return new URL(raw)
  } catch {
    return new URL('https://app.arche.fi')
  }
}

export const siteName = 'Arche Developer Portal'
export const siteTitle = 'Arche Developer Portal | API keys, billing, usage, and workspace control'
export const siteDescription =
  'Manage Arche API access, billing, entitlements, API keys, and usage from a single developer portal.'
export const siteKeywords = [
  'Arche Developer Portal',
  'Arche API',
  'developer portal',
  'API key management',
  'usage analytics',
  'API billing',
  'workspace entitlements',
  'developer onboarding',
]
export const socialImagePath = '/arche-og.png'
export const socialProfiles = ['https://www.linkedin.com/company/protos-sys/', 'https://x.com/ProtosSystems']

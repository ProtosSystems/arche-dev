import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { getSiteUrl, siteDescription, siteKeywords, siteName, siteTitle, socialImagePath, socialProfiles } from '@/lib/site'
import type { Metadata } from 'next'
import ClerkProviderClient from './clerk-provider'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    template: '%s | Arche Developer Portal',
    default: siteTitle,
  },
  description: siteDescription,
  applicationName: siteName,
  category: 'Developer tools',
  alternates: {
    canonical: '/',
  },
  keywords: siteKeywords,
  authors: [{ name: 'Protos Systems' }],
  creator: 'Protos Systems',
  publisher: 'Protos Systems',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    creator: '@ProtosSystems',
    images: [socialImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'default',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Arche',
    url: siteUrl.toString(),
    logo: new URL('/apple-touch-icon.png', siteUrl).toString(),
    sameAs: socialProfiles,
    parentOrganization: {
      '@type': 'Organization',
      name: 'Protos Systems',
      sameAs: socialProfiles,
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl.toString(),
    inLanguage: 'en-US',
    description: siteDescription,
    publisher: {
      '@type': 'Organization',
      name: 'Protos Systems',
      sameAs: socialProfiles,
    },
  }

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: siteDescription,
    url: siteUrl.toString(),
    image: new URL(socialImagePath, siteUrl).toString(),
    publisher: {
      '@type': 'Organization',
      name: 'Protos Systems',
      sameAs: socialProfiles,
    },
  }

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('arche-portal-theme');
                  var resolved = theme === 'dark' ? 'dark' : 'light';
                  document.documentElement.classList.toggle('dark', resolved === 'dark');
                  document.documentElement.dataset.theme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap" />
      </head>
      <body className="min-h-screen bg-[var(--protos-surface-muted)] text-[var(--protos-text)] transition-colors">
        <ThemeProvider>
          <ClerkProviderClient>{children}</ClerkProviderClient>
        </ThemeProvider>
      </body>
    </html>
  )
}

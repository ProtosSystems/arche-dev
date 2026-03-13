import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import type { Metadata } from 'next'
import ClerkProviderClient from './clerk-provider'

export const metadata: Metadata = {
  title: {
    template: '%s | Arche Developer Portal',
    default: 'Arche Developer Portal',
  },
  description: 'Developer portal for Arche API billing, entitlements, keys, and usage.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

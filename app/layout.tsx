import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Arche Developer Portal',
    default: 'Arche Developer Portal',
  },
  description: 'Developer portal for managing Arche API projects, keys, usage, and webhooks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-950">{children}</body>
    </html>
  )
}

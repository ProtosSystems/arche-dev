'use client'

import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { OrgSelector } from '@/components/layout/OrgSelector'
import { ChevronUpDownIcon, MoonIcon, SunIcon } from '@heroicons/react/20/solid'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const routeMeta: Array<{ prefix: string; title: string; description: string }> = [
  {
    prefix: '/dashboard/orgs',
    title: 'Organizations',
    description: 'Manage organizations, projects, and environments.',
  },
  {
    prefix: '/dashboard/api-keys',
    title: 'API Keys',
    description: 'Create and manage keys used by your services and agents.',
  },
  {
    prefix: '/dashboard/usage',
    title: 'Usage',
    description: 'Track request volume, latency, and spend by endpoint.',
  },
  {
    prefix: '/dashboard/entitlements',
    title: 'Entitlements',
    description: 'Review enabled features, datasets, and access tiers.',
  },
  {
    prefix: '/dashboard/team',
    title: 'Team',
    description: 'Manage members, roles, and access to the workspace.',
  },
  {
    prefix: '/dashboard/settings',
    title: 'Settings',
    description: 'Configure organization defaults and environments.',
  },
  {
    prefix: '/dashboard',
    title: 'Overview',
    description: 'Quick health check of your Protos developer workspace.',
  },
]

function useRouteMeta(pathname: string) {
  return useMemo(() => {
    const match = routeMeta.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`))
    return match ?? routeMeta[routeMeta.length - 1]
  }, [pathname])
}

export function TopNav() {
  const pathname = usePathname()
  const { title, description } = useRouteMeta(pathname)
  const [isProduction, setIsProduction] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  return (
    <div className="flex flex-col gap-6 border-b border-zinc-950/5 pb-6 dark:border-white/10 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <Heading level={1} className="text-primary">
          {title}
        </Heading>
        <Text className="mt-1 max-w-2xl">{description}</Text>
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:self-start">
        <OrgSelector />

        <button
          type="button"
          onClick={() => setIsProduction((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/10"
          aria-label="Toggle environment"
        >
          <span
            className={`size-2 rounded-full ${isProduction ? 'bg-emerald-500' : 'bg-amber-400'}`}
            aria-hidden="true"
          />
          <span className="uppercase tracking-wide">{isProduction ? 'Production' : 'Sandbox'}</span>
          <ChevronUpDownIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
        </button>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="inline-flex size-9 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/10"
          aria-label="Toggle dark mode"
        >
          {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
        </button>
      </div>
    </div>
  )
}

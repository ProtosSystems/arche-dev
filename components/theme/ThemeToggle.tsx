'use client'

import { useTheme } from '@/components/theme/ThemeProvider'
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-full bg-white p-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-white"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  )
}

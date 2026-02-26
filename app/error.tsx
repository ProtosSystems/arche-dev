'use client'

import { Button } from '@/components/catalyst/button'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
      <h2 className="text-sm font-semibold">Application error</h2>
      <p className="mt-2 text-sm">{error.message || 'Unexpected error.'}</p>
      <div className="mt-4">
        <Button color="rose" onClick={reset}>
          Retry
        </Button>
      </div>
    </div>
  )
}

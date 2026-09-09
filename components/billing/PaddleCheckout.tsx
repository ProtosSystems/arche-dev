'use client'

import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { useEffect, useState } from 'react'
import { Text } from '@/components/catalyst/text'

/**
 * Opens the Paddle checkout overlay for a transaction Paddle redirected here.
 *
 * Paddle appends `?_ptxn=txn_...` to the account's default payment link and
 * sends the customer to it. Until this existed the portal had no Paddle.js, so
 * a redirected customer landed on the billing page and saw nothing: the
 * transaction existed, and there was no way to pay it.
 *
 * Renders nothing when no transaction is present, so the billing page is
 * unchanged for everyone else.
 */
export function PaddleCheckout() {
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const ptxn = new URLSearchParams(window.location.search).get('_ptxn')
    if (!ptxn) {
      return
    }
    setTransactionId(ptxn)

    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    if (!token) {
      // Fail loudly rather than showing a blank page: without a client-side
      // token the overlay cannot open, and the customer would otherwise be
      // left staring at a billing page with no explanation.
      setError('Checkout is unavailable: the Paddle client token is not configured.')
      return
    }

    // A live token pairs with the live environment and a test_ token with
    // sandbox; mismatching them fails inside Paddle.js with no useful message.
    const environment = token.startsWith('live_') ? 'production' : 'sandbox'

    let cancelled = false
    void initializePaddle({ token, environment })
      .then((paddle: Paddle | undefined) => {
        if (cancelled || !paddle) {
          if (!cancelled) {
            setError('Checkout is unavailable: Paddle failed to initialize.')
          }
          return
        }
        paddle.Checkout.open({ transactionId: ptxn })
      })
      .catch(() => {
        if (!cancelled) {
          setError('Checkout is unavailable: Paddle failed to initialize.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!transactionId) {
    return null
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="text-sm font-semibold text-zinc-900 dark:text-white">Complete your purchase</div>
      {error ? (
        <Text className="mt-2 text-sm text-amber-800 dark:text-amber-200">{error}</Text>
      ) : (
        <Text className="mt-2 text-sm text-zinc-700">
          Opening secure checkout for transaction <code className="font-mono">{transactionId}</code>. If it does
          not appear, disable your pop-up blocker and reload this page.
        </Text>
      )}
    </section>
  )
}

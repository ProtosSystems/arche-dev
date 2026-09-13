/**
 * Published plans, kept next to the numbers that are actually enforced.
 *
 * Every figure here is something the API applies at request time: the
 * per-minute rate limits come from the deployed `RATE_LIMIT_TIERS_JSON`, and
 * the key counts, universe, and capabilities from the backend's per-tier
 * entitlement defaults. Monthly request quotas are deliberately absent --
 * nothing meters them, and a published number nothing enforces reads to a
 * buyer as something they were sold.
 *
 * Prices are the live Paddle prices, and each carries the price id it was read
 * from, so a number that drifts from Paddle is visible here rather than after
 * a customer is charged an amount the page did not quote.
 */

export type Plan = {
  id: string
  name: string
  monthlyUsd: number | null
  annualUsd: number | null
  monthlyPriceId: string | null
  annualPriceId: string | null
  tagline: string
  universe: string
  apiKeys: string
  readsPerMinute: string
  modelingPerMinute: string
  capabilities: readonly string[]
  cta: { label: string; href: string }
}

export const PLANS: readonly Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyUsd: 0,
    annualUsd: 0,
    monthlyPriceId: null,
    annualPriceId: null,
    tagline: 'Evaluate the contract against the 30 best-covered filers. No card, no expiry.',
    universe: 'Dow 30 (pinned list)',
    apiKeys: '2',
    readsPerMinute: '60',
    modelingPerMinute: '30',
    capabilities: ['Point-in-time retrieval', 'Statement versions and restatement lineage', 'Sandbox and production'],
    cta: { label: 'Create an account', href: '/sign-up' },
  },
  {
    id: 'developer',
    name: 'Developer',
    monthlyUsd: 99,
    annualUsd: 990,
    monthlyPriceId: 'pri_01m22we15513n2bsd3x18ygkdk',
    annualPriceId: 'pri_01m22wgby8p7y9v859aw5ad1dp',
    tagline: 'Ship one application on audited fundamentals.',
    universe: 'S&P 500 (pinned list)',
    apiKeys: '10',
    readsPerMinute: '300',
    modelingPerMinute: '150',
    capabilities: ['Everything in Free', 'MCP access', 'Full single-company surface, including audit chain'],
    cta: { label: 'Create an account', href: '/sign-up' },
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyUsd: 600,
    annualUsd: 6000,
    monthlyPriceId: 'pri_01m22whkm3nqk3etqvhr6ptw0h',
    annualPriceId: 'pri_01m22wjz4pwenmtb2wmsb2rq8j',
    tagline: 'Point-in-time modeling across the full corpus for a research team.',
    universe: 'Full corpus (15,500 filers)',
    apiKeys: '25',
    readsPerMinute: '1,200',
    modelingPerMinute: '600',
    capabilities: [
      'Everything in Developer',
      'Deterministic replay tokens',
      'Cross-company multi-CIK time series',
      'Restatement alerts and webhooks',
    ],
    cta: { label: 'Create an account', href: '/sign-up' },
  },
  {
    id: 'scale',
    name: 'Scale',
    monthlyUsd: 2500,
    annualUsd: 25000,
    monthlyPriceId: 'pri_01m22wm8tf92ktqacs7vz67gsr',
    annualPriceId: 'pri_01m22wrhnf0m8esw1a5c3qrt20',
    tagline: 'Reproducible cross-universe snapshots at a single as-of date.',
    universe: 'Full corpus (15,500 filers)',
    apiKeys: '100',
    readsPerMinute: '3,000',
    modelingPerMinute: '1,500',
    capabilities: [
      'Everything in Growth',
      'Universe point-in-time snapshots',
      'Highest published throughput',
    ],
    cta: { label: 'Create an account', href: '/sign-up' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyUsd: null,
    annualUsd: null,
    monthlyPriceId: null,
    annualPriceId: null,
    tagline: 'Licensed substrate with a contracted SLA. Priced per agreement.',
    universe: 'Full corpus (15,500 filers)',
    apiKeys: 'Unlimited',
    readsPerMinute: 'Negotiated',
    modelingPerMinute: 'Negotiated',
    capabilities: ['Everything in Scale', 'Contracted SLA and support terms', 'Negotiated limits'],
    cta: { label: 'Contact sales', href: '/contact' },
  },
]

export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// Single source of truth for marketing route titles/descriptions. Consumed by
// the Waku page heads (via MarketingRoute), and the dev-only marketing SPA
// (src/marketing/main.tsx).

export type RouteMetadata = { title: string; description: string }

export const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'Tempo developers',
    description:
      'Tempo is a payments-first Layer 1 blockchain incubated by Stripe and Paradigm. Explore APIs, SDKs, wallets, and protocol documentation.',
  },
  '/build': {
    title: 'Build on Tempo',
    description:
      'Build payment products on Tempo with stablecoins, fast settlement, and predictable fees.',
  },
  '/build/tempo-transactions': {
    title: 'Tempo Transactions',
    description: 'Batch, sponsor, schedule, and parallelize payments with Tempo Transactions.',
  },
  '/build/tip20-tokens': {
    title: 'TIP-20 Tokens',
    description:
      'Stablecoin-first Tempo Tokens for payments, fees, memos, policies, and liquidity.',
  },
  '/performance': {
    title: 'Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  '/blog': {
    title: 'Blog',
    description:
      'Engineering deep dives, network upgrades, events, and case studies from the Tempo team.',
  },
}

export type SearchQueryLabel =
  // Literal page title, API name, or exact term users are expected to type.
  | 'exact'
  // Topic-oriented query where the right page may not contain the exact words.
  | 'concept'
  // Natural-language question phrased like a user asking for help.
  | 'nl'
  // Misspelled query that should still recover the intended page.
  | 'typo'
  // Out-of-domain query that should not count toward recall metrics.
  | 'negative'

export type SearchQueryFixture = {
  q: string
  label: SearchQueryLabel
  relevant: string[]
  notes?: string
}

export const queries: SearchQueryFixture[] = [
  {
    q: 'json rpc',
    label: 'exact',
    relevant: ['/docs/api/json-rpc', '/docs/protocol/rpc'],
  },
  {
    q: 'rate limits',
    label: 'exact',
    relevant: ['/docs/api/rate-limits'],
  },
  {
    q: 'pagination',
    label: 'exact',
    relevant: ['/docs/api/pagination'],
  },
  {
    q: 'transfer',
    label: 'exact',
    relevant: ['/docs/guide/payments/send-a-payment'],
  },
  {
    q: 'accept payments',
    label: 'exact',
    relevant: ['/docs/guide/payments/transfer-memos'],
  },
  {
    q: 'sponsor fees',
    label: 'exact',
    relevant: ['/docs/guide/payments/sponsor-user-fees'],
  },
  {
    q: 'faucet',
    label: 'exact',
    relevant: ['/docs/quickstart/faucet'],
  },
  {
    q: 'sponsor fees',
    label: 'concept',
    relevant: ['/docs/guide/payments/sponsor-user-fees'],
  },
  {
    q: 'token list',
    label: 'concept',
    relevant: ['/docs/quickstart/tokenlist'],
  },
  {
    q: 'discover services',
    label: 'concept',
    relevant: ['/docs/guide/machine-payments/discover-services'],
  },
  {
    q: 'how do I get test tokens',
    label: 'nl',
    relevant: ['/docs/quickstart/faucet'],
    notes:
      'Starter natural-language fixture; tune if a funding guide becomes the canonical answer.',
  },
  {
    q: 'where is the rpc url',
    label: 'nl',
    relevant: ['/docs/quickstart/connection-details', '/docs/api/json-rpc', '/docs/protocol/rpc'],
  },
  {
    q: 'virtaul adresses',
    label: 'typo',
    relevant: ['/docs/guide/payments/virtual-addresses', '/docs/protocol/tip20/virtual-addresses'],
  },
  {
    q: 'sponser fees',
    label: 'typo',
    relevant: ['/docs/guide/payments/sponsor-user-fees'],
  },
  {
    q: 'favorite pizza topping',
    label: 'negative',
    relevant: [],
  },
]

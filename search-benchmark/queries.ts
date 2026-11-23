export type SearchQueryLabel =
  // Literal page title, API name, or exact term users are expected to type.
  | 'exact'
  // Topic-oriented query where the right page may not contain the exact words.
  | 'concept'
  // Natural-language question phrased like a user asking for help.
  | 'nl'
  // Misspelled query that should still recover the intended page.
  | 'typo'
  // Question a coding agent asks while building on Tempo; relevant pages hold the answer.
  | 'agent'
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
    relevant: ['/docs/api/fee-payer'],
  },
  {
    q: 'faucet',
    label: 'exact',
    relevant: ['/docs/quickstart/faucet'],
  },
  {
    q: 'sponsor fees',
    label: 'concept',
    relevant: ['/docs/api/fee-payer'],
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
    relevant: ['/docs/api/fee-payer'],
  },
  {
    q: 'tempo mainnet chain id and rpc url',
    label: 'agent',
    relevant: ['/docs/quickstart/connection-details'],
  },
  {
    q: 'testnet chain id and rpc url',
    label: 'agent',
    relevant: ['/docs/quickstart/connection-details'],
  },
  {
    q: 'does tempo have a native gas token',
    label: 'agent',
    relevant: [
      '/docs/protocol/fees',
      '/get-started/stablecoins',
      '/docs/accounts/fees/fee-tokens',
      '/docs/accounts/fees',
      '/docs/network/fees',
      '/docs/network',
      '/docs/quickstart/evm-compatibility',
    ],
  },
  {
    q: 'choose the fee token for one transaction in viem',
    label: 'agent',
    relevant: ['/docs/accounts/fees/fee-tokens', '/docs/guide/payments/pay-fees-in-any-stablecoin'],
  },
  {
    q: 'which token pays fees when none is set',
    label: 'agent',
    relevant: [
      '/docs/accounts/fees/fee-tokens',
      '/docs/accounts/fees',
      '/docs/protocol/fees/spec-fee',
    ],
  },
  {
    q: 'which stablecoins can pay transaction fees',
    label: 'agent',
    relevant: [
      '/docs/accounts/fees/fee-tokens',
      '/docs/protocol/fees',
      '/docs/protocol/fees/spec-fee',
      '/docs/network/fees',
    ],
  },
  {
    q: 'get testnet funds from code',
    label: 'agent',
    relevant: ['/docs/quickstart/faucet'],
  },
  {
    q: 'which tokens does the faucet send',
    label: 'agent',
    relevant: ['/docs/quickstart/faucet'],
  },
  {
    q: 'alphausd token address',
    label: 'agent',
    relevant: ['/docs/quickstart/faucet', '/docs/quickstart/tokenlist'],
  },
  {
    q: 'ousd contract address',
    label: 'agent',
    relevant: ['/docs/guide/ousd', '/docs/quickstart/tokenlist'],
  },
  {
    q: 'what is pathusd',
    label: 'agent',
    relevant: ['/docs/protocol/exchange/quote-tokens', '/docs/guide/ousd'],
  },
  {
    q: 'how many decimals do stablecoins use',
    label: 'agent',
    relevant: ['/get-started/stablecoins', '/docs/protocol/tip20/spec'],
  },
  {
    q: 'attach an invoice reference to a payment',
    label: 'agent',
    relevant: ['/docs/guide/payments/transfer-memos'],
  },
  {
    q: 'typescript sdk package name',
    label: 'agent',
    relevant: ['/docs/sdk/typescript', '/docs/sdk'],
  },
  {
    q: 'python sdk',
    label: 'agent',
    relevant: ['/docs/sdk/python'],
  },
  {
    q: 'go sdk module path',
    label: 'agent',
    relevant: ['/docs/sdk/go'],
  },
  {
    q: 'rust crate for tempo',
    label: 'agent',
    relevant: ['/docs/sdk/rust'],
  },
  {
    q: 'foundry tempo support',
    label: 'agent',
    relevant: ['/docs/sdk/foundry'],
  },
  {
    q: 'typed client for the tempo api',
    label: 'agent',
    relevant: ['/docs/sdk/typescript/api-client'],
  },
  {
    q: 'api key header',
    label: 'agent',
    relevant: ['/docs/api/authentication', '/docs/api/console/api-keys'],
  },
  {
    q: 'tempo api base url',
    label: 'agent',
    relevant: ['/docs/api/authentication', '/docs/api', '/docs/api/conventions'],
  },
  {
    q: 'connect claude code to the docs mcp server',
    label: 'agent',
    relevant: ['/docs/guide/using-tempo-with-ai'],
  },
  {
    q: 'install the tempo cli',
    label: 'agent',
    relevant: ['/docs/cli'],
  },
  {
    q: 'pay network fees for my users',
    label: 'agent',
    relevant: ['/docs/api/fee-payer', '/docs/accounts/fees/fee-sponsorship'],
  },
  {
    q: 'create a passkey account',
    label: 'agent',
    relevant: ['/docs/accounts/create', '/docs/accounts/authentication/passkeys'],
  },
  {
    q: 'add a recovery signer to a passkey account',
    label: 'agent',
    relevant: [
      '/docs/accounts/authentication/passkeys',
      '/docs/accounts/apps/self-custodial-wallets',
      '/docs/accounts/create',
    ],
  },
  {
    q: 'deposit into an earn vault',
    label: 'agent',
    relevant: ['/docs/earn/integrate'],
  },
  {
    q: 'read earn positions for an address',
    label: 'agent',
    relevant: ['/docs/earn/balances'],
  },
  {
    q: 'quote a cross-chain transfer',
    label: 'agent',
    relevant: ['/docs/routes/quotes', '/docs/routes/transfers'],
  },
  {
    q: 'idempotency key for routes requests',
    label: 'agent',
    relevant: ['/docs/routes/api-setup', '/docs/routes/transfers', '/docs/routes/deposits'],
  },
  {
    q: 'authenticate to a zone rpc',
    label: 'agent',
    relevant: ['/docs/zones/connect', '/docs/protocol/zones/rpc'],
  },
  {
    q: 'can i transfer tokens inside a zone',
    label: 'agent',
    notes:
      'The earlier private-zones sandbox shows transfers; current Zones pages say transfers are disabled.',
    relevant: ['/docs/zones/connect', '/docs/protocol/zones/execution'],
  },
  {
    q: 'pay for an mpp api from typescript',
    label: 'agent',
    relevant: ['/docs/guide/machine-payments/client', '/docs/agents'],
  },
  {
    q: 'charge per request with mpp',
    label: 'agent',
    relevant: [
      '/docs/guide/machine-payments/server',
      '/docs/agents',
      '/docs/guide/machine-payments/one-time-payments',
    ],
  },
  {
    q: 'accept x402 payments on tempo',
    label: 'agent',
    relevant: ['/docs/guide/machine-payments/x402-facilitator'],
  },
  {
    q: 'favorite pizza topping',
    label: 'negative',
    relevant: [],
  },
]

export type DocsRouteContract = {
  source: string
  destination: string
}

export const canonicalDevelopersOrigin = 'https://tempo.xyz/developers'

export function docsRouteDestination(destination: string, environment = process.env.VERCEL_ENV) {
  if (URL.canParse(destination)) return destination
  if (environment === 'production') return `${canonicalDevelopersOrigin}${destination}`
  return destination
}

// These routes are evaluated in three places: Vocs for native `/docs` traffic,
// Vercel before the `/developers` proxy mount reaches Vocs, and the legacy docs
// host. Keep the mappings here so tests and deployed smoke checks share one
// contract.
export const proxiedLegacyDocsRoutes = [
  { source: '/docs/developer-tools', destination: '/docs/ecosystem' },
  { source: '/docs/developer-tools/fee-payer', destination: '/docs/api/fee-payer' },
  { source: '/docs/developer-tools/indexer', destination: '/docs/api/indexer-api' },
  { source: '/docs/hosted-services', destination: '/docs/api' },
  { source: '/docs/hosted-services/:path*', destination: '/docs/api' },
  {
    source: '/docs/guide/use-accounts/add-funds',
    destination: '/docs/guide/getting-funds',
  },
  {
    source: '/docs/guide/use-accounts/authorize-access-keys',
    destination: '/docs/guide/tempo-transaction#access-keys',
  },
  {
    source: '/docs/guide/use-accounts/batch-transactions',
    destination: '/docs/guide/tempo-transaction#batch-calls',
  },
  {
    source: '/docs/guide/use-accounts/fee-sponsorship',
    destination: '/docs/guide/payments/sponsor-user-fees',
  },
  {
    source: '/docs/guide/use-accounts/scheduled-transactions',
    destination: '/docs/guide/tempo-transaction#scheduled-transactions',
  },
  {
    source: '/docs/guide/use-accounts/webauthn-p256-signatures',
    destination: '/docs/protocol/transactions/spec-tempo-transaction#signature-types',
  },
  { source: '/docs/sdk/typescript/server', destination: '/docs/server' },
  { source: '/docs/sdk/typescript/server/handlers', destination: '/docs/server' },
  {
    source: '/docs/sdk/typescript/server/handler.feePayer',
    destination: '/docs/server/relay-handler#feepayer',
  },
  { source: '/accounts/server', destination: '/docs/server' },
  {
    source: '/accounts/server/handler.feePayer',
    destination: '/docs/server/relay-handler#feepayer',
  },
  {
    source: '/accounts/server/handler.relay',
    destination: '/docs/server/relay-handler',
  },
  {
    source: '/learn/tempo/receive-policies',
    destination: '/docs/guide/payments/configure-receive-policies',
  },
  {
    source: '/learn/use-cases/agentic-commerce',
    destination: 'https://tempo.xyz/learn/blockchain-payments/',
  },
  {
    source: '/learn/use-cases/embedded-finance',
    destination: 'https://tempo.xyz/learn/stablecoin-payments/',
  },
  {
    source: '/learn/use-cases/global-payouts',
    destination: 'https://tempo.xyz/learn/global-payouts/',
  },
  {
    source: '/learn/use-cases/microtransactions',
    destination: 'https://tempo.xyz/learn/microtransactions/',
  },
  {
    source: '/learn/use-cases/payroll',
    destination: 'https://tempo.xyz/learn/stablecoin-payroll/',
  },
  {
    source: '/learn/use-cases/remittances',
    destination: 'https://tempo.xyz/learn/cross-border-payments/',
  },
  {
    source: '/learn/use-cases/tokenized-deposits',
    destination: 'https://tempo.xyz/learn/tokenized-deposits/',
  },
  {
    source: '/docs/protocol/tips/tip-1028',
    destination: 'https://tips.sh/1028',
  },
] as const satisfies readonly DocsRouteContract[]

export const legacyDocsHostRoutes = [
  {
    source: '/guide/bridge-usdc-stargate',
    destination: `${canonicalDevelopersOrigin}/docs/guide/bridge-layerzero`,
  },
  {
    source: '/guide/bridge-usdc-relay',
    destination: `${canonicalDevelopersOrigin}/docs/guide/bridge-relay`,
  },
  {
    source: '/guide/node/validator-config-v2',
    destination: `${canonicalDevelopersOrigin}/docs/guide/node/network-upgrades`,
  },
  {
    source: '/AccountKeychain',
    destination: `${canonicalDevelopersOrigin}/docs/protocol/transactions/AccountKeychain`,
  },
  { source: '/developer-tools', destination: `${canonicalDevelopersOrigin}/docs/ecosystem` },
  {
    source: '/developer-tools/fee-payer',
    destination: `${canonicalDevelopersOrigin}/docs/api/fee-payer`,
  },
  {
    source: '/developer-tools/indexer',
    destination: `${canonicalDevelopersOrigin}/docs/api/indexer-api`,
  },
  { source: '/hosted-services', destination: `${canonicalDevelopersOrigin}/docs/api` },
  { source: '/hosted-services/:path*', destination: `${canonicalDevelopersOrigin}/docs/api` },
  { source: '/learn/partners', destination: `${canonicalDevelopersOrigin}/docs/partners` },
  { source: '/docs/learn/partners', destination: `${canonicalDevelopersOrigin}/docs/partners` },
  {
    source: '/docs/guide/using-tempo-with-ai/partners',
    destination: `${canonicalDevelopersOrigin}/docs/partners`,
  },
  { source: '/build/partners', destination: `${canonicalDevelopersOrigin}/docs/partners` },
  {
    source: '/network-upgrades',
    destination: `${canonicalDevelopersOrigin}/docs/guide/node/network-upgrades`,
  },
  {
    source: '/guide/use-accounts/add-funds',
    destination: `${canonicalDevelopersOrigin}/docs/guide/getting-funds`,
  },
  {
    source: '/guide/use-accounts/authorize-access-keys',
    destination: `${canonicalDevelopersOrigin}/docs/guide/tempo-transaction#access-keys`,
  },
  {
    source: '/guide/use-accounts/batch-transactions',
    destination: `${canonicalDevelopersOrigin}/docs/guide/tempo-transaction#batch-calls`,
  },
  {
    source: '/guide/use-accounts/fee-sponsorship',
    destination: `${canonicalDevelopersOrigin}/docs/guide/payments/sponsor-user-fees`,
  },
  {
    source: '/guide/use-accounts/scheduled-transactions',
    destination: `${canonicalDevelopersOrigin}/docs/guide/tempo-transaction#scheduled-transactions`,
  },
  {
    source: '/guide/use-accounts/webauthn-p256-signatures',
    destination: `${canonicalDevelopersOrigin}/docs/protocol/transactions/spec-tempo-transaction#signature-types`,
  },
  {
    source: '/sdk/typescript/server',
    destination: `${canonicalDevelopersOrigin}/docs/server`,
  },
  {
    source: '/sdk/typescript/server/handlers',
    destination: `${canonicalDevelopersOrigin}/docs/server`,
  },
  {
    source: '/sdk/typescript/server/handler.feePayer',
    destination: `${canonicalDevelopersOrigin}/docs/server/relay-handler#feepayer`,
  },
  { source: '/accounts/server', destination: `${canonicalDevelopersOrigin}/docs/server` },
  {
    source: '/accounts/server/handler.feePayer',
    destination: `${canonicalDevelopersOrigin}/docs/server/relay-handler#feepayer`,
  },
  {
    source: '/accounts/server/handler.relay',
    destination: `${canonicalDevelopersOrigin}/docs/server/relay-handler`,
  },
  {
    source: '/learn/tempo/receive-policies',
    destination: `${canonicalDevelopersOrigin}/docs/guide/payments/configure-receive-policies`,
  },
  {
    source: '/learn/use-cases/agentic-commerce',
    destination: 'https://tempo.xyz/learn/blockchain-payments/',
  },
  {
    source: '/learn/use-cases/embedded-finance',
    destination: 'https://tempo.xyz/learn/stablecoin-payments/',
  },
  {
    source: '/learn/use-cases/global-payouts',
    destination: 'https://tempo.xyz/learn/global-payouts/',
  },
  {
    source: '/learn/use-cases/microtransactions',
    destination: 'https://tempo.xyz/learn/microtransactions/',
  },
  {
    source: '/learn/use-cases/payroll',
    destination: 'https://tempo.xyz/learn/stablecoin-payroll/',
  },
  {
    source: '/learn/use-cases/remittances',
    destination: 'https://tempo.xyz/learn/cross-border-payments/',
  },
  {
    source: '/learn/use-cases/tokenized-deposits',
    destination: 'https://tempo.xyz/learn/tokenized-deposits/',
  },
  {
    source: '/protocol/tips/tip-1028',
    destination: 'https://tips.sh/1028',
  },
] as const satisfies readonly DocsRouteContract[]

export const routingSmokeCases = {
  canonical: [
    { path: '/developers', expectedStatus: 200 },
    { path: '/developers/docs/quickstart/integrate-tempo', expectedStatus: 200 },
    { path: '/developers/docs/quickstart/developer-tools', expectedStatus: 200 },
    {
      path: '/developers/docs/hosted-services',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/api`,
      expectedFinalStatus: 200,
    },
    {
      path: '/developers/docs/guide/use-accounts/batch-transactions',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/guide/tempo-transaction#batch-calls`,
      expectedFinalStatus: 200,
    },
    {
      path: '/developers/accounts/server/handler.relay',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/server/relay-handler`,
      expectedFinalStatus: 200,
    },
    {
      path: '/developers/learn/use-cases/payroll',
      expectedLocation: 'https://tempo.xyz/learn/stablecoin-payroll/',
      expectedFinalStatus: 200,
    },
    { path: '/developers/api/og', expectedNonRedirect: true },
  ],
  legacy: [
    {
      path: '/guide/bridge-usdc-stargate',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/guide/bridge-layerzero`,
      expectedFinalStatus: 200,
    },
    {
      path: '/developer-tools/fee-payer',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/api/fee-payer`,
      expectedFinalStatus: 200,
    },
    {
      path: '/docs/quickstart/integrate-tempo',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/quickstart/integrate-tempo`,
      expectedFinalStatus: 200,
    },
    {
      path: '/guide/use-accounts/batch-transactions',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/guide/tempo-transaction#batch-calls`,
      expectedFinalStatus: 200,
    },
    {
      path: '/accounts/server/handler.relay',
      expectedLocation: `${canonicalDevelopersOrigin}/docs/server/relay-handler`,
      expectedFinalStatus: 200,
    },
    {
      path: '/learn/use-cases/payroll',
      expectedLocation: 'https://tempo.xyz/learn/stablecoin-payroll/',
      expectedFinalStatus: 200,
    },
  ],
} as const

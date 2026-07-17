export type DocsRouteContract = {
  source: string
  destination: string
}

export const canonicalDevelopersOrigin = 'https://tempo.xyz/developers'

export function docsRouteDestination(destination: string, environment = process.env.VERCEL_ENV) {
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
  ],
} as const

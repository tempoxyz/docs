// Path-segment → OG-image pill labels, shared by the `ogImageUrl` resolver in
// vocs.config.ts and the coverage probe in scripts/probe-og.ts so the two
// can't drift. `pnpm og:probe` fails if a route falls through to the
// auto-uppercase fallback instead of an explicit entry here.

/**
 * Cache-buster appended to /api/og URLs — bump when the OG image design
 * changes. The generated images are served with a year-long immutable
 * Cache-Control, so a design change *must* bump this. vocs.config.ts carries
 * an inline copy (`v: '4'`) that og-sections.test.ts keeps in sync.
 */
export const OG_IMAGE_VERSION = '4'

/** Routes (after stripping the `/docs` prefix) that use the static landing image. */
export const ogLandingPaths = ['/', '/changelog']

/** First path segment → section label. */
export const ogSectionMap: Record<string, string> = {
  accounts: 'ACCOUNTS',
  agents: 'MACHINE PAYMENTS',
  api: 'API',
  blog: 'BLOG',
  build: 'BUILD',
  cli: 'CLI',
  'developer-tools': 'DEVELOPER TOOLS',
  development: 'TEMPO EVM',
  earn: 'EARN',
  ecosystem: 'ECOSYSTEM',
  'get-started': 'GET STARTED',
  guide: 'BUILD',
  network: 'NETWORK',
  partners: 'PARTNERS',
  payments: 'PAYMENTS',
  performance: 'PERFORMANCE',
  protocol: 'PROTOCOL',
  quickstart: 'INTEGRATE',
  routes: 'ROUTES',
  sdk: 'SDKs',
  server: 'SERVER',
  tools: 'APIS & SDKS',
  wallet: 'WALLET',
  zones: 'ZONES',
}

/** Second path segment → subsection label (only applied to 3+ segment routes). */
export const ogSubsectionMap: Record<string, string> = {
  blockspace: 'BLOCKSPACE',
  console: 'CONSOLE',
  exchange: 'DEX',
  fees: 'FEES',
  foundry: 'FOUNDRY',
  go: 'GO',
  issuance: 'ISSUANCE',
  'machine-payments': 'MACHINE PAY',
  node: 'NODE',
  payments: 'PAYMENTS',
  'private-zones': 'ZONES',
  python: 'PYTHON',
  rpc: 'RPC',
  rust: 'RUST',
  'stablecoin-dex': 'EXCHANGE',
  'tempo-transaction': 'TRANSACTIONS',
  tip20: 'TIP-20',
  tip403: 'TIP-403',
  tips: 'TIPS',
  transactions: 'TRANSACTIONS',
  typescript: 'TYPESCRIPT',
  upgrades: 'UPGRADES',
  zones: 'ZONES',
}

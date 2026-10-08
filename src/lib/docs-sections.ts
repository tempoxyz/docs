export type DocsSection = {
  id:
    | 'overview'
    | 'accounts'
    | 'earn'
    | 'routes'
    | 'zones'
    | 'payments'
    | 'development'
    | 'protocol'
    | 'changelog'
  label: string
  href: string
  matches: string[]
}

/** Shared by the section tabs and Vocs sidebars, including existing deep links. */
export const docsSections: DocsSection[] = [
  {
    id: 'overview',
    label: 'Get Started',
    href: '/get-started',
    matches: ['/get-started', '/docs/quickstart/faucet'],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    href: '/docs/accounts',
    matches: [
      '/docs/accounts',
      '/docs/build',
      '/docs/guide/getting-funds',
      '/docs/quickstart/wallet-developers',
      '/docs/quickstart/tokenlist',
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/docs/payments',
    matches: [
      '/docs/payments',
      '/docs/guide/payments',
      '/docs/guide/tempo-transaction',
      '/docs/agents',
      '/docs/guide/machine-payments',
      '/docs/guide/mercator',
    ],
  },
  { id: 'earn', label: 'Earn', href: '/docs/earn', matches: ['/docs/earn'] },
  {
    id: 'routes',
    label: 'Routes',
    href: '/docs/routes',
    matches: ['/docs/routes', '/docs/guide/stablecoin-dex'],
  },
  {
    id: 'zones',
    label: 'Zones',
    href: '/docs/zones',
    matches: ['/docs/zones', '/docs/guide/private-zones'],
  },
  {
    id: 'development',
    label: 'Developer Resources',
    href: '/docs/development',
    matches: [
      '/docs/development',
      '/docs/guide/using-tempo-with-ai',
      '/docs/api',
      '/docs/tools',
      '/docs/developer-tools',
      '/docs/quickstart/developer-tools',
      '/docs/quickstart/integrate-tempo',
      '/docs/quickstart/connection-details',
      '/docs/quickstart/evm-compatibility',
      '/docs/cli',
      '/docs/sdk',
      '/docs/wallet',
      '/docs/server',
      '/docs/protocol/rpc',
      '/docs/ecosystem',
      '/docs/partners',
      '/docs/guide/ousd',
      '/docs/guide/bridge-layerzero',
      '/docs/guide/bridge-bungee',
      '/docs/guide/bridge-relay',
      '/docs/guide/node',
      '/docs/quickstart/verify-contracts',
      '/docs/quickstart/predeployed-contracts',
    ],
  },
]

export const specificationsSection: DocsSection = {
  id: 'protocol',
  label: 'Specifications',
  href: '/docs/protocol',
  matches: ['/docs/protocol', '/docs/guide/issuance', '/docs/quickstart'],
}

export const changelogSection: DocsSection = {
  id: 'changelog',
  label: 'Changelog',
  href: '/docs/protocol/upgrades',
  matches: ['/docs/protocol/upgrades', '/docs/changelog', '/docs/guide/node/network-upgrades'],
}

export function normalizeDocsSectionPath(path: string) {
  return path.replace(/^\/developers(?=\/|$)/, '').replace(/\/+$/, '') || '/'
}

export function matchesDocsSectionPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function getActiveDocsSection(path: string) {
  const pathname = normalizeDocsSectionPath(path)
  return [...docsSections, specificationsSection, changelogSection]
    .flatMap((section) => section.matches.map((prefix) => ({ section, prefix })))
    .filter(({ prefix }) => matchesDocsSectionPath(pathname, prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.section
}

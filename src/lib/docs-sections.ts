export type DocsSection = {
  id:
    | 'overview'
    | 'accounts'
    | 'earn'
    | 'routes'
    | 'zones'
    | 'developers'
    | 'nodes'
    | 'changelog'
    | 'machine-payments'
    | 'api'
    | 'tools'
    | 'ecosystem'
  label: string
  href: string
  matches: string[]
}

/** One section owner for every current and retained documentation route. */
export const docsSections: DocsSection[] = [
  {
    id: 'overview',
    label: 'Get Started',
    href: '/get-started',
    matches: [
      '/get-started',
      '/docs/quickstart/faucet',
      '/docs/guide/using-tempo-with-ai',
      '/docs/tools',
      '/docs/developer-tools',
      '/docs/quickstart/developer-tools',
      '/docs/sdk',
      '/docs/cli',
      '/docs/wallet',
      '/docs/server',
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    href: '/docs/accounts',
    matches: [
      '/docs/accounts',
      '/docs/build',
      '/docs/payments',
      '/docs/guide/payments',
      '/docs/guide/getting-funds',
      '/docs/protocol/tip20/virtual-addresses',
      '/docs/protocol/tip403/receive-policies',
    ],
  },
  { id: 'earn', label: 'Earn', href: '/docs/earn', matches: ['/docs/earn'] },
  { id: 'routes', label: 'Routes', href: '/docs/routes', matches: ['/docs/routes'] },
  {
    id: 'zones',
    label: 'Zones',
    href: '/docs/zones',
    matches: ['/docs/zones', '/docs/guide/private-zones', '/docs/protocol/zones'],
  },
  {
    id: 'machine-payments',
    label: 'Machine Payments',
    href: '/docs/agents',
    matches: ['/docs/agents', '/docs/guide/machine-payments', '/docs/guide/mercator'],
  },
  {
    id: 'developers',
    label: 'Tempo EVM',
    href: '/docs/development',
    matches: [
      '/docs/accounts/keys',
      '/docs/accounts/access-keys',
      '/docs/accounts/admin-keys',
      '/docs/network',
      '/docs/development',
      '/docs/quickstart',
      '/docs/protocol',
      '/docs/guide/tempo-transaction',
      '/docs/guide/issuance',
      '/docs/guide/stablecoin-dex',
    ],
  },
]

export const docsUtilitySections: DocsSection[] = [
  {
    id: 'api',
    label: 'API reference',
    href: '/docs/api',
    matches: ['/docs/api'],
  },
  {
    id: 'nodes',
    label: 'Nodes',
    href: '/docs/guide/node',
    matches: ['/docs/guide/node'],
  },
  {
    id: 'changelog',
    label: 'Changelog',
    href: '/docs/protocol/upgrades',
    matches: ['/docs/protocol/upgrades', '/docs/changelog'],
  },
  {
    id: 'ecosystem',
    label: 'Partners',
    href: '/docs/partners',
    matches: [
      '/docs/partners',
      '/docs/guide/ousd',
      '/docs/guide/bridge-layerzero',
      '/docs/guide/bridge-bungee',
      '/docs/guide/bridge-relay',
    ],
  },
]

export function normalizeDocsSectionPath(path: string) {
  return path.replace(/^\/developers(?=\/|$)/, '').replace(/\/+$/, '') || '/'
}

export function matchesDocsSectionPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function getActiveDocsSection(path: string) {
  const pathname = normalizeDocsSectionPath(path)
  return [...docsSections, ...docsUtilitySections]
    .flatMap((section) => section.matches.map((prefix) => ({ section, prefix })))
    .filter(({ prefix }) => matchesDocsSectionPath(pathname, prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.section
}

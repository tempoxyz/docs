export type DocsSection = {
  id:
    | 'overview'
    | 'accounts'
    | 'earn'
    | 'routes'
    | 'zones'
    | 'developers'
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
    matches: ['/get-started', '/docs/quickstart/faucet', '/docs/guide/using-tempo-with-ai'],
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
      '/docs/protocol/transactions/AccountKeychain',
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
      '/docs/network',
      '/docs/development',
      '/docs/quickstart',
      '/docs/protocol',
      '/docs/changelog',
      '/docs/guide/tempo-transaction',
      '/docs/guide/issuance',
      '/docs/guide/stablecoin-dex',
      '/docs/guide/node',
    ],
  },
]

export const docsUtilitySections: DocsSection[] = [
  {
    id: 'tools',
    label: 'APIs & SDKs',
    href: '/docs/tools',
    matches: [
      '/docs/api',
      '/docs/tools',
      '/docs/developer-tools',
      '/docs/quickstart/developer-tools',
      '/docs/cli',
      '/docs/sdk',
      '/docs/wallet',
      '/docs/server',
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    href: '/docs/ecosystem',
    matches: [
      '/docs/ecosystem',
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

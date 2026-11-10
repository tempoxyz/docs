export type DocsSection = {
  id:
    | 'overview'
    | 'accounts'
    | 'earn'
    | 'routes'
    | 'zones'
    | 'developers'
    | 'machine-payments'
    | 'operate'
    | 'api'
    | 'tools'
    | 'resources'
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
      '/docs/developer-tools',
      '/docs/quickstart/developer-tools',
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    href: '/docs/accounts',
    matches: ['/docs/accounts'],
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
      '/docs/build',
      '/docs/payments',
      '/docs/guide/payments',
      '/docs/guide/getting-funds',
      '/docs/network',
      '/docs/development',
      '/docs/quickstart',
      '/docs/protocol',
      '/docs/guide/tempo-transaction',
      '/docs/guide/issuance',
      '/docs/guide/stablecoin-dex',
    ],
  },
  {
    id: 'operate',
    label: 'Operate',
    href: '/docs/guide/node',
    matches: ['/docs/guide/node', '/docs/changelog', '/docs/protocol/upgrades'],
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
    id: 'tools',
    label: 'SDKs & CLI',
    href: '/docs/sdk',
    matches: ['/docs/tools', '/docs/sdk', '/docs/cli', '/docs/wallet', '/docs/server'],
  },
  {
    id: 'resources',
    label: 'Guides',
    href: '/docs/resources/guides',
    matches: ['/docs/resources'],
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

export type DocsArea = {
  id: 'get-started' | 'products' | 'evm' | 'operate' | 'reference' | 'resources'
  label: string
  href: string
  description: string
  sections: DocsSection['id'][]
}

/** The six areas in the global nav. Each groups one or more sections, which own the sidebars. */
export const docsAreas: DocsArea[] = [
  {
    id: 'get-started',
    label: 'Get started',
    href: '/get-started',
    description: 'Quickstart, testnet funds and AI setup',
    sections: ['overview'],
  },
  {
    id: 'products',
    label: 'Products',
    href: '/docs/accounts',
    description: 'Accounts, Earn, Routes, Zones and Machine Payments',
    sections: ['accounts', 'earn', 'routes', 'zones', 'machine-payments'],
  },
  {
    id: 'evm',
    label: 'Tempo EVM',
    href: '/docs/development',
    description: 'Build directly on the chain',
    sections: ['developers'],
  },
  {
    id: 'operate',
    label: 'Operate',
    href: '/docs/guide/node',
    description: 'Run nodes and track network upgrades',
    sections: ['operate'],
  },
  {
    id: 'reference',
    label: 'Reference',
    href: '/docs/api',
    description: 'Tempo API, SDKs and CLI',
    sections: ['api', 'tools'],
  },
  {
    id: 'resources',
    label: 'Resources',
    href: '/docs/resources/guides',
    description: 'Payment guides and partners',
    sections: ['resources', 'ecosystem'],
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

export function getDocsSectionById(id: DocsSection['id']) {
  return [...docsSections, ...docsUtilitySections].find((section) => section.id === id)
}

export function getDocsAreaForSection(id: DocsSection['id'] | undefined) {
  return id ? docsAreas.find((area) => area.sections.includes(id)) : undefined
}

export function getActiveDocsArea(path: string) {
  return getDocsAreaForSection(getActiveDocsSection(path)?.id)
}

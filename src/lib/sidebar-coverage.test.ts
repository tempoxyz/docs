import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { docsSections, docsUtilitySections, getActiveDocsSection } from './docs-sections'

const config = (await import(`${'../../vocs.config'}`)).default

function links(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []
  const item = value as Record<string, unknown>
  return [
    ...(typeof item.link === 'string' ? [item.link.split('#')[0].replace(/\/$/, '')] : []),
    ...Object.values(item).flatMap(links),
  ]
}

// Retained landing URLs overlap the current Tempo EVM and tools hubs.
const retainedLandings = new Set([
  '/docs/build',
  '/docs/payments',
  '/docs/quickstart/developer-tools',
])
// OpenAPI creates sidebar entries for these tags; local MDX supplies their content.
const generatedApiGroups = new Set([
  '/docs/api/transactions',
  '/docs/api/transfers',
  '/docs/api/zones',
])
// Supporting guides remain discoverable through their primary guide or partner category.
const supportingPages = new Map([
  ['/docs/partners/developer-tools', '/docs/partners/explorers-and-debugging'],
  ['/docs/guide/payments/send-a-payment/examples', '/docs/guide/payments/send-a-payment'],
])
const routes = readdirSync(new URL('../pages/', import.meta.url), { recursive: true })
  .filter(
    (file): file is string =>
      typeof file === 'string' && /^(docs|get-started)\//.test(file) && file.endsWith('.mdx'),
  )
  .map((file) => `/${file.replace(/\.mdx$/, '').replace(/\/index$/, '')}`)

function sidebarFor(route: string) {
  const sidebars = config.sidebar as Record<string, unknown>
  const owner = Object.keys(sidebars)
    .filter((prefix) => route === prefix || route.startsWith(`${prefix}/`))
    .sort((a, b) => b.length - a.length)[0]
  return sidebars[owner]
}

function sidebarLinks(route: string) {
  return new Set([
    ...links(sidebarFor(route)),
    ...(route.startsWith('/docs/api/') ? links(config.openapi) : []),
  ])
}

describe('documentation sidebar coverage', () => {
  it.each(routes)('%s has a navigation home', (route) => {
    if (retainedLandings.has(route) || generatedApiGroups.has(route)) return
    const parent = supportingPages.get(route)
    if (parent) {
      expect(sidebarLinks(route).has(parent), `${route} has a visible parent guide`).toBe(true)
      const source = readFileSync(new URL(`../pages${parent}.mdx`, import.meta.url), 'utf8')
      const linkedRoutes = [...source.matchAll(/\]\((\/[^)\s]+)\)/g)].map(
        ([, href]) => href.split('#')[0],
      )
      expect(linkedRoutes, `${parent} links to the supporting page`).toContain(route)
      return
    }
    // Historical local proposals use the canonical TIP directory linked under Network.
    const navigationRoute = route.startsWith('/docs/protocol/tips/tip-') ? 'https://tips.sh' : route
    expect(sidebarLinks(route).has(navigationRoute), route).toBe(true)
  })
})

describe('section sidebars', () => {
  it.each([...docsSections, ...docsUtilitySections])('$label sidebar links its landing page', ({
    href,
  }) => {
    expect(links(sidebarFor(href))).toContain(href)
  })

  it('keeps Get Started to onboarding pages, then its API reference', () => {
    type SidebarNode = { text?: string; items?: SidebarNode[] }
    const sidebar = sidebarFor('/get-started') as SidebarNode[]
    expect(sidebar.map(({ text }) => text)).toEqual(['Get Started', 'API reference'])
    expect(links(sidebar)).toEqual(
      expect.arrayContaining([
        '/docs/quickstart/faucet',
        '/docs/quickstart/connection-details',
        '/docs/guide/using-tempo-with-ai',
      ]),
    )
    expect(sidebarFor('/docs/quickstart/connection-details')).toBe(sidebar)
  })

  it('merges Tempo EVM and Operate into Network: chain groups, then Run a node, then Changelog', () => {
    type SidebarNode = { text?: string; link?: string; items?: SidebarNode[] }
    const sidebar = sidebarFor('/docs/development') as SidebarNode[]
    expect(sidebar.map(({ text }) => text)).toEqual([
      'Tempo EVM',
      'Run a node',
      'Changelog',
      'API reference',
    ])
    expect(sidebarFor('/docs/guide/node')).toBe(sidebar)
    expect(sidebarFor('/docs/changelog')).toBe(sidebar)
    expect(sidebarFor('/docs/protocol/upgrades/t13')).toBe(sidebar)
    expect(sidebar[2].items?.map(({ text }) => text)).toEqual([
      'Overview',
      'Network upgrades',
      'Node releases',
      'Operator updates',
    ])
  })

  it.each([
    ['/docs/accounts', 'https://wallet.tempo.xyz'],
    ['/docs/agents', 'https://mpp.dev'],
    ['/docs/development', 'https://explore.tempo.xyz'],
  ])('%s sidebar links %s, which left the header', (landing, href) => {
    expect(links(sidebarFor(landing))).toContain(href)
  })

  it.each([
    ['/docs/guide/node/validator-keys', 'developers', '/docs/development'],
    ['/docs/guide/node/network-upgrades', 'developers', '/docs/development'],
    ['/docs/protocol/upgrades/t11', 'developers', '/docs/development'],
    ['/docs/changelog', 'developers', '/docs/development'],
    ['/docs/cli/api', 'tools', '/docs/sdk'],
    ['/docs/wallet/recipes', 'tools', '/docs/sdk'],
    ['/docs/sdk/typescript/api-client', 'tools', '/docs/sdk'],
    ['/docs/resources/guides/payment-links', 'resources', '/docs/resources/guides'],
    ['/docs/guide/bridge-relay', 'ecosystem', '/docs/partners'],
  ])('%s appears once, in the %s sidebar', (route, section, landing) => {
    expect(getActiveDocsSection(route)?.id).toBe(section)
    expect(sidebarFor(route)).toBe(sidebarFor(landing))
    const sidebars = [...new Set(Object.values(config.sidebar as Record<string, unknown>))]
    expect(sidebars.filter((sidebar) => links(sidebar).includes(route))).toEqual([
      sidebarFor(landing),
    ])
    expect(links(sidebarFor(route)).filter((link) => link === route)).toHaveLength(1)
  })
})

describe('resource guide navigation', () => {
  it('lists guides in their own sidebar with collapsed topics', () => {
    type SidebarNode = { text?: string; link?: string; collapsed?: boolean; items?: SidebarNode[] }
    const sidebar = sidebarFor('/docs/resources/guides') as SidebarNode[]
    expect(sidebar.map(({ text }) => text)).toEqual(['Guides'])
    const guides = sidebar[0]
    expect(guides.items?.[0]).toEqual({ text: 'All guides', link: '/docs/resources/guides' })
    expect(guides.items?.filter(({ items }) => items).every(({ collapsed }) => collapsed)).toBe(
      true,
    )
    const compliance = guides.items?.find(({ text }) => text === 'Compliance and security')
    expect(links(compliance)).toContain('/docs/resources/guides/payment-screening')
    expect(links(compliance)).toContain('/docs/resources/guides/compliance-controls')
  })

  it('assigns resource guides to the Guides section', () => {
    for (const route of routes.filter((route) => route.startsWith('/docs/resources/'))) {
      expect(getActiveDocsSection(route)?.id).toBe('resources')
      expect(sidebarFor(route)).toBe(sidebarFor('/docs/resources/guides'))
    }
  })
})

describe('specification navigation ownership', () => {
  it('assigns each route prefix to only one section', () => {
    const prefixes = [...docsSections, ...docsUtilitySections].flatMap(({ matches }) => matches)
    expect(new Set(prefixes).size).toBe(prefixes.length)
  })

  it.each([
    ['/docs/protocol/transactions/AccountKeychain', 'developers', '/docs/development'],
    ['/docs/protocol/tip20/virtual-addresses', 'developers', '/docs/development'],
    ['/docs/protocol/tip403/receive-policies', 'developers', '/docs/development'],
    ...['', '/architecture', '/accounts', '/bridging', '/rpc', '/execution', '/proving'].map(
      (suffix) => [`/docs/protocol/zones${suffix}`, 'zones', '/docs/zones'],
    ),
  ])('%s uses the %s sidebar without duplicate links', (route, section, overview) => {
    expect(getActiveDocsSection(route)?.id).toBe(section)
    expect(sidebarFor(route)).toBe(sidebarFor(overview))
    expect(links(sidebarFor(route)).filter((link) => link === route)).toHaveLength(1)
    if (section !== 'developers')
      expect(links(sidebarFor('/docs/development'))).not.toContain(route)
  })

  it('places specifications directly in the matching Tempo EVM chapter', () => {
    type SidebarNode = { text?: string; link?: string; items?: SidebarNode[] }
    const chapters = (sidebarFor('/docs/development') as SidebarNode[])[0].items ?? []
    expect(chapters.some(({ text }) => text === 'Protocol')).toBe(false)
    expect(chapters.find(({ text }) => text === 'All specifications')).toMatchObject({
      text: 'All specifications',
      link: '/docs/protocol',
    })
    for (const [chapter, route] of [
      ['Transactions', '/docs/protocol/transactions/spec-tempo-transaction'],
      ['Transactions', '/docs/protocol/transactions/eip-4337'],
      ['Fees', '/docs/protocol/fees/spec-fee'],
      ['Fees', '/docs/protocol/fees/spec-fee-amm'],
      ['TIP-20 Tokens', '/docs/protocol/tip20/spec'],
      ['Policies', '/docs/protocol/tip403/spec'],
      ['Stablecoin DEX', '/docs/protocol/exchange/spec'],
      ['Network', '/docs/protocol/blockspace/payment-lane-specification'],
      ['Network', '/docs/protocol/blockspace/consensus'],
    ]) {
      const items = chapters.find(({ text }) => text === chapter)?.items ?? []
      expect(
        items.some(({ link }) => link === route),
        `${chapter}: ${route}`,
      ).toBe(true)
      expect(
        items.some(({ items: children }) => children?.length),
        chapter,
      ).toBe(false)
      expect(
        links(chapters).filter((link) => link === route),
        route,
      ).toHaveLength(1)
    }
  })
})

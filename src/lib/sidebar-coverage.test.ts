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

// Retained landing URLs overlap the current Accounts and tools hubs.
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
  ['/docs/guide/bridge-layerzero', '/docs/partners/bridges'],
  ['/docs/guide/bridge-bungee', '/docs/partners/bridges'],
  ['/docs/guide/bridge-relay', '/docs/partners/bridges'],
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

describe('specification navigation ownership', () => {
  it('assigns each route prefix to only one section', () => {
    const prefixes = [...docsSections, ...docsUtilitySections].flatMap(({ matches }) => matches)
    expect(new Set(prefixes).size).toBe(prefixes.length)
  })

  it.each([
    ['/docs/protocol/transactions/AccountKeychain', 'developers', '/docs/development'],
    ['/docs/protocol/tip20/virtual-addresses', 'accounts', '/docs/accounts'],
    ['/docs/protocol/tip403/receive-policies', 'accounts', '/docs/accounts'],
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

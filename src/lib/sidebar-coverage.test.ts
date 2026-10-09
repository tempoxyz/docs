import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
const routes = readdirSync(new URL('../pages/', import.meta.url), { recursive: true })
  .filter(
    (file): file is string =>
      typeof file === 'string' && /^(docs|get-started)\//.test(file) && file.endsWith('.mdx'),
  )
  .map((file) => `/${file.replace(/\.mdx$/, '').replace(/\/index$/, '')}`)

function sidebarLinks(route: string) {
  const sidebars = config.sidebar as Record<string, unknown>
  const owner = Object.keys(sidebars)
    .filter((prefix) => route === prefix || route.startsWith(`${prefix}/`))
    .sort((a, b) => b.length - a.length)[0]
  return new Set([
    ...links(sidebars[owner]),
    ...(route.startsWith('/docs/api/') ? links(config.openapi) : []),
  ])
}

describe('documentation sidebar coverage', () => {
  it.each(routes)('%s has a navigation home', (route) => {
    if (retainedLandings.has(route) || generatedApiGroups.has(route)) return
    // Historical local proposals use the canonical TIP directory linked in Protocol.
    const navigationRoute = route.startsWith('/docs/protocol/tips/tip-') ? 'https://tips.sh' : route
    expect(sidebarLinks(route).has(navigationRoute), route).toBe(true)
  })
})

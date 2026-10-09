import {
  type DocsSection,
  docsSections,
  docsUtilitySections,
  getActiveDocsSection,
  normalizeDocsSectionPath,
} from './docs-sections'

export const aiDocsDescription =
  'Build stablecoin products with Accounts, Earn, Routes, Zones, and Machine Payments, or build on Tempo EVM. Find API references, SDKs, CLI tools, and partner integrations.'

const sectionDescriptions: Partial<Record<DocsSection['id'], string>> = {
  overview:
    'Choose a starting point, send a test payment, get testnet funds, or connect a coding agent.',
  accounts:
    'Create accounts, connect wallets, read balances, send and receive payments, and reconcile deposits.',
  earn: 'Choose a vault, deposit stablecoins, read positions, and withdraw. Earn is in beta; see the introduction for access.',
  routes:
    'Accept cross-network deposits, quote transfers, and track delivery. Routes is in beta; see the introduction for access.',
  zones:
    'Connect to a Zone and work with private balances, deposits, and withdrawals. Zones is in limited preview; see the introduction for access. Earlier testnet sandbox guides describe a separate integration.',
  'machine-payments':
    'Pay for APIs, accept API payments, find services, and use Machine Payments Protocol (MPP).',
  developers:
    'Build on Tempo EVM: wallets and keys, transactions and fees, TIP-20 Tokens, contracts, exchange, network details, nodes, protocol specifications, and changelog.',
  tools:
    'API reference and authentication, SDKs, CLI, wallet and server libraries. An API key authenticates API requests; an account signing key authorizes transactions.',
  ecosystem:
    'Find wallet providers, bridges, RPC infrastructure, data services, and other third-party integrations.',
}

export const aiDocsSections = [...docsSections, ...docsUtilitySections]
export const aiDocsContextMarker = '<!-- tempo-docs-context -->'

export type AiIndexEntry = { title: string; href: string; description: string; route: string }

export function markdownRoute(href: string) {
  const pathname = new URL(href, 'https://docs.invalid').pathname
  const route = normalizeDocsSectionPath(pathname.replace(/\.md$/, '').replace(/\/index$/, ''))
  return route === '/' ? '/index' : route
}

export function markdownHref(href: string) {
  const route = markdownRoute(href)
  return `${route}.md`
}

/** Vocs emits one Markdown list entry per page in sidebar order. */
export function parseAiIndex(content: string): AiIndexEntry[] {
  return [...content.matchAll(/^- \[([^\n]+)\]\(([^)\s]+)\)(?:: (.*))?$/gm)].map(
    ([, title, href, description = '']) => ({
      title,
      href,
      description,
      route: markdownRoute(href),
    }),
  )
}

export function aiDocsNotice() {
  return [
    '> Tempo MCP: Use `search`, `find_pages`, `read_page`, and `code` at `https://mcp.tempo.xyz` for Tempo and related documentation.',
    '> If an indexed page is missing or reflects an older site, read this site’s [documentation index](/llms.txt) and Markdown pages directly.',
    '',
  ].join('\n')
}

function sectionDescription(section: DocsSection) {
  const description = sectionDescriptions[section.id]
  if (!description) throw new Error(`Missing AI routing description for ${section.label}`)
  return description
}

/** Keep every generated page, grouped by the same ownership rules as the visible navigation. */
export function renderAiIndex(content: string) {
  const entries = parseAiIndex(content)
  if (!entries.length) throw new Error('Cannot generate the AI index without Vocs page entries.')
  const remaining = new Set(entries)
  const lines = [
    '# Tempo Docs',
    '',
    aiDocsDescription,
    '',
    'Start with the product guide for your task, then use APIs & SDKs for exact methods and schemas. Use Tempo EVM for chain behavior and protocol details.',
    '',
    aiDocsNotice(),
    '[Docs skill](/SKILL.md) · [Full documentation](/llms-full.txt)',
    '',
  ]
  const append = (items: AiIndexEntry[]) => {
    for (const entry of items) {
      lines.push(
        `- [${entry.title}](${markdownHref(entry.href)})${entry.description ? `: ${entry.description}` : ''}`,
      )
      remaining.delete(entry)
    }
  }
  for (const section of aiDocsSections) {
    lines.push(`## ${section.label}`, '', sectionDescription(section), '')
    const owned = entries.filter((entry) => getActiveDocsSection(entry.route)?.id === section.id)
    // Put the section landing first without changing the guide order within it.
    append(owned.filter((entry) => entry.route === section.href))
    const guides = owned.filter((entry) => entry.route !== section.href)
    if (section.id === 'zones') {
      append(guides.filter((entry) => !entry.route.startsWith('/docs/guide/private-zones')))
      const sandbox = guides.filter((entry) => entry.route.startsWith('/docs/guide/private-zones'))
      if (sandbox.length) {
        lines.push(
          '',
          '### Earlier testnet sandbox',
          '',
          'These guides use the earlier Zone A / Zone B sandbox. They do not establish which operations are available in the current limited preview.',
          '',
        )
        append(sandbox)
      }
    } else append(guides)
    lines.push('')
  }
  if (remaining.size) {
    const unowned = [...remaining].filter((entry) => entry.route.startsWith('/docs/'))
    if (unowned.length)
      throw new Error(
        `Docs pages have no AI navigation home: ${unowned.map((entry) => entry.route).join(', ')}`,
      )
    lines.push('## Other pages', '', 'Pages outside the product and reference navigation.', '')
    append([...remaining])
  }
  return `${lines.join('\n').trim()}\n`
}

/** A short breadcrumb makes a page useful even when retrieved without the index. */
export function renderAiPage(content: string, route: string) {
  if (content.startsWith(aiDocsContextMarker)) return content
  const pageRoute = markdownRoute(route)
  const section = getActiveDocsSection(pageRoute)
  const context = section
    ? `> Section: [${section.label}](${markdownHref(section.href)}). ${sectionDescription(section)}`
    : '> Read the [documentation index](/llms.txt) to choose a product or integration guide.'
  const sandbox = pageRoute.startsWith('/docs/guide/private-zones')
    ? '> Earlier testnet sandbox: use [Zones](/docs/zones.md) for the current limited preview.\n'
    : ''
  return `${aiDocsContextMarker}\n> Source: [${pageRoute}](${markdownHref(pageRoute)})\n${context}\n${sandbox}> [Documentation index](/llms.txt) · [Docs skill](/SKILL.md)\n\n${aiDocsNotice()}\n${content}`
}

/** Reuse the per-page exports so full-context downloads retain page provenance. */
export function renderAiFull(index: string, pages: ReadonlyMap<string, string>) {
  const entries = parseAiIndex(index)
  return `${index}\n---\n\n${entries
    .map(({ route }) => {
      const content = pages.get(route)
      if (content === undefined) throw new Error(`Missing Markdown export for ${route}`)
      return content
    })
    .join('\n\n---\n\n')}\n`
}

import {
  type DocsSection,
  docsSections,
  docsUtilitySections,
  getActiveDocsSection,
  normalizeDocsSectionPath,
} from './docs-sections'
import { renderStartBuildingMarkdown, showsStartBuilding } from './start-building'

export const aiDocsDescription =
  'Build stablecoin products with Accounts, Earn, Routes, Zones, and Machine Payments, or build on Tempo EVM. Find API references, SDKs, CLI tools, and partner integrations.'

const sectionDescriptions: Partial<Record<DocsSection['id'], string>> = {
  overview:
    'Choose a starting point, send a test payment, get testnet funds, connect a coding agent, find the SDKs and CLI, and use the resource guides to plan payment workflows, liquidity, provider selection, and partner integrations.',
  accounts:
    'Create accounts, set up signing methods, policies, access keys, key rotation, and fees, and follow guides for users, automations, agents, and teams.',
  earn: 'Choose a vault, deposit stablecoins, read positions, and withdraw. Earn is in beta; see the introduction for access.',
  routes:
    'Move stablecoins between Tempo and other networks: try a route, set up API access, choose a supported route, quote it, accept deposits or make a transfer, and track delivery. Routes is in beta; see the introduction for access.',
  zones:
    'Connect to a Zone and work with private balances, deposits, and withdrawals. Zones is live on Mainnet; see the introduction to set up a Zone. Earlier testnet sandbox guides describe a separate integration.',
  'machine-payments':
    'Pay for APIs, accept API payments over MPP or x402, find services, and use MPP (https://mpp.dev).',
  developers:
    'Build on Tempo EVM: wallets and keys, payments, transactions and fees, TIP-20 Tokens, contracts, exchange, network details, nodes, protocol specifications, and changelog.',
  api: 'Tempo API reference: authentication, conventions, endpoints grouped by product, Console management endpoints, JSON-RPC, and the indexer. An API key authenticates API requests; an account signing key authorizes transactions.',
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

type QuickReferenceSource = { label: string; route: string; values: readonly string[] }

/**
 * Values agents look up most often, so the index alone answers common setup questions.
 * `values` lists what each entry takes from the source page it links to.
 */
export const aiQuickReference: readonly {
  text: string
  sources: readonly QuickReferenceSource[]
}[] = [
  {
    text: 'Networks: Tempo Mainnet uses chain ID `4217` and RPC `https://rpc.tempo.xyz`. Tempo Testnet (Moderato) uses chain ID `42431` and RPC `https://rpc.moderato.tempo.xyz`.',
    sources: [
      {
        label: 'Network details',
        route: '/docs/quickstart/connection-details',
        values: ['4217', 'https://rpc.tempo.xyz', '42431', 'https://rpc.moderato.tempo.xyz'],
      },
    ],
  },
  {
    text: 'Fees: Tempo has no native gas token. Transactions pay fees in a USD TIP-20 stablecoin, chosen per transaction with `feeToken`.',
    sources: [
      {
        label: 'Fee tokens',
        route: '/docs/accounts/fees/fee-tokens',
        values: ['no separate gas token', 'feeToken'],
      },
    ],
  },
  {
    text: 'Testnet funds: send `POST https://tempo.com/developers/api/faucet` with `{"address": "<ADDRESS>"}`, or call the `tempo_fundAddress` RPC method on Testnet.',
    sources: [
      {
        label: 'Faucet',
        route: '/docs/quickstart/faucet',
        values: ['https://tempo.com/developers/api/faucet', 'tempo_fundAddress'],
      },
    ],
  },
  {
    text: 'Stablecoins: TIP-20 tokens use 6 decimals. On Mainnet, OUSD is `0x20c0000000000000000000006a37da5c996874be` and pathUSD is `0x20c0000000000000000000000000000000000000`. On Testnet, AlphaUSD is `0x20c0000000000000000000000000000000000001`.',
    sources: [
      { label: 'Stablecoins', route: '/get-started/stablecoins', values: ['6 decimal'] },
      {
        label: 'OUSD',
        route: '/docs/guide/ousd',
        values: [
          '0x20c0000000000000000000006a37da5c996874be',
          '0x20c0000000000000000000000000000000000000',
        ],
      },
      {
        label: 'Faucet tokens',
        route: '/docs/quickstart/faucet',
        values: ['0x20c0000000000000000000000000000000000001'],
      },
    ],
  },
  {
    text: 'SDKs: TypeScript uses `viem` (`viem/tempo`) and `wagmi` (`wagmi/tempo`). The Tempo API client is `tapimo` and the MPP SDK is `mppx`. Python uses `pytempo`, Go `github.com/tempoxyz/tempo-go`, Rust `tempo-alloy`, and Foundry `tempo-std`.',
    sources: [
      {
        label: 'SDKs',
        route: '/docs/sdk',
        values: [
          'viem/tempo',
          'wagmi/tempo',
          'tapimo',
          'mppx',
          'pytempo',
          'github.com/tempoxyz/tempo-go',
          'tempo-alloy',
          'tempo-std',
        ],
      },
    ],
  },
  {
    text: 'Tempo API: `https://api.tempo.xyz/v1`. Many reads need no key. Send a key as `tempo-api-key: tempo:sk:...` or `Authorization: Bearer tempo:sk:...`.',
    sources: [
      {
        label: 'Authentication',
        route: '/docs/api/authentication',
        values: ['https://api.tempo.xyz/v1', 'tempo-api-key', 'Authorization: Bearer'],
      },
    ],
  },
  {
    text: 'CLI: install with `curl -fsSL https://tempo.com/install | bash`.',
    sources: [
      {
        label: 'Tempo CLI',
        route: '/docs/cli',
        values: ['curl -fsSL https://tempo.com/install | bash'],
      },
    ],
  },
]

function renderQuickReference() {
  return [
    '### Quick reference',
    '',
    'Common values, each linked to the page that owns it. Read that page before writing code.',
    '',
    ...aiQuickReference.map(
      ({ text, sources }) =>
        `- ${text} See ${sources.map(({ label, route }) => `[${label}](${markdownHref(route)})`).join(', ')}.`,
    ),
    '',
  ]
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
    'Start with the product guide for your task, then use the API reference, SDKs, and CLI for exact methods and schemas. Use Tempo EVM for chain behavior and protocol details.',
    '',
    aiDocsNotice(),
    '[Docs skill](/SKILL.md) · [Full documentation](/llms-full.txt)',
    '',
    ...renderQuickReference(),
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
          'These guides use the earlier Zone A / Zone B sandbox. They do not establish which operations are available in current Mainnet deployments.',
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

/**
 * A short breadcrumb makes a page useful even when retrieved without the index.
 * The page ends with the Start building steps its HTML footer shows.
 */
export function renderAiPage(content: string, route: string) {
  if (content.startsWith(aiDocsContextMarker)) return content
  const pageRoute = markdownRoute(route)
  const section = getActiveDocsSection(pageRoute)
  const context = section
    ? `> Section: [${section.label}](${markdownHref(section.href)}). ${sectionDescription(section)}`
    : '> Read the [documentation index](/llms.txt) to choose a product or integration guide.'
  const sandbox = pageRoute.startsWith('/docs/guide/private-zones')
    ? '> Earlier testnet sandbox: use [Zones](/docs/zones.md) for current Mainnet deployments.\n'
    : ''
  const body = showsStartBuilding(pageRoute)
    ? `${content.trimEnd()}\n\n${renderStartBuildingMarkdown()}\n`
    : content
  return `${aiDocsContextMarker}\n> Source: [${pageRoute}](${markdownHref(pageRoute)})\n${context}\n${sandbox}> [Documentation index](/llms.txt) · [Docs skill](/SKILL.md)\n\n${aiDocsNotice()}\n${body}`
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

import fs from 'node:fs'
import path from 'node:path'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { slug } from '../../node_modules/vocs/dist/internal/openapi/anchors.js'
import {
  type Ir,
  type IrOperation,
  parse,
} from '../../node_modules/vocs/dist/internal/openapi/parser.js'
import { operationWithQuery } from '../../node_modules/vocs/dist/internal/openapi/query-presets.js'
import { groupPath } from '../../node_modules/vocs/dist/internal/openapi/route.js'
import { codeSamples } from '../../node_modules/vocs/dist/internal/openapi/sample.js'
import { tempoAgentSetupCommands } from './ai-install-commands'
import { docsLinkCards } from './docs-link-cards'
import { loadTempoOpenApi } from './tempo-openapi'

type MarkdownAttribute = {
  name?: string
  type: string
  value?: MarkdownExpression | string | null
}

type MarkdownExpression = {
  data?: {
    estree?: {
      body?: Array<{
        expression?: {
          expressions?: unknown[]
          quasis?: Array<{ value?: { cooked?: string | null } }>
          type?: string
          value?: unknown
        }
        type?: string
      }>
    }
  }
  type: string
  value?: string
}

type MarkdownNode = {
  attributes?: MarkdownAttribute[]
  children?: MarkdownNode[]
  depth?: number
  lang?: string
  name?: string | null
  ordered?: boolean
  spread?: boolean
  start?: number
  title?: string | null
  type: string
  url?: string
  value?: string
}

type MarkdownContext = {
  getSnippet: (fileName: string) => string | undefined
  openApi?: Ir
}

type MarkdownOptions = { loadOpenApi?: () => Promise<Ir> }

const openApiSpecs = new Map<string, Promise<Ir>>()
const markdownParser = unified().use(remarkParse)
const openApiSpecUrl = 'https://api.tempo.xyz/openapi.json'
const presentationOnlyElements = new Set([
  'meta',
  'script',
  'style',
  'title',
  'DocsHomeProductIcon',
])
const tempoReleasesUrl = 'https://github.com/tempoxyz/tempo/releases'

const interactiveDescriptions: Record<string, string> = {
  EarnDepositDemo:
    'In the interactive web page, create a testnet passkey account, get test pathUSD from the faucet, choose a deposit amount (1 pathUSD by default), approve it for the verified vault, and confirm a deposit. Inspect the resulting shares and receipt, then withdraw the test position. Every transaction requires your confirmation and uses Moderato testnet.',
  EarnWithdrawDemo:
    'In the interactive web page, restore the passkey test account from the deposit demo and redeem its full position in the verified Moderato pathUSD vault. Confirm the withdrawal and inspect the receipt. If the account has no shares, make a test deposit first.',
  EarnVaultDemo:
    'In the interactive web page, inspect the automatically loaded verified Earn vault directory, starting with the testnet demo vault when available, or select another network and vault to inspect its asset, access rules, deposit status, withdrawal capabilities, and available liquidity. The demo makes read-only requests to Tempo API and starts on Moderato testnet. See the [verified vault API reference](/docs/api/earn#getverifiedearnvaults) for the request and response fields.',
  PasskeyAccountDemo:
    'In the interactive web page, create a passkey account or reconnect an existing passkey, inspect and copy its address, and disconnect. Creating the account does not move or fund stablecoins.',
  AdminKeyDemo:
    'In the interactive web page, create or connect a testnet passkey account, authorize an admin key, inspect its onchain status, and revoke it.',
  SupportedRoutesTable:
    'The interactive page lists every route in the live directory, read from GET https://api.tempo.xyz/v1/routes, ' +
    "with each route's source and destination asset, funding methods, and whether fee coverage (1:1 delivery) is available.",
  RoutesTester:
    'Open the interactive Routes API demo at /docs/routes/test. Choose source and destination assets, ' +
    'optionally request subsidized 1:1 delivery, get a quote, create the transfer or deposit address, ' +
    'sign with Tempo Wallet (Tempo sources) or a browser wallet, and track delivery. ' +
    'The demo sends API requests directly to api.tempo.xyz; API keys stay in tab memory.',
  ConnectWallet: 'Connect a wallet in the interactive web page.',
  T7BenchmarkVisual: 'The benchmark values are listed in the table below.',
  TempoMcpExplorer: 'Use the interactive web page to try the Tempo MCP server.',
  TerminalDemo:
    'The interactive terminal simulates the challenge, payment, and retry sequence for a paid request.',
  TidxQuery: 'Use the interactive web page to run SQL against the public Tempo indexer.',
  TokenListDemo: 'The interactive web page displays the current Tempo token list.',
  ValidatorTopologyDiagram:
    'Two separate Validator units each contain a trusted RPC group and its validator: ' +
    'R1 with V1, and R2 with V2. A client outside both units submits a transaction to R1 over JSON-RPC. ' +
    'R1 and R2 each connect to Public Nodes and to each other over bidirectional execution P2P. ' +
    'R1 follows V1 and R2 follows V2 using --follow over WebSocket; each pair also has a ' +
    'bidirectional execution P2P connection. V1 and V2 communicate over bidirectional consensus P2P, ' +
    'with no execution P2P connection between them.',
}

const demoStepLabels: Record<string, string> = {
  AddFunds: 'Add funds',
  AddFundsToOthers: 'Add funds to others',
  AddFundsToWallet: 'Add funds to wallet',
  AddTokensToWallet: 'Add tokens to wallet',
  ApproveSpend: 'Approve spend',
  BurnFeeAmmLiquidity: 'Burn fee AMM liquidity',
  BurnToken: 'Burn token',
  BurnTokenBlocked: 'Burn token blocked',
  CancelOrder: 'Cancel order',
  CheckFeeAmmPool: 'Check fee AMM pool',
  Connect: 'Connect',
  ConnectWallet: 'Connect wallet',
  CreateOrLoadToken: 'Create or load token',
  CreateToken: 'Create token',
  CreateTokenPolicy: 'Create token policy',
  DepositToTempoWallet: 'Deposit to tempo wallet',
  DepositToZone: 'Deposit to zone',
  GrantTokenRoles: 'Grant token roles',
  LinkTokenPolicy: 'Link token policy',
  MakeSwaps: 'Make swaps',
  MintFeeAmmLiquidity: 'Mint fee AMM liquidity',
  MintToken: 'Mint token',
  PauseUnpauseTransfers: 'Pause unpause transfers',
  PayWithFeeToken: 'Pay with fee token',
  PayWithIssuedToken: 'Pay with issued token',
  PlaceOrder: 'Place order',
  QueryOrder: 'Query order',
  RevokeTokenRoles: 'Revoke token roles',
  ReceivePolicyDemo:
    'Create a temporary Moderato account, accept AlphaUSD, hold BetaUSD, and recover the blocked payment.',
  SendParallelPayments: 'Send parallel payments',
  SendPayment: 'Send payment',
  SendPaymentWithMemo: 'Send payment with memo',
  SendRelayerSponsoredPayment: 'Send relayer sponsored payment',
  SendTokensAcrossZones: 'Send tokens across zones',
  SendTokensWithinZone: 'Send tokens within zone',
  SetFeeToken: 'Set fee token',
  SetSupplyCap: 'Set supply cap',
  SignInWithTempo: 'Connect Tempo Wallet',
  SwapAcrossZones: 'Swap across zones',
  VirtualAddressesFastDemo: 'Virtual addresses fast demo',
  VirtualAddressesLiveDemo: 'Virtual addresses live demo',
  WithdrawFromZone: 'Withdraw from zone',
}

/**
 * Replaces visual MDX components with useful plain Markdown in Vocs' generated `.md` files and
 * `llms-full.txt`. The rendered website keeps the original interactive components.
 */
export function plainMarkdownComponents(options: MarkdownOptions = {}) {
  const getSnippet = snippetSourceGetter()
  return async (tree: MarkdownNode) => {
    const openApi = containsOpenApi(tree)
      ? await (options.loadOpenApi ?? loadMarkdownOpenApi)()
      : undefined
    // Keep specification metadata inside its page when full exports split at H1s.
    // The rendered website retains the authored badge above the title.
    const children = tree.children ?? []
    const heading = children.findIndex((node) => node.type === 'heading' && node.depth === 1)
    const metadata = children.findIndex(
      (node) =>
        node.name === 'div' &&
        stringAttribute(node, 'className')?.split(/\s+/).includes('docs-specification-meta'),
    )
    if (metadata >= 0 && metadata < heading) {
      const [badge] = children.splice(metadata, 1)
      children.splice(heading, 0, badge)
    }
    rewriteChildren(tree, 1, { getSnippet, openApi })
  }
}

function containsOpenApi(node: MarkdownNode): boolean {
  return (
    node.name === 'OpenApi.Endpoints' ||
    node.name === 'OpenApi.Playground' ||
    (node.children ?? []).some(containsOpenApi)
  )
}

function loadMarkdownOpenApi() {
  const source = process.env.OPENAPI_SPEC_URL ?? openApiSpecUrl
  let spec = openApiSpecs.get(source)
  if (!spec) {
    // Use the same parser, normalized schema, routes, and samples as the web reference.
    spec = parse({ path: '/docs/api', spec: () => loadTempoOpenApi(source) })
    openApiSpecs.set(source, spec)
  }
  return spec
}

function rewriteChildren(
  parent: MarkdownNode,
  initialHeadingDepth: number,
  context: MarkdownContext,
) {
  if (!parent.children) return

  let headingDepth = initialHeadingDepth
  for (let index = 0; index < parent.children.length; ) {
    const replacement = rewriteNode(parent.children[index], headingDepth, context)
    parent.children.splice(index, 1, ...replacement)

    for (const node of replacement)
      if (node.type === 'heading' && node.depth) headingDepth = node.depth

    index += replacement.length
  }
}

function rewriteNode(
  node: MarkdownNode,
  headingDepth: number,
  context: MarkdownContext,
): MarkdownNode[] {
  if (node.type === 'mdxjsEsm') return []
  if (node.type === 'html' && node.value?.trim() === '<!-- changelog unavailable -->')
    return [
      paragraph([
        text('Release notes could not be loaded. '),
        link('View Tempo releases on GitHub.', tempoReleasesUrl),
      ]),
    ]

  if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') {
    if (node.type === 'code' && node.value)
      node.value = inlineCodeSnippets(node.value, context.getSnippet)
    rewriteChildren(node, headingDepth, context)
    return [node]
  }

  if (node.name && presentationOnlyElements.has(node.name)) return []
  if (node.name === 'Cards') return renderCards(node, headingDepth, context)
  if (node.name === 'DocsSetupCards' || node.name === 'DocsLinkCards') {
    const collection =
      node.name === 'DocsSetupCards' ? 'setup' : requiredStringAttribute(node, 'collection')
    if (!(collection in docsLinkCards))
      throw new Error(`Unknown link card collection: ${collection}`)
    return docsLinkCards[collection as keyof typeof docsLinkCards].flatMap(
      ({ title, description, links }) => [
        { type: 'heading', depth: Math.min(headingDepth + 1, 6), children: [text(title)] },
        paragraph([text(description)]),
        ...links.map(([label, href]) => paragraph([link(label, href)])),
      ],
    )
  }
  if (node.name === 'DocsHomeAgent')
    return [
      { type: 'heading', depth: 2, children: [text('Build with your agent')] },
      paragraph([text('Connect your coding agent to Tempo documentation.')]),
      paragraph([text('Choose your coding agent and run its setup commands in your terminal.')]),
      { type: 'heading', depth: 3, children: [text('Codex')] },
      paragraph([
        text('Requires the '),
        link('Codex CLI', 'https://learn.chatgpt.com/docs/codex/cli'),
        text('.'),
      ]),
      { type: 'code', lang: 'bash', value: tempoAgentSetupCommands.codex },
      { type: 'heading', depth: 3, children: [text('Claude Code')] },
      paragraph([
        text('Requires '),
        link('Claude Code', 'https://code.claude.com/docs/en/quickstart'),
        text('.'),
      ]),
      { type: 'code', lang: 'bash', value: tempoAgentSetupCommands.claude },
      { type: 'heading', depth: 3, children: [text('Amp')] },
      paragraph([
        text('Connect Tempo’s MCP server with the '),
        link('Amp CLI', 'https://ampcode.com/docs/cli#install'),
        text('.'),
      ]),
      { type: 'code', lang: 'bash', value: tempoAgentSetupCommands.amp },
      { type: 'heading', depth: 3, children: [text('Skills')] },
      paragraph([text('Add the Tempo docs skill to a skills-compatible agent.')]),
      { type: 'code', lang: 'bash', value: tempoAgentSetupCommands.skills },
      { type: 'heading', depth: 3, children: [text('MCP')] },
      paragraph([text('Add this URL as an HTTP MCP server in your agent’s settings.')]),
      { type: 'code', lang: 'text', value: tempoAgentSetupCommands.mcp },
      paragraph([link('All setup options', '/docs/guide/using-tempo-with-ai')]),
    ]
  if (node.name === 'Card') return [paragraph(cardContent(node))]
  if (node.name === 'Tabs') return renderTabs(node, headingDepth, context)
  if (node.name === 'Tab') return renderTab(node, headingDepth, context)
  if (node.name === 'Demo.Container') return renderDemo(node)
  if (node.name === 'MermaidDiagram' || node.name === 'StaticMermaidDiagram')
    return renderMermaid(node)
  if (node.name === 'ZoneDiagram') {
    const alt = requiredStringAttribute(node, 'alt')
    const caption = optionalStaticStringAttribute(node, 'caption')
    return [paragraph([text(alt)]), ...(caption ? [paragraph([text(caption)])] : [])]
  }
  if (node.name === 'DocsProductOverview') {
    const alt = requiredStringAttribute(node, 'alt')
    rewriteChildren(node, headingDepth, context)
    return [...(node.children ?? []), paragraph([text(alt)])]
  }
  if (node.name === 'Badge') return renderBadge(node)
  if (node.name === 'Callout') return renderCallout(node, headingDepth, context)
  if (
    node.name === 'DocsLinkButton' ||
    node.name === 'ChevronLink' ||
    node.name === 'HomeGuideButton'
  )
    return renderLinkButton(node)
  if (node.name === 'OpenApi.Endpoints' || node.name === 'OpenApi.Playground')
    return renderOpenApi(node, headingDepth, context.openApi)
  if (node.name && interactiveDescriptions[node.name])
    return markdownNodes(interactiveDescriptions[node.name])

  if (node.name && /^[a-z]/.test(node.name)) {
    if (stringAttribute(node, 'aria-hidden') === 'true') return []
    node.attributes = node.attributes?.filter(
      (attribute) => attribute.name !== 'className' && attribute.name !== 'style',
    )
    if (node.name === 'a' && stringAttribute(node, 'href') !== undefined)
      return renderHtmlLink(node, headingDepth, context)
    if (node.name === 'strong' || node.name === 'em' || node.name === 'p') {
      rewriteChildren(node, headingDepth, context)
      const type = node.name === 'p' ? 'paragraph' : node.name === 'em' ? 'emphasis' : 'strong'
      return [{ type, children: node.children ?? [] }]
    }
  }

  if (isLayoutElement(node)) {
    const id = optionalStaticStringAttribute(node, 'id')
    rewriteChildren(node, headingDepth, context)
    const anchor: MarkdownNode[] = id
      ? [
          {
            type: node.type,
            name: 'span',
            attributes: [{ type: 'mdxJsxAttribute', name: 'id', value: id }],
            children: [],
          },
        ]
      : []
    return [...anchor, ...(node.children ?? [])]
  }

  rewriteChildren(node, headingDepth, context)
  return [node]
}

function renderCards(
  node: MarkdownNode,
  headingDepth: number,
  context: MarkdownContext,
): MarkdownNode[] {
  const output: MarkdownNode[] = []
  let items: MarkdownNode[] = []

  const flushCards = () => {
    if (items.length === 0) return
    output.push({
      type: 'list',
      ordered: false,
      spread: false,
      children: items,
    })
    items = []
  }

  for (const child of node.children ?? []) {
    if (child.name === 'Card') {
      items.push({
        type: 'listItem',
        spread: false,
        children: [paragraph(cardContent(child))],
      })
      continue
    }

    flushCards()
    output.push(...rewriteNode(child, headingDepth, context))
  }
  flushCards()
  return output
}

function cardContent(node: MarkdownNode): MarkdownNode[] {
  const title = requiredStringAttribute(node, 'title')
  const description = optionalStaticStringAttribute(node, 'description')
  const destination = requiredStringAttribute(node, 'to')
  const label = link(title, destination)
  return description ? [label, text(` — ${description}`)] : [label]
}

function renderTabs(
  node: MarkdownNode,
  headingDepth: number,
  context: MarkdownContext,
): MarkdownNode[] {
  const output: MarkdownNode[] = []
  for (const child of node.children ?? []) {
    if (child.name === 'Tab') output.push(...renderTab(child, headingDepth, context))
    else output.push(...rewriteNode(child, headingDepth, context))
  }
  return output
}

function renderTab(
  node: MarkdownNode,
  headingDepth: number,
  context: MarkdownContext,
): MarkdownNode[] {
  const depth = Math.min(Math.max(headingDepth + 1, 2), 6)
  const content: MarkdownNode = { type: 'root', children: [...(node.children ?? [])] }
  rewriteChildren(content, depth, context)
  return [heading(depth, requiredStringAttribute(node, 'title')), ...(content.children ?? [])]
}

function renderDemo(node: MarkdownNode): MarkdownNode[] {
  const name = requiredStringAttribute(node, 'name')
  const source = stringAttribute(node, 'src')
  if (stringAttribute(node, 'footerVariant') === 'source' && !source)
    throw new TypeError('Demo.Container requires a static src attribute for Markdown output.')

  const steps = (node.children ?? []).map((child) => {
    if (!isComponent(child) || (child.children?.length ?? 0) > 0)
      throw new TypeError(
        'Demo.Container children must be self-closing components for Markdown output.',
      )
    const label = demoStepLabels[child.name ?? '']
    if (!label)
      throw new TypeError(
        `Demo.Container does not support ${child.name ?? 'this component'} in Markdown output.`,
      )
    return label
  })

  const output: MarkdownNode[] = [
    paragraph([strong(`Interactive demo: ${name}`)]),
    ...(steps.length > 0
      ? [
          {
            type: 'list',
            ordered: true,
            spread: false,
            children: steps.map((step) => ({
              type: 'listItem',
              spread: false,
              children: [paragraph([text(step)])],
            })),
          } satisfies MarkdownNode,
        ]
      : []),
  ]

  if (source) {
    const url = URL.canParse(source) ? source : `https://github.com/${source.replace(/^\/+/, '')}`
    output.push(paragraph([text('Source: '), link(source, url)]))
  }

  return output
}

function renderMermaid(node: MarkdownNode): MarkdownNode[] {
  const chart = expressionString(node, 'chart')
  if (!chart)
    throw new TypeError(`${node.name} requires a static chart attribute for Markdown output.`)
  return [{ type: 'code', lang: 'mermaid', value: chart.trim() }]
}

function renderBadge(node: MarkdownNode): MarkdownNode[] {
  if (!node.children?.length)
    throw new TypeError('Badge requires text content for Markdown output.')
  const content = node.children
  const badge = { type: 'strong', children: content } satisfies MarkdownNode
  return node.type === 'mdxJsxTextElement' ? [badge] : [paragraph([badge])]
}

function renderCallout(
  node: MarkdownNode,
  headingDepth: number,
  context: MarkdownContext,
): MarkdownNode[] {
  const content: MarkdownNode = { type: 'root', children: [...(node.children ?? [])] }
  rewriteChildren(content, headingDepth, context)
  return [
    {
      type: 'blockquote',
      children: [paragraph([strong('Note')]), ...(content.children ?? [])],
    },
  ]
}

function renderLinkButton(node: MarkdownNode): MarkdownNode[] {
  const destination = requiredStringAttribute(node, 'href')
  const label = plainText(node.children ?? [])
  if (!label) throw new TypeError(`${node.name} requires text content for Markdown output.`)
  const content = link(label, destination)
  return node.type === 'mdxJsxTextElement' ? [content] : [paragraph([content])]
}

function renderOpenApi(
  node: MarkdownNode,
  headingDepth: number,
  ir: Ir | undefined,
): MarkdownNode[] {
  if (!ir) throw new TypeError('OpenAPI data is required for Markdown output.')
  const mount = ir.path.replace(/\/$/, '')
  if (node.name === 'OpenApi.Playground') {
    const operationId = requiredStringAttribute(node, 'operationId')
    const spec = optionalStaticStringAttribute(node, 'spec')
    if (spec && spec !== ir.path)
      throw new TypeError(`Unknown OpenAPI spec for Markdown output: ${spec}`)
    const id = slug(operationId)
    const group = ir.groups.find((group) =>
      group.operations.some((operation) => operation.id === operationId || operation.id === id),
    )
    const operation = group?.operations.find(
      (operation) => operation.id === operationId || operation.id === id,
    )
    if (!group || !operation)
      throw new TypeError(`Unknown OpenAPI operation for Markdown output: ${operationId}`)
    const href = `${mount}/${groupPath(group)}#${operation.id}`
    const query = optionalStaticStringAttribute(node, 'query')
    const { sampleOperation, authentication } = apiAuthentication(
      initialRequest(operationWithQuery(operation, query), query),
      ir,
    )
    const samples = codeSamples(sampleOperation, ir.servers[0]?.url, {
      hideQueryParams: booleanAttribute(node, 'hideQueryParams'),
    })
    return [
      paragraph([inlineCode(`${operation.method} ${operation.path}`)]),
      ...(operation.summary ? [paragraph([text(operation.summary)])] : []),
      ...(operation.deprecated ? [paragraph([strong('Deprecated')])] : []),
      paragraph([
        link('API reference', href),
        text(
          ' — request parameters, authentication, and response schema. The examples below use editable sample values.',
        ),
      ]),
      ...authentication,
      ...samples.flatMap((sample): MarkdownNode[] => [
        paragraph([strong(sample.label)]),
        { type: 'code', lang: sample.lang, value: sample.code },
      ]),
    ]
  }

  const mountPath = requiredStringAttribute(node, 'path')
  if (mountPath.replace(/\/$/, '') !== mount)
    throw new TypeError(`Unknown OpenAPI path for Markdown output: ${mountPath}`)
  const resource = optionalStaticStringAttribute(node, 'resource')
  const groups = resource
    ? ir.groups.filter(
        (group) => group.id === resource || group.name.toLowerCase() === resource.toLowerCase(),
      )
    : ir.groups
  if (groups.length === 0)
    throw new TypeError(`Unknown OpenAPI resource for Markdown output: ${resource}`)
  return groups.flatMap((group): MarkdownNode[] => [
    heading(Math.min(headingDepth + 1, 6), group.name),
    {
      type: 'list',
      ordered: false,
      spread: false,
      children: group.operations.map((operation) => ({
        type: 'listItem',
        spread: false,
        children: [
          paragraph([
            {
              type: 'link',
              url: `${mount}/${groupPath(group)}#${operation.id}`,
              children: [inlineCode(`${operation.method} ${operation.path}`)],
            },
            ...(operation.summary ? [text(` — ${operation.summary}`)] : []),
          ]),
        ],
      })),
    },
  ])
}

function initialRequest(operation: IrOperation, query?: string): IrOperation {
  // Initial examples should not combine cursors/pages, historical ranges, or unrelated filters.
  // Keep required inputs and network selectors; the reference documents the optional controls.
  const networkSelectors = new Set(['chainId', 'sourceChain', 'destinationChain'])
  const presets = new URLSearchParams(query)
  return {
    ...operation,
    parameters: operation.parameters.filter(
      (parameter) =>
        parameter.in !== 'query' ||
        parameter.required ||
        networkSelectors.has(parameter.name) ||
        presets.has(parameter.name),
    ),
  }
}

function apiAuthentication(operation: IrOperation, ir: Ir) {
  const required =
    operation.security?.length &&
    !operation.security.some((requirement) => Object.keys(requirement).length === 0)
  if (!required) return { sampleOperation: operation, authentication: [] }

  // The web sample generator handles parameter headers, but not OpenAPI security schemes.
  // Add the canonical API-key header when it is a complete authentication alternative.
  const key = operation.security?.flatMap((requirement) => {
    if (Object.keys(requirement).length !== 1) return []
    const scheme = ir.securitySchemes[Object.keys(requirement)[0]]
    return scheme?.type === 'apiKey' && scheme.in === 'header' && scheme.name === 'tempo-api-key'
      ? [scheme]
      : []
  })[0]
  if (!key)
    return {
      sampleOperation: operation,
      authentication: [
        paragraph([
          text(
            'Authentication is required. Add the credentials described in the API reference before running this request.',
          ),
        ]),
      ],
    }
  return {
    sampleOperation: {
      ...operation,
      parameters: [
        ...operation.parameters.filter(
          (parameter) => parameter.in !== 'header' || parameter.name !== key.name,
        ),
        {
          name: String(key.name),
          in: 'header' as const,
          required: true,
          schema: { type: 'string', example: 'YOUR_API_KEY' },
        },
      ],
    },
    authentication: [
      paragraph([
        text('Requires a '),
        link('Tempo API key', '/docs/api/console/api-keys'),
        text('. Replace '),
        inlineCode('YOUR_API_KEY'),
        text(' before running this request.'),
      ]),
    ],
  }
}

function booleanAttribute(node: MarkdownNode, name: string) {
  const attribute = node.attributes?.find((attribute) => attribute.name === name)
  if (!attribute) return false
  if (attribute.value === null) return true
  if (typeof attribute.value === 'object' && attribute.value?.value === 'true') return true
  if (typeof attribute.value === 'object' && attribute.value?.value === 'false') return false
  throw new TypeError(
    `${node.name} requires a static boolean ${name} attribute for Markdown output.`,
  )
}

function markdownNodes(source: string): MarkdownNode[] {
  return markdownParser.parse(source).children as MarkdownNode[]
}

function renderHtmlLink(
  node: MarkdownNode,
  headingDepth: number,
  context: MarkdownContext,
): MarkdownNode[] {
  const href = requiredStringAttribute(node, 'href')
  rewriteChildren(node, headingDepth, context)
  const content: MarkdownNode = { type: 'link', url: href, children: node.children ?? [] }
  return node.type === 'mdxJsxTextElement' ? [content] : [paragraph([content])]
}

function stringAttribute(node: MarkdownNode, name: string) {
  const value = node.attributes?.find(
    (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === name,
  )?.value
  return typeof value === 'string' ? value : undefined
}

function optionalStaticStringAttribute(node: MarkdownNode, name: string) {
  const attribute = node.attributes?.find(
    (candidate) => candidate.type === 'mdxJsxAttribute' && candidate.name === name,
  )
  if (!attribute) return undefined
  if (typeof attribute.value !== 'string')
    throw new TypeError(
      `${node.name ?? 'Component'} requires a static ${name} attribute when provided for Markdown output.`,
    )
  return attribute.value
}

function requiredStringAttribute(node: MarkdownNode, name: string) {
  const value = stringAttribute(node, name)
  if (value === undefined)
    throw new TypeError(
      `${node.name ?? 'Component'} requires a static ${name} attribute for Markdown output.`,
    )
  return value
}

function expressionString(node: MarkdownNode, name: string) {
  const value = node.attributes?.find(
    (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === name,
  )?.value
  if (!value || typeof value === 'string' || typeof value.value !== 'string') return undefined

  const expression = value.data?.estree?.body?.[0]?.expression
  if (
    expression?.type === 'TemplateLiteral' &&
    expression.expressions?.length === 0 &&
    typeof expression.quasis?.[0]?.value?.cooked === 'string'
  )
    return expression.quasis[0].value.cooked
  if (expression?.type === 'Literal' && typeof expression.value === 'string')
    return expression.value

  const source = value.value.trim()
  if (source.startsWith('`') && source.endsWith('`') && !source.includes('${'))
    return source.slice(1, -1).replaceAll('\\`', '`')
  return undefined
}

function snippetSourceGetter() {
  const cache = new Map<string, string>()

  return (fileName: string) => {
    if (!fileName.startsWith('~')) return undefined
    const cached = cache.get(fileName)
    if (cached !== undefined) return cached

    const filePath = path.resolve(process.cwd(), 'src', fileName.replace(/^~\/?/, ''))
    try {
      const source = fs.readFileSync(filePath, 'utf8').replace(/\n$/, '')
      cache.set(fileName, source)
      return source
    } catch {
      return undefined
    }
  }
}

function inlineCodeSnippets(code: string, getSnippet: (fileName: string) => string | undefined) {
  if (!code.includes('// [!include')) return stripRegionMarkers(code)

  const lines = code.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const match = lines[index]?.match(/\/\/ \[!include (.*)\]/)
    if (!match?.[1]) continue

    const [file, ...queries] = match[1].split(' ')
    const [fileName, region] = file?.split(':') ?? []
    if (!fileName) continue

    const source = getSnippet(fileName)
    if (source === undefined) throw new TypeError(`Unable to resolve Markdown include ${fileName}.`)
    lines.splice(index, 1, findAndReplace(extractRegion(source, region), queries))
  }
  return lines.join('\n').replace(/\n$/, '')
}

function extractRegion(code: string, region: string | undefined) {
  if (!region) return stripRegionMarkers(code)

  const lines: string[] = []
  let foundEnd = false
  let foundStart = false
  let inRegion = false

  for (const line of code.split('\n')) {
    const start = line.match(/\/\/ \[!region (.*)\]/)?.[1]
    const end = line.match(/\/\/ \[!endregion (.*)\]/)?.[1]
    if (start === region) {
      foundStart = true
      inRegion = true
    } else if (end === region) {
      foundEnd = true
      inRegion = false
    } else if (inRegion && !start && !end) {
      lines.push(line)
    }
  }
  if (!foundStart || !foundEnd)
    throw new TypeError(`Unable to resolve Markdown include region ${region}.`)
  return lines.join('\n')
}

function findAndReplace(code: string, queries: string[]) {
  let result = code
  for (const query of queries) {
    const match = query.match(/^\/(.*)([^\\])\/(.*)\/$/)
    if (!match) continue
    const find = `${match[1] ?? ''}${match[2] ?? ''}`.replace('\\/', '/')
    const replacement = (match[3] ?? '').replace('\\/', '/')
    result = result.replaceAll(find, replacement)
  }
  return result
}

function stripRegionMarkers(code: string) {
  return code
    .replaceAll(/\/\/ \[!region (.*)\]\n/g, '')
    .replaceAll(/\/\/ \[!endregion (.*)\](\n|$)/g, '')
    .replace(/\n$/, '')
}

function isComponent(node: MarkdownNode) {
  return (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    !!node.name &&
    /^[A-Z]/.test(node.name)
  )
}

function isLayoutElement(node: MarkdownNode) {
  if (node.name !== 'div' && node.name !== 'span') return false
  return (node.attributes ?? []).every(
    (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'id',
  )
}

function plainText(nodes: MarkdownNode[]): string {
  return nodes
    .map((node) => node.value ?? plainText(node.children ?? []))
    .join('')
    .trim()
}

function text(value: string): MarkdownNode {
  return { type: 'text', value }
}

function inlineCode(value: string): MarkdownNode {
  return { type: 'inlineCode', value }
}

function strong(value: string): MarkdownNode
function strong(value: MarkdownNode[]): MarkdownNode
function strong(value: MarkdownNode[] | string): MarkdownNode {
  return { type: 'strong', children: typeof value === 'string' ? [text(value)] : value }
}

function link(label: string, url: string): MarkdownNode {
  return { type: 'link', url, title: null, children: [text(label)] }
}

function paragraph(children: MarkdownNode[]): MarkdownNode {
  return { type: 'paragraph', children }
}

function heading(depth: number, value: string): MarkdownNode {
  return { type: 'heading', depth, children: [text(value)] }
}

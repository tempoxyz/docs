import fs from 'node:fs'
import path from 'node:path'

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

const openApiSpecUrl = 'https://api.tempo.xyz/openapi.json'
const presentationOnlyElements = new Set(['meta', 'script', 'style', 'title'])
const tempoReleasesUrl = 'https://github.com/tempoxyz/tempo/releases'

const interactiveDescriptions: Record<string, string> = {
  ConnectWallet: 'Connect a wallet in the interactive web page.',
  T7BenchmarkVisual: 'The benchmark values are listed in the table below.',
  TempoMcpExplorer: 'Use the interactive web page to try the Tempo MCP server.',
  TerminalDemo:
    'The interactive terminal creates a test wallet, funds it, and makes a paid request.',
  TidxQuery: 'Use the interactive web page to run SQL against the public Tempo indexer.',
  TokenListDemo: 'The interactive web page displays the current Tempo token list.',
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
  SendParallelPayments: 'Send parallel payments',
  SendPayment: 'Send payment',
  SendPaymentWithMemo: 'Send payment with memo',
  SendRelayerSponsoredPayment: 'Send relayer sponsored payment',
  SendTokensAcrossZones: 'Send tokens across zones',
  SendTokensWithinZone: 'Send tokens within zone',
  SetFeeToken: 'Set fee token',
  SetSupplyCap: 'Set supply cap',
  SignInWithTempo: 'Sign in with tempo',
  SwapAcrossZones: 'Swap across zones',
  VirtualAddressesFastDemo: 'Virtual addresses fast demo',
  VirtualAddressesLiveDemo: 'Virtual addresses live demo',
  WithdrawFromZone: 'Withdraw from zone',
}

/**
 * Replaces visual MDX components with useful plain Markdown in Vocs' generated `.md` files and
 * `llms-full.txt`. The rendered website keeps the original interactive components.
 */
export function plainMarkdownComponents() {
  const getSnippet = snippetSourceGetter()
  return (tree: MarkdownNode) => {
    rewriteChildren(tree, 1, getSnippet)
  }
}

function rewriteChildren(
  parent: MarkdownNode,
  initialHeadingDepth: number,
  getSnippet: (fileName: string) => string | undefined,
) {
  if (!parent.children) return

  let headingDepth = initialHeadingDepth
  for (let index = 0; index < parent.children.length; ) {
    const replacement = rewriteNode(parent.children[index], headingDepth, getSnippet)
    parent.children.splice(index, 1, ...replacement)

    for (const node of replacement)
      if (node.type === 'heading' && node.depth) headingDepth = node.depth

    index += replacement.length
  }
}

function rewriteNode(
  node: MarkdownNode,
  headingDepth: number,
  getSnippet: (fileName: string) => string | undefined,
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
    if (node.type === 'code' && node.value) node.value = inlineCodeSnippets(node.value, getSnippet)
    rewriteChildren(node, headingDepth, getSnippet)
    return [node]
  }

  if (node.name && presentationOnlyElements.has(node.name)) return []
  if (node.name === 'Cards') return renderCards(node, headingDepth, getSnippet)
  if (node.name === 'Card') return [paragraph(cardContent(node))]
  if (node.name === 'Tabs') return renderTabs(node, headingDepth, getSnippet)
  if (node.name === 'Tab') return renderTab(node, headingDepth, getSnippet)
  if (node.name === 'Demo.Container') return renderDemo(node)
  if (node.name === 'MermaidDiagram' || node.name === 'StaticMermaidDiagram')
    return renderMermaid(node)
  if (node.name === 'Badge') return renderBadge(node)
  if (node.name === 'Callout') return renderCallout(node, headingDepth, getSnippet)
  if (node.name === 'DocsLinkButton') return renderLinkButton(node)
  if (node.name === 'OpenApi.Endpoints' || node.name === 'OpenApi.Playground')
    return renderOpenApi(node)
  if (node.name && interactiveDescriptions[node.name])
    return [paragraph([text(interactiveDescriptions[node.name])])]

  if (isLayoutElement(node)) {
    rewriteChildren(node, headingDepth, getSnippet)
    return node.children ?? []
  }

  rewriteChildren(node, headingDepth, getSnippet)
  return [node]
}

function renderCards(
  node: MarkdownNode,
  headingDepth: number,
  getSnippet: (fileName: string) => string | undefined,
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
    output.push(...rewriteNode(child, headingDepth, getSnippet))
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
  getSnippet: (fileName: string) => string | undefined,
): MarkdownNode[] {
  const output: MarkdownNode[] = []
  for (const child of node.children ?? []) {
    if (child.name === 'Tab') output.push(...renderTab(child, headingDepth, getSnippet))
    else output.push(...rewriteNode(child, headingDepth, getSnippet))
  }
  return output
}

function renderTab(
  node: MarkdownNode,
  headingDepth: number,
  getSnippet: (fileName: string) => string | undefined,
): MarkdownNode[] {
  const depth = Math.min(Math.max(headingDepth + 1, 2), 6)
  const content: MarkdownNode = { type: 'root', children: [...(node.children ?? [])] }
  rewriteChildren(content, depth, getSnippet)
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
  getSnippet: (fileName: string) => string | undefined,
): MarkdownNode[] {
  const content: MarkdownNode = { type: 'root', children: [...(node.children ?? [])] }
  rewriteChildren(content, headingDepth, getSnippet)
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
  if (!label) throw new TypeError('DocsLinkButton requires text content for Markdown output.')
  const content = link(label, destination)
  return node.type === 'mdxJsxTextElement' ? [content] : [paragraph([content])]
}

function renderOpenApi(node: MarkdownNode): MarkdownNode[] {
  if (node.name === 'OpenApi.Playground') {
    const operation = requiredStringAttribute(node, 'operationId')
    return [
      paragraph([
        text('Interactive API example for '),
        inlineCode(operation),
        text('. See the '),
        link('Tempo OpenAPI specification', openApiSpecUrl),
        text(' for the request and response schema.'),
      ]),
    ]
  }

  requiredStringAttribute(node, 'path')
  const resource = optionalStaticStringAttribute(node, 'resource')
  return [
    paragraph([
      text(resource === 'rpc' ? 'Tempo JSON-RPC endpoints' : 'Tempo REST API endpoints'),
      text(' are defined in the '),
      link('Tempo OpenAPI specification', openApiSpecUrl),
      text('.'),
    ]),
  ]
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
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' &&
      (attribute.name === 'className' || attribute.name === 'style'),
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

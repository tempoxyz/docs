import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { describe, expect, test, vi } from 'vitest'
import type { Ir } from '../../node_modules/vocs/dist/internal/openapi/parser.js'
import { docsLinkCards } from './docs-link-cards'
import { plainMarkdownComponents } from './markdown-output'

describe('plainMarkdownComponents', () => {
  test('keeps the linked specification badge with its own page in full exports', async () => {
    const output = await render(`
<span id="old-title" />

<div className="docs-specification-meta">
  <a href="/docs/protocol"><Badge>Specification</Badge></a>
</div>

# Tokens

Token rules.
`)
    expect(output.indexOf('<span id="old-title"')).toBeLessThan(output.indexOf('# Tokens'))
    expect(output).toContain('# Tokens\n\n[**Specification**](/docs/protocol)')
    expect(output.indexOf('[**Specification**]')).toBeLessThan(output.indexOf('Token rules.'))
    expect(output).not.toContain('docs-specification-meta')
    expect(output).not.toContain('<Badge')
  })

  test('exports setup card descriptions and destinations for agents', async () => {
    const output = await render('## Set up your project\n\n<DocsSetupCards />')
    expect(output).toContain('### Connect to Tempo')
    expect(output).toContain('Find RPC endpoints and chain IDs')
    expect(output).toContain('[Testnet faucet](/docs/quickstart/faucet)')
    expect(output).toContain('[SDKs and CLI](/docs/tools)')
    expect(output).toContain('[API keys](/docs/api/console/api-keys)')
    expect(output).toContain('[Build with AI](/docs/guide/using-tempo-with-ai)')
    expect(output).not.toContain('<DocsSetupCards')
  })

  test.each(
    Object.keys(docsLinkCards),
  )('exports every destination in the %s card collection', async (collection) => {
    const output = await render(`<DocsLinkCards collection="${collection}" />`)
    for (const card of docsLinkCards[collection as keyof typeof docsLinkCards]) {
      expect(output).toContain(card.title)
      for (const [label, href] of card.links) expect(output).toContain(`[${label}](${href})`)
    }
    expect(output).not.toContain('<DocsLinkCards')
  })

  test('explains the account demo without claiming a funding or payment action', async () => {
    const output = await render('<PasskeyAccountDemo />')
    expect(output).toContain('create a passkey account or reconnect an existing passkey')
    expect(output).toContain('does not move or fund stablecoins')
    expect(output).not.toContain('<PasskeyAccountDemo')
  })

  test('preserves overview headings, links, illustration meaning, and following content', async () => {
    const output = await render(`
<DocsProductOverview image="accounts" alt="A connected account receives stablecoins and sends a payment.">

# Accounts

Connect users to Tempo Wallet.

[Connect an account](/docs/accounts/integrate) to send a test payment.

</DocsProductOverview>

## Reconcile payments

Read the account's transfer history.
`)

    expect(output).toContain('# Accounts\n\nConnect users to Tempo Wallet.')
    expect(output).toContain('Connect users to Tempo Wallet.')
    expect(output).toContain('[Connect an account](/docs/accounts/integrate)')
    expect(output).toContain('A connected account receives stablecoins and sends a payment.')
    expect(output).toContain("## Reconcile payments\n\nRead the account's transfer history.")
    expect(output).not.toContain('DocsProductOverview')
    expect(output.match(/^# Accounts$/gm)).toHaveLength(1)
    expect(
      output.match(/A connected account receives stablecoins and sends a payment\./g),
    ).toHaveLength(1)
  })

  test('keeps agent setup usable without the interactive homepage', async () => {
    const output = await render('<DocsHomeAgent />')
    expect(output).toContain('codex plugin add docs@tempo')
    expect(output).toContain('claude plugin install docs@tempo')
    expect(output).toContain('amp mcp add tempo https://mcp.tempo.xyz')
    expect(output).toContain('npx skills add tempoxyz/plugins --skill docs')
    expect(output).toContain('[All setup options](/docs/guide/using-tempo-with-ai)')
    expect(output).not.toContain('test payment')
    expect(output).not.toContain('paste this prompt')
    expect(output).not.toContain('<DocsHomeAgent')
  })

  test('renders cards and tabs as ordinary Markdown', async () => {
    const output = await render(`
## Recipes

<Cards>
  <Card title="Send a payment" description="Transfer a stablecoin." to="/docs/payments" />
</Cards>

<Tabs stateKey="library">
  <Tab title="Viem">
    Use the TypeScript client.
    <div className="h-4" />
  </Tab>
  <Tab title="Rust">
    Use the Rust SDK.
  </Tab>
</Tabs>
`)

    expect(output).toMatch(/[*-] \[Send a payment]\(\/docs\/payments\) — Transfer a stablecoin\./)
    expect(output).toContain('### Viem')
    expect(output).toContain('Use the TypeScript client.')
    expect(output).toContain('### Rust')
    expect(output).not.toMatch(/<\/?(?:Card|Cards|Tab|Tabs|div)\b/)
  })

  test('renders a custom demo as a title, steps, and source link', async () => {
    const output = await render(`
<Demo.Container
  name="Send a Payment"
  footerVariant="source"
  src="tempoxyz/examples/tree/main/examples/payments"
>
  <Connect stepNumber={1} />
  <AddFunds stepNumber={2} />
  <SendPayment stepNumber={3} last />
</Demo.Container>
`)

    expect(output).toContain('**Interactive demo: Send a Payment**')
    expect(output).toContain('1. Connect')
    expect(output).toContain('2. Add funds')
    expect(output).toContain('3. Send payment')
    expect(output).toContain(
      '[tempoxyz/examples/tree/main/examples/payments](https://github.com/tempoxyz/examples/tree/main/examples/payments)',
    )
    expect(output).not.toMatch(/<\/?[A-Z]/)
  })

  test('describes the admin key demo and preserves the following instructions', async () => {
    const output = await render(`
<AdminKeyDemo />

## Revoke an admin key

Use your root key to revoke the admin key.
`)

    expect(output).toContain('create or connect a testnet passkey account')
    expect(output).toContain('authorize an admin key, inspect its onchain status, and revoke it')
    expect(output).toContain('## Revoke an admin key')
    expect(output).toContain('Use your root key to revoke the admin key.')
    expect(output).not.toContain('<AdminKeyDemo')
  })

  test('describes the testnet Earn deposit flow for agent readers', async () => {
    const output = await render('<EarnDepositDemo />')
    expect(output).toContain('create a testnet passkey account')
    expect(output).toContain('choose a deposit amount (1 pathUSD by default)')
    expect(output).toContain('withdraw the test position')
    expect(output).not.toContain('<EarnDepositDemo')
  })

  test('describes restoring the deposit account for a test withdrawal', async () => {
    const output = await render('<EarnWithdrawDemo />')
    expect(output).toContain('restore the passkey test account from the deposit demo')
    expect(output).toContain('redeem its full position')
    expect(output).not.toContain('<EarnWithdrawDemo')
  })

  test('keeps diagram, callout, badge, and button meaning', async () => {
    const output = await render(`
<MermaidDiagram chart={\`sequenceDiagram
  Client->>Server: Request
\`} />

<Callout type="info">
  All RPC nodes are trustless.
</Callout>

Status: <Badge variant="red">Required</Badge>

<DocsLinkButton href="https://mcp.tempo.xyz">Open MCP server</DocsLinkButton>
`)

    expect(output).toContain('```mermaid')
    expect(output).toContain('Client->>Server: Request')
    expect(output).toContain('> **Note**')
    expect(output).toContain('All RPC nodes are trustless.')
    expect(output).toContain('Status: **Required**')
    expect(output).toContain('[Open MCP server](https://mcp.tempo.xyz)')
    expect(output).not.toMatch(/<\/?[A-Z]/)
  })

  test('preserves validator topology relationships in plain Markdown', async () => {
    const output = await render(`
import { ValidatorTopologyDiagram } from './ValidatorTopologyDiagram'

<ValidatorTopologyDiagram />

No validator P2P or RPC port should be directly accessible from the internet.
`)

    expect(output).toContain('R1 with V1, and R2 with V2')
    expect(output).toContain('submits a transaction to R1 over JSON-RPC')
    expect(output).toContain(
      'R1 and R2 each connect to Public Nodes and to each other over bidirectional execution P2P',
    )
    expect(output).toContain('R1 follows V1 and R2 follows V2 using --follow over WebSocket')
    expect(output).toContain('each pair also has a bidirectional execution P2P connection')
    expect(output).toContain('V1 and V2 communicate over bidirectional consensus P2P')
    expect(output).toContain('no execution P2P connection between them')
    expect(output).toContain(
      'No validator P2P or RPC port should be directly accessible from the internet.',
    )
    expect(output).not.toContain('ValidatorTopologyDiagram')
  })

  test('exports the endpoint directory with group names and canonical operation links', async () => {
    const output = await render('<OpenApi.Endpoints path="/docs/api" />')
    expect(output).toContain('## Balances')
    expect(output).toContain(
      '[`GET /v1/addresses/{address}/balances`](/docs/api/balances#getaddressbalances) — List balances',
    )
    expect(output).toContain('## JSON-RPC')
    expect(output).toContain('[`POST /rpc`](/docs/api/rpc#eth-blocknumber)')
    expect(output).toContain(
      '[`POST /v1/routes/transfers`](/docs/api/routes/transfers#createroutestransfer)',
    )
    expect(output).not.toContain('OpenApi.')
  })

  test('keeps an endpoint directory filtered to the selected resource', async () => {
    const output = await render('<OpenApi.Endpoints path="/docs/api" resource="rpc" />')
    expect(output).toContain('## JSON-RPC')
    expect(output).toContain('POST /rpc')
    expect(output).not.toContain('GET /v1/addresses')
  })

  test('exports API playground method, path, schema link, and request samples', async () => {
    const output = await render('<OpenApi.Playground operationId="getAddressBalances" />')
    expect(output).toContain('`GET /v1/addresses/{address}/balances`')
    expect(output).toContain('[API reference](/docs/api/balances#getaddressbalances)')
    expect(output).toContain('```bash')
    expect(output).toContain('curl')
    expect(output).toContain('fetch(')
    expect(output).toContain('https://api.tempo.xyz/v1/addresses/0x123/balances?chainId=testnet')
    expect(output).not.toContain('OpenApi.Playground')
  })

  test('exports an initial request without conflicting pagination or unrelated optional filters', async () => {
    const output = await render('<OpenApi.Playground operationId="getAddressBalances" />')
    expect(output).toContain('chainId=testnet')
    expect(output).not.toMatch(/[?&](?:cursor|page|limit|currency)=/)
    expect(output).not.toContain('cursor_example')
  })

  test('retains required query inputs and source/destination network selectors', async () => {
    const output = await render('<OpenApi.Playground operationId="quoteRoutesTransfer" />')
    expect(output).toContain('amount=1000000')
    expect(output).toContain('sourceChain=base')
    expect(output).toContain('destinationChain=tempo')
    expect(output).not.toContain('slippageBps=')
  })

  test('uses an embed query preset without changing subsequent reference samples', async () => {
    const output = await render(
      '<OpenApi.Playground operationId="getAddressBalances" query="chainId=42431&currency=usd" />',
    )
    expect(output).toContain('chainId=42431')
    expect(output).toContain('currency=usd')
    expect(output).not.toContain('chainId=testnet')

    const unchanged = await render('<OpenApi.Playground operationId="getAddressBalances" />')
    expect(unchanged).toContain('chainId=testnet')
    expect(unchanged).not.toContain('currency=')
  })

  test('matches hidden query parameters in the API tool', async () => {
    const output = await render(
      '<OpenApi.Playground operationId="getAddressBalances" hideQueryParams />',
    )
    expect(output).toContain('https://api.tempo.xyz/v1/addresses/0x123/balances')
    expect(output).not.toContain('chainId=')
    const visible = await render(
      '<OpenApi.Playground operationId="getAddressBalances" hideQueryParams={false} />',
    )
    expect(visible).toContain('chainId=testnet')
  })

  test('exports write request bodies, required headers, and authentication without running a request', async () => {
    const output = await render('<OpenApi.Playground operationId="createRoutesTransfer" />')
    expect(output).toContain('`POST /v1/routes/transfers`')
    expect(output).toContain('tempo-api-key: YOUR_API_KEY')
    expect(output).toContain('idempotency-key: transfer_example')
    expect(output).toContain('[Tempo API key](/docs/api/console/api-keys)')
    expect(output).toContain('quoteId')
    expect(output).toContain('quote_example')
    expect(output).toContain('[API reference](/docs/api/routes/transfers#createroutestransfer)')
  })

  test.each([
    ['<OpenApi.Playground operationId="missing" />', 'Unknown OpenAPI operation'],
    ['<OpenApi.Endpoints path="/docs/api" resource="missing" />', 'Unknown OpenAPI resource'],
    ['<OpenApi.Endpoints path="/other-api" />', 'Unknown OpenAPI path'],
    [
      '<OpenApi.Playground operationId="getAddressBalances" spec="/other-api" />',
      'Unknown OpenAPI spec',
    ],
    [
      '<OpenApi.Playground operationId="getAddressBalances" hideQueryParams={dynamic} />',
      'static boolean',
    ],
    [
      '<OpenApi.Playground operationId="getAddressBalances" query={dynamic} />',
      'static query attribute',
    ],
  ])('fails instead of silently losing API content: %s', async (source, message) => {
    await expect(render(source)).rejects.toThrow(message)
  })

  test('does not load API data for an ordinary guide', async () => {
    const loadOpenApi = vi.fn()
    await unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(plainMarkdownComponents, { loadOpenApi })
      .use(remarkStringify)
      .process('# Guide\n\n[Read more](/docs/accounts)')
    expect(loadOpenApi).not.toHaveBeenCalled()
  })

  test('keeps links inside interactive demo descriptions clickable', async () => {
    const output = await render('<EarnVaultDemo />\n\n<TempoMcpExplorer />')
    expect(output).toContain('[verified vault API reference](/docs/api/earn#getverifiedearnvaults)')
    expect(output).not.toContain('\\[verified vault API reference')
    expect(output).toContain('Use the interactive web page to try the Tempo MCP server.')
  })

  test('preserves Tempo EVM card anchors while removing their visual wrappers', async () => {
    const output = await render(`
<Cards>
  <div id="payment-lanes" style={{ display: 'grid' }}>
    <Card title="Payment lanes" description="Reserved payment capacity." to="/docs/protocol/blockspace/payment-lane-specification" />
  </div>
</Cards>
`)
    expect(output).toContain('<span id="payment-lanes" />')
    expect(output).toContain(
      '[Payment lanes](/docs/protocol/blockspace/payment-lane-specification) — Reserved payment capacity.',
    )
    expect(output).not.toContain('style=')
    expect(output).not.toContain('<div')
  })

  test('exports homepage guides and chevron links as readable links and descriptions', async () => {
    const output = await render(`
<div className="tempo-docs-home-guide">

Send stablecoins with a test wallet.

<HomeGuideButton href="/get-started/quickstart">Send your first payment</HomeGuideButton>

</div>

<p className="tempo-docs-home-guides-more"><ChevronLink href="/get-started">Find your starting point</ChevronLink></p>

- <HomeColorLink href="/docs/sdk/typescript">TypeScript</HomeColorLink>
`)
    expect(output).toContain('Send stablecoins with a test wallet.')
    expect(output).toContain('[Send your first payment](/get-started/quickstart)')
    expect(output).toContain('[Find your starting point](/get-started)')
    expect(output).toContain('[TypeScript](/docs/sdk/typescript)')
    expect(output).not.toMatch(/<(?:a|p|div|HomeGuideButton|HomeColorLink|ChevronLink)\b/)
  })

  test('preserves anchor-only links used by legacy Zone guides', async () => {
    const output = await render('<a id="depositing-pathusd-to-zone-a" />\n\n## Deposit')
    expect(output).toContain('<a id="depositing-pathusd-to-zone-a" />')
    expect(output).toContain('## Deposit')
  })

  test('retains image meaning and destinations without executable presentation attributes', async () => {
    const output = await render(
      '<img src="/developers/icons/ousd.svg" alt="OUSD" style={{ display: "inline" }} className="dark:hidden" />',
    )
    expect(output).toContain('src="/developers/icons/ousd.svg"')
    expect(output).toContain('alt="OUSD"')
    expect(output).not.toContain('style=')
    expect(output).not.toContain('className=')
  })

  test('removes executable and presentation-only MDX without dropping later content', async () => {
    const output = await render(`
import { Demo } from './Demo'
export const data = [{ label: 'Example' }]

<style>{\`
  .tabs { display: flex }
\`}</style>
<script>{\`window.example = true\`}</script>
<meta name="robots" content="index" />
<title>Browser title</title>

# Agent guide

The machine-readable content remains available.

| URL | Contents |
| --- | --- |
| /llms.txt | Documentation index |
`)

    expect(output).not.toContain('import { Demo }')
    expect(output).not.toContain('export const data')
    expect(output).not.toContain('.tabs')
    expect(output).not.toMatch(/<(?:meta|script|style|title)\b/)
    expect(output).toContain('# Agent guide')
    expect(output).toContain('The machine-readable content remains available.')
    expect(output).toContain('/llms.txt')
    expect(output).toContain('Documentation index')
  })

  test('keeps MDX-like syntax inside fenced examples', async () => {
    const output = await render(`
\`\`\`mdx
import { Demo } from './Demo'
export const data = [{ label: 'Example' }]
<style>{styles}</style>
<script>{setup}</script>
<meta name="robots" content="index" />
<title>Browser title</title>
\`\`\`
`)

    expect(output).toContain("import { Demo } from './Demo'")
    expect(output).toContain("export const data = [{ label: 'Example' }]")
    expect(output).toContain('<style>{styles}</style>')
    expect(output).toContain('<script>{setup}</script>')
    expect(output).toContain('<meta name="robots" content="index" />')
    expect(output).toContain('<title>Browser title</title>')
  })

  test('turns an unavailable changelog into a visible release link', async () => {
    const output = await renderMarkdown(`
# Changelog

<!-- changelog unavailable -->
`)

    expect(output).toContain('Release notes could not be loaded.')
    expect(output).toContain(
      '[View Tempo releases on GitHub.](https://github.com/tempoxyz/tempo/releases)',
    )
    expect(output).not.toContain('<!-- changelog unavailable -->')

    const example = await renderMarkdown(`
\`\`\`md
<!-- changelog unavailable -->
\`\`\`
`)
    expect(example).toContain('<!-- changelog unavailable -->')
  })

  test('expands code includes and removes region markers', async () => {
    const output = await render(`
\`\`\`ts
// [!include ~/snippets/viem.config.ts:setup]
\`\`\`
`)

    expect(output).toContain("import { Account, createClient } from 'viem/tempo'")
    expect(output).toContain("account: Account.fromSecp256k1('0x...')")
    expect(output).toContain('export const client = createClient({')
    expect(output).not.toContain('[!include')
    expect(output).not.toContain('[!region')
  })

  test.each([
    ['Card', '<Card title="Quickstart" />', 'static to attribute'],
    ['Tab', '<Tabs><Tab>Example</Tab></Tabs>', 'static title attribute'],
    ['Demo', '<Demo.Container><Connect /></Demo.Container>', 'static name attribute'],
    ['Mermaid', '<MermaidDiagram chart={chart} />', 'static chart attribute'],
    ['link button', '<DocsLinkButton>Open docs</DocsLinkButton>', 'static href attribute'],
    ['OpenAPI playground', '<OpenApi.Playground />', 'static operationId attribute'],
    ['OpenAPI endpoints', '<OpenApi.Endpoints />', 'static path attribute'],
  ])('rejects incomplete or dynamic %s data', async (_name, source, message) => {
    await expect(render(source)).rejects.toThrow(message)
  })

  test('keeps unknown card children visible for the audit', async () => {
    const output = await render(`
<Cards>
  <Card title="Quickstart" to="/docs/quickstart" />
  <CustomCard />
</Cards>
`)

    expect(output).toContain('[Quickstart](/docs/quickstart)')
    expect(output).toContain('<CustomCard />')
  })

  test('rejects demo children whose content would be lost', async () => {
    await expect(
      render(`
<Demo.Container name="Example">
  <Connect>Important instructions</Connect>
</Demo.Container>
`),
    ).rejects.toThrow('children must be self-closing components')
  })

  test('rejects unknown demo step components', async () => {
    await expect(
      render(`
<Demo.Container name="Example">
  <Danger amount="100" />
</Demo.Container>
`),
    ).rejects.toThrow('does not support Danger')
  })

  test.each([
    [
      'Card description',
      '<Card title="Quickstart" to="/docs/quickstart" description={description} />',
      'Card requires a static description attribute when provided',
    ],
    [
      'OpenAPI resource',
      '<OpenApi.Endpoints path="/docs/api" resource={resource} />',
      'OpenApi.Endpoints requires a static resource attribute when provided',
    ],
  ])('rejects a dynamic meaningful optional %s', async (_name, source, message) => {
    await expect(render(source)).rejects.toThrow(message)
  })

  test.each([
    ['missing file', '~/snippets/does-not-exist.ts:setup', 'does-not-exist.ts'],
    ['missing region', '~/snippets/viem.config.ts:does-not-exist', 'region does-not-exist'],
  ])('rejects an include with a %s', async (_name, include, message) => {
    await expect(
      render(`
\`\`\`ts
// [!include ${include}]
\`\`\`
`),
    ).rejects.toThrow(message)
  })
})

async function render(source: string) {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(plainMarkdownComponents, { loadOpenApi: async () => fixtureOpenApi })
      .use(remarkStringify)
      .process(source),
  )
}

async function renderMarkdown(source: string) {
  return String(
    await unified()
      .use(remarkParse)
      .use(plainMarkdownComponents, { loadOpenApi: async () => fixtureOpenApi })
      .use(remarkStringify)
      .process(source),
  )
}

const fixtureOpenApi: Ir = {
  path: '/docs/api',
  client: { url: 'https://api.tempo.xyz/openapi.json' },
  info: { title: 'Tempo API' },
  servers: [{ url: 'https://api.tempo.xyz' }],
  traits: [],
  securitySchemes: { apiKey: { type: 'apiKey', in: 'header', name: 'tempo-api-key' } },
  groups: [
    {
      id: 'balances',
      name: 'Balances',
      operations: [
        {
          id: 'getaddressbalances',
          method: 'GET',
          path: '/v1/addresses/{address}/balances',
          summary: 'List balances',
          parameters: [
            {
              name: 'address',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '0x123' },
            },
            { name: 'chainId', in: 'query', schema: { type: 'string', example: 'testnet' } },
            { name: 'cursor', in: 'query', schema: { type: 'string', example: 'cursor_example' } },
            { name: 'page', in: 'query', schema: { type: 'integer', example: 2 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } },
            { name: 'currency', in: 'query', schema: { type: 'string', example: 'EUR' } },
          ],
          responses: [],
        },
      ],
    },
    {
      id: 'rpc',
      name: 'JSON-RPC',
      operations: [
        {
          id: 'eth-blocknumber',
          method: 'POST',
          path: '/rpc',
          parameters: [],
          responses: [],
        },
      ],
    },
    {
      id: 'transfers',
      name: 'Routes',
      pagePath: 'routes/transfers',
      operations: [
        {
          id: 'quoteroutestransfer',
          method: 'GET',
          path: '/v1/routes/transfers/quote',
          parameters: [
            {
              name: 'amount',
              in: 'query',
              required: true,
              schema: { type: 'string', example: '1000000' },
            },
            { name: 'sourceChain', in: 'query', schema: { type: 'string', example: 'base' } },
            { name: 'destinationChain', in: 'query', schema: { type: 'string', example: 'tempo' } },
            { name: 'slippageBps', in: 'query', schema: { type: 'integer', example: 50 } },
          ],
          responses: [],
        },
        {
          id: 'createroutestransfer',
          security: [{ apiKey: [] }],
          method: 'POST',
          path: '/v1/routes/transfers',
          parameters: [
            {
              name: 'idempotency-key',
              in: 'header',
              required: true,
              schema: { type: 'string', example: 'transfer_example' },
            },
          ],
          requestBody: {
            required: true,
            content: [{ mediaType: 'application/json', example: { quoteId: 'quote_example' } }],
          },
          responses: [],
        },
      ],
    },
  ],
}

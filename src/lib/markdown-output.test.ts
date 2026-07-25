import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'
import { plainMarkdownComponents } from './markdown-output'

describe('plainMarkdownComponents', () => {
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

  test('explains interactive and OpenAPI-only content', async () => {
    const output = await render(`
<OpenApi.Playground operationId="getAddressBalances" hideQueryParams />
<OpenApi.Endpoints path="/docs/api" resource="rpc" />
<OpenApi.Endpoints path="/docs/api" />
<TempoMcpExplorer />
`)

    expect(output).toContain('Interactive API example for `getAddressBalances`.')
    expect(output).toContain('[Tempo OpenAPI specification](https://api.tempo.xyz/openapi.json)')
    expect(output).toContain('Tempo JSON-RPC endpoints')
    expect(output).toContain('Tempo REST API endpoints')
    expect(output).toContain('Use the interactive web page to try the Tempo MCP server.')
    expect(output).not.toMatch(/<\/?[A-Z]/)
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

    expect(output).toContain("import { privateKeyToAccount } from 'viem/accounts'")
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
      .use(plainMarkdownComponents)
      .use(remarkStringify)
      .process(source),
  )
}

async function renderMarkdown(source: string) {
  return String(
    await unified()
      .use(remarkParse)
      .use(plainMarkdownComponents)
      .use(remarkStringify)
      .process(source),
  )
}

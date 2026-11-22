import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  aiDocsSections,
  markdownRoute,
  parseAiIndex,
  renderAiFull,
  renderAiIndex,
  renderAiPage,
} from './ai-docs'
import { canonicalizeGeneratedDeveloperLinks } from './canonical-developer-links'
import { renderStartBuildingMarkdown } from './start-building'

const input = `# Tempo Docs

- [Start](/get-started): Choose a task.
- [Deposit](/docs/earn/integrate): Deposit into a vault.
- [Legacy swap](/docs/guide/private-zones/swap-across-zones): Sandbox swap.
- [Earn](/docs/earn): Earn introduction.
- [Private deposits](/docs/zones/deposit): Deposit into a Zone.
- [Machine Payments](/docs/agents): Pay for APIs.
- [API reference](/docs/api/reference): REST schemas.
- [Keys](/docs/accounts/keys): Chain signing permissions.
- [Home](/index): Site home.
`

describe('AI documentation navigation', () => {
  it('uses the visible section order, keeps all pages, and separates the old Zones sandbox', () => {
    const output = renderAiIndex(input)
    expect([...output.matchAll(/^## (.+)$/gm)].map(([, heading]) => heading)).toEqual([
      ...aiDocsSections.map(({ label }) => label),
      'Other pages',
    ])
    expect(
      parseAiIndex(output)
        .map(({ route }) => route)
        .sort(),
    ).toEqual(
      parseAiIndex(input)
        .map(({ route }) => route)
        .sort(),
    )
    expect(output.indexOf('[Earn]')).toBeLessThan(output.indexOf('[Deposit]'))
    expect(output).toMatch(
      /## Zones[\s\S]*live on Mainnet[\s\S]*### Earlier testnet sandbox[\s\S]*Legacy swap/,
    )
    expect(output).toMatch(/## Tempo EVM[\s\S]*\[Keys\]/)
    expect(output).toMatch(/## API reference[\s\S]*\[API reference\]/)
    expect(output).toContain('Earn is in beta')
    expect(output).toContain('Routes is in beta')
    expect(renderAiIndex(output)).toBe(output)
  })

  it('fails when a new docs route has no navigation owner', () => {
    expect(() => renderAiIndex('- [Unassigned](/docs/new-product)')).toThrow(
      'no AI navigation home',
    )
  })

  it('keeps source provenance for pages with identical titles in the full export', () => {
    const index = renderAiIndex(input)
    const pages = new Map(
      parseAiIndex(input).map(({ route }) => [route, renderAiPage('# Deposit\n\nContent.', route)]),
    )
    const full = renderAiFull(index, pages)
    expect(full.match(/> Source:/g)).toHaveLength(pages.size)
    expect(full).toContain('> Source: [/docs/earn/integrate](/docs/earn/integrate.md)')
    expect(full).toContain('> Section: [Earn](/docs/earn.md)')
    expect(full).toContain('> Source: [/docs/zones/deposit](/docs/zones/deposit.md)')
    expect(full).toContain('> Section: [Zones](/docs/zones.md)')
    expect(() => renderAiFull(index, new Map())).toThrow('Missing Markdown export')
  })

  it('keeps code intact and adds context only once', () => {
    const source = '# Deposit\n\n```ts\nconst amount = 1n\n```'
    const output = renderAiPage(source, '/docs/earn/integrate')
    expect(output).toContain(source)
    expect(renderAiPage(output, '/docs/earn/integrate')).toBe(output)
    expect(renderAiPage(source, '/docs/guide/private-zones/deposit-to-a-zone')).toContain(
      '> Earlier testnet sandbox:',
    )
  })

  it('ends guide pages with the Start building steps, but not the entry pages', () => {
    const output = renderAiPage('# Deposit\n\nContent.\n', '/docs/earn/integrate')
    expect(output.endsWith(`Content.\n\n${renderStartBuildingMarkdown()}\n`)).toBe(true)
    expect(output.match(/\*\*Start building on Tempo\*\*/g)).toHaveLength(1)
    expect(output).toContain('[quickstart](/get-started/quickstart)')
    for (const route of ['/index', '/get-started'])
      expect(renderAiPage('# Start\n\nContent.', route)).not.toContain('Start building on Tempo')
  })

  it('uses canonical Markdown links under the production mount', () => {
    const output = canonicalizeGeneratedDeveloperLinks(
      renderAiIndex(input),
      'https://tempo.com/developers/docs',
    )
    expect(output).toContain('(https://tempo.com/developers/docs/earn/integrate.md)')
    expect(output).toContain('(https://tempo.com/developers/get-started.md)')
    expect(output).toContain('(https://tempo.com/developers/llms.txt)')
    expect(output).toContain('(https://tempo.com/developers/SKILL.md)')
    expect(output).toContain('(https://tempo.com/developers/index.md)')
    expect(markdownRoute('https://tempo.com/developers/docs/sdk/index.md')).toBe('/docs/sdk')
    expect(markdownRoute('/developers/docs/sdk/')).toBe('/docs/sdk')
  })

  it('keeps the published skill aligned with every visible navigation home', () => {
    const skill = readFileSync('SKILL.md', 'utf8')
    for (const { label, href } of aiDocsSections)
      expect(skill).toContain(`[${label}](https://tempo.com/developers${href}.md)`)
    expect(skill).toContain('Earn is in beta')
    expect(skill).toContain('Routes is in beta')
    expect(skill).toContain('Zones is live on Mainnet')
    expect(skill).not.toContain('read_web_page')
    expect(skill).not.toContain('/developers/quickstart/')
  })
})

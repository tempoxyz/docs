import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { tempoAgentSetupCommands, tempoPluginInstallCommands } from './ai-install-commands'

describe('tempoPluginInstallCommands', () => {
  it('uses the canonical Codex marketplace and plugin selectors', () => {
    expect(tempoPluginInstallCommands.codex).toBe(
      'codex plugin marketplace add tempoxyz/plugins --ref main\ncodex plugin add docs@tempo',
    )
  })

  it('uses the canonical Claude marketplace and plugin selectors', () => {
    expect(tempoPluginInstallCommands.claude).toBe(
      'claude plugin marketplace add tempoxyz/plugins\nclaude plugin install docs@tempo',
    )
  })

  it('keeps plugin registries out of the documentation repository', () => {
    for (const legacyPath of [
      '.agents/plugins/marketplace.json',
      '.claude-plugin/marketplace.json',
      '.cursor-plugin/marketplace.json',
      'ai',
    ]) {
      expect(existsSync(legacyPath), legacyPath).toBe(false)
    }
  })
})

it('keeps the encoded Cursor install link on the canonical MCP endpoint', () => {
  const guide = readFileSync('src/pages/docs/guide/using-tempo-with-ai.mdx', 'utf8')
  const links = [...guide.matchAll(/href="(cursor:\/\/[^"\s]+)"/g)]
  expect(links).toHaveLength(1)
  const link = new URL(links[0]?.[1] ?? '')
  expect(link.searchParams.get('name')).toBe('tempo')
  const config = JSON.parse(Buffer.from(link.searchParams.get('config') ?? '', 'base64').toString())
  expect(tempoAgentSetupCommands.mcp).toBe('https://tempo.com/api/mcp/')
  expect(config).toEqual({ url: tempoAgentSetupCommands.mcp })
})

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { tempoPluginInstallCommands } from './ai-install-commands'

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

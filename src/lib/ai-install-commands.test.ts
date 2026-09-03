import { describe, expect, it } from 'vitest'
import { tempoPluginInstallCommands } from './ai-install-commands'

describe('tempoPluginInstallCommands', () => {
  it('uses the canonical Codex marketplace and plugin selectors', () => {
    expect(tempoPluginInstallCommands.codex).toBe(
      'codex plugin marketplace add tempoxyz/docs --ref main\ncodex plugin add tempo-docs@tempo',
    )
  })

  it('uses the canonical Claude marketplace and plugin selectors', () => {
    expect(tempoPluginInstallCommands.claude).toBe(
      'claude plugin marketplace add tempoxyz/docs\nclaude plugin install tempo-docs@tempo',
    )
  })
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(path, 'utf8')
const json = (path: string) => JSON.parse(read(path))

describe('Tempo Docs plugin policy boundary', () => {
  it('is read-only and excludes wallet workflows', () => {
    const manifest = json('ai/plugins/tempo-docs/.codex-plugin/plugin.json')
    const skill = read('ai/plugins/tempo-docs/skills/tempo-docs/SKILL.md')

    expect(manifest.name).toBe('tempo-docs')
    expect(manifest.interface.capabilities).toEqual(['Read'])
    expect(skill).not.toContain('tempo-wallet')
    expect(skill).toContain('This plugin is read-only.')
  })

  it('packages wallet instructions as a separate plugin', () => {
    const codexMarketplace = json('.agents/plugins/marketplace.json')
    const pluginNames = codexMarketplace.plugins.map((plugin: { name: string }) => plugin.name)

    expect(pluginNames).toContain('tempo-docs')
    expect(pluginNames).toContain('tempo-wallet')
    expect(json('ai/plugins/tempo-wallet/.codex-plugin/plugin.json').name).toBe('tempo-wallet')
  })
})

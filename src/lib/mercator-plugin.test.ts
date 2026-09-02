import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Mercator marketplace plugin', () => {
  it('uses the protected OAuth MCP endpoint in every transport manifest', () => {
    for (const manifestPath of ['ai/plugins/mercator/.mcp.json', 'ai/plugins/mercator/mcp.json']) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

      expect(manifest.mcpServers.mercator.url).toBe('https://mercator.tempo.xyz/mcp/auth')
    }
  })

  it('keeps host manifests on the current plugin release', () => {
    for (const manifestPath of [
      'ai/plugins/mercator/plugin.json',
      'ai/plugins/mercator/.claude-plugin/plugin.json',
      'ai/plugins/mercator/.codex-plugin/plugin.json',
      'ai/plugins/mercator/.cursor-plugin/plugin.json',
    ]) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

      expect(manifest.version).toMatch(/^0\.3\.0(?:\+|$)/)
      expect(manifest.description).toContain('secure MCP connection')
    }
  })

  it('guides OAuth-connected clients through MCP job execution', () => {
    const skill = readFileSync('ai/plugins/mercator/skills/mercator/SKILL.md', 'utf8')

    expect(skill).toContain('`create_job` ->\n`get_job`')
    expect(skill).toContain('accepted `totalAmount` as `approved_total`')
    expect(skill).toContain('OAuth authorization is a one-time')
  })
})

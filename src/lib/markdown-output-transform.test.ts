import { afterEach, describe, expect, it, vi } from 'vitest'
import { transformMarkdownOutput } from './markdown-output-transform'

afterEach(() => vi.unstubAllEnvs())
describe('final Markdown transform', () => {
  it('preserves inventory and adds the same product context in every environment', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    const pages = { '/docs/earn': '# Earn\n\nVaults.', '/docs/earn/integrate': '# Integrate' }
    const result = await transformMarkdownOutput({
      index: '# Tempo\n\n- [Earn](/docs/earn.md): Vaults\n- [Integrate](/docs/earn/integrate.md)',
      pages,
    })
    expect(Object.keys(result.pages)).toEqual(Object.keys(pages))
    expect(result.index).toContain('## Earn')
    expect(result.index).toContain('Earn is in beta')
    expect(result.pages['/docs/earn']).toContain('> Source: [')
    expect(result.pages['/docs/earn']).toContain('> Section: [Earn]')
    expect(result.pages['/docs/earn']).toContain(pages['/docs/earn'])
  })
  it('canonicalizes production links before framework hashing', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const result = await transformMarkdownOutput({
      index: '# Tempo\n\n- [Earn](/docs/earn.md)',
      pages: { '/docs/earn': '# Earn\n\n[Integrate](/docs/earn/integrate)' },
    })
    expect(result.index).toContain('https://tempo.xyz/developers/docs/earn.md')
    expect(result.pages['/docs/earn']).toContain('https://tempo.xyz/developers/docs/earn/integrate')
  })
})

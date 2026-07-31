import { describe, expect, it } from 'vitest'
import { externalLinkSource } from './external-link-source'

describe('external link source', () => {
  it.each([
    ['root-relative Markdown', '[Docs](/docs/guide#section)', '[Docs](#)'],
    ['relative Markdown', '[Sibling](../sibling)', '[Sibling](#)'],
    ['root-relative image', '![Diagram](/developers/image.svg)', '![Diagram](#)'],
    ['reference definition', '[docs]: /docs/guide', '[docs]: #'],
    ['JSX href', '<a href="/docs/guide">Docs</a>', '<a href="#">Docs</a>'],
    ['JSX to', '<Card to="./guide" />', '<Card to="#" />'],
    ['JSX src', "<img src='/developers/image.svg' />", "<img src='#' />"],
    ['local autolink', '</docs/guide>', '<#>'],
  ])('masks %s destinations', (_label, source, expected) => {
    expect(externalLinkSource(source)).toBe(expected)
  })

  it('preserves external URLs and line numbers', () => {
    const source = [
      '[Docs](/docs/guide)',
      '[GitHub](https://github.com/tempoxyz/docs)',
      '<a href="https://tempo.xyz">Tempo</a>',
      'Bare URL: https://example.net/path',
    ].join('\n')

    const filtered = externalLinkSource(source)

    expect(filtered).toContain('[GitHub](https://github.com/tempoxyz/docs)')
    expect(filtered).toContain('<a href="https://tempo.xyz">Tempo</a>')
    expect(filtered).toContain('Bare URL: https://example.net/path')
    expect(filtered.split('\n')).toHaveLength(source.split('\n').length)
  })
})

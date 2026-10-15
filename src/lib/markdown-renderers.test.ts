import { describe, expect, it } from 'vitest'
import { renderMermaid } from './markdown-renderers'

const context = { inline: false, pageUrl: '/docs', renderChildren: () => [] }
describe('Mermaid Markdown override', () => {
  it('preserves the complete chart as a fenced code block', () => {
    expect(renderMermaid({ chart: '  graph LR\n  A --> B\n' }, context)).toEqual([
      { type: 'code', lang: 'mermaid', value: 'graph LR\n  A --> B' },
    ])
  })
  it.each([undefined, null, 42, '', '  '])('rejects invalid chart %j', (chart) => {
    expect(() => renderMermaid({ chart }, context)).toThrow('nonempty static chart')
  })
  it('rejects block diagrams inside prose', () => {
    expect(() => renderMermaid({ chart: 'graph LR' }, { ...context, inline: true })).toThrow(
      'standalone blocks',
    )
  })
})

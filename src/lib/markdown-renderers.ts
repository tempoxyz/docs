import type { MarkdownRenderer } from 'vocs'

/** Preserve the complete diagram source; browser rendering is unnecessary for exports. */
export const renderMermaid: MarkdownRenderer = ({ chart }, { inline }) => {
  if (typeof chart !== 'string' || !chart.trim())
    throw new TypeError('Mermaid diagrams require a nonempty static chart string.')
  if (inline) throw new TypeError('Mermaid diagrams must be standalone blocks.')
  return [{ type: 'code', lang: 'mermaid', value: chart.trim() }]
}

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'
import { SqlEditor } from './SqlEditor'

// Exercise the server text without requiring Vite's style compiler.
vi.mock('./SqlEditor.recipes', () => ({
  sqlEditorLayout: () => ({ className: 'editor' }),
  sqlEditorLayout2: () => ({ className: 'preview' }),
  sqlEditorLayoutAppearance: () => ({ className: 'preview' }),
}))

describe('SQL editor server rendering', () => {
  test('preserves the complete example as readable code while the editor loads', () => {
    const query = 'SELECT num, hash, timestamp\nFROM blocks\nORDER BY num DESC\nLIMIT 5'
    const html = renderToStaticMarkup(<SqlEditor value={query} onChange={() => {}} />)

    expect(html).toContain(`<code>${query}</code>`)
    expect(html).not.toContain('Loading editor...')
  })

  test('escapes SQL as text rather than interpreting it as markup', () => {
    const html = renderToStaticMarkup(
      <SqlEditor value={"SELECT '<script>alert(1)</script>'"} onChange={() => {}} />,
    )

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})

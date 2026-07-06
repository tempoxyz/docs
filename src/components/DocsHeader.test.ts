import { describe, expect, it } from 'vitest'
import { normalizeDocsPath, resolveSidebarItems } from './DocsHeader'

const sidebar = {
  '/docs': [{ text: 'Start Here' }],
  '/docs/protocol': [{ text: 'Tempo Protocol' }],
  '/docs/tools': [{ text: 'Tools & SDKs' }],
}

describe('normalizeDocsPath', () => {
  it.each([
    ['/developers/docs/protocol', '/docs/protocol'],
    ['/developers/docs/protocol/tip20/overview', '/docs/protocol/tip20/overview'],
    ['/developers', '/'],
    ['/docs/tools', '/docs/tools'],
    ['', '/'],
  ])('normalizes %s to %s', (pathname, expected) => {
    expect(normalizeDocsPath(pathname)).toBe(expected)
  })
})

describe('resolveSidebarItems', () => {
  it('uses the current docs section when served from the developers mount', () => {
    const items = resolveSidebarItems(sidebar, '/developers/docs/protocol')

    expect(items[0]?.text).toBe('Tempo Protocol')
  })

  it('uses the longest matching sidebar key', () => {
    const items = resolveSidebarItems(sidebar, '/docs/protocol/tip20/overview')

    expect(items[0]?.text).toBe('Tempo Protocol')
  })
})

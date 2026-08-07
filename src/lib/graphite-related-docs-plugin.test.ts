import { describe, expect, it } from 'vitest'
import {
  docsPageRouteFromFile,
  isCompleteManifestRefresh,
} from '../../scripts/graphite-related-docs-plugin'

describe('docsPageRouteFromFile', () => {
  it.each([
    ['src/pages/docs/index.mdx', '/docs'],
    ['src/pages/docs/tools.mdx', '/docs/tools'],
    ['src/pages/docs/guide/payments/index.mdx', '/docs/guide/payments'],
    ['src/pages/docs/guide/payments/send-a-payment.mdx', '/docs/guide/payments/send-a-payment'],
    ['src/pages/docs/changelog.md', '/docs/changelog'],
  ])('maps %s to %s', (filePath, expected) => {
    expect(docsPageRouteFromFile(filePath)).toBe(expected)
  })

  it.each([
    'src/pages/docs/_layout.tsx',
    'src/pages/index.tsx',
    'src/pages/docs/not-markdown.txt',
  ])('ignores %s', (filePath) => {
    expect(docsPageRouteFromFile(filePath)).toBeUndefined()
  })
})

describe('isCompleteManifestRefresh', () => {
  it('persists only a complete non-empty refresh', () => {
    expect(isCompleteManifestRefresh(221, 221)).toBe(true)
    expect(isCompleteManifestRefresh(220, 221)).toBe(false)
    expect(isCompleteManifestRefresh(0, 0)).toBe(false)
  })
})

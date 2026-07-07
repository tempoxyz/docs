import { describe, expect, test } from 'vitest'
import vocsConfig from '../../vocs.config'

function titleFor(path: string, title: string) {
  expect(typeof vocsConfig.titleTemplate).toBe('function')
  const template =
    typeof vocsConfig.titleTemplate === 'function'
      ? vocsConfig.titleTemplate(path, {
          frontmatter: { title },
          siteTitle: vocsConfig.title,
          title,
        })
      : vocsConfig.titleTemplate

  return template?.replace('%s', title) ?? title
}

describe('vocs.config docs SEO controls', () => {
  test('uses Tempo Docs title suffix for docs pages', () => {
    expect(titleFor('/docs', 'Documentation')).toBe('Tempo Documentation ⋅ Tempo Docs')
    expect(titleFor('/docs/guide/payments/send-a-payment', 'Send a Payment')).toBe(
      'Send a Payment ⋅ Tempo Docs',
    )
    expect(titleFor('/blog', 'Blog')).toBe('Blog ⋅ Tempo')
  })

  test('omits article modified metadata for docs pages only', () => {
    const articleModifiedTime = vocsConfig.head?.meta?.articleModifiedTime

    expect(typeof articleModifiedTime).toBe('function')
    if (typeof articleModifiedTime !== 'function') return

    expect(articleModifiedTime('/docs', {})).toBe(false)
    expect(articleModifiedTime('/docs/guide/payments/send-a-payment', {})).toBe(false)
    expect(articleModifiedTime('/blog/stablecoins-as-a-platform', {})).toBe(true)
  })

  test('omits sitemap lastmod for docs pages only', () => {
    expect(vocsConfig.sitemap).not.toBe(false)
    const lastmod = vocsConfig.sitemap?.lastmod

    expect(typeof lastmod).toBe('function')
    if (typeof lastmod !== 'function') return

    const context = { filePath: 'docs/index.mdx', lastmod: '2026-07-07' }
    expect(lastmod('/docs', context)).toBe(false)
    expect(lastmod('/docs/guide/payments/send-a-payment', context)).toBe(false)
    expect(lastmod('/blog/stablecoins-as-a-platform', context)).toBe('2026-07-07')
  })
})

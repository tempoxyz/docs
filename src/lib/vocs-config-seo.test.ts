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

  const resolvedTemplate = title.includes(vocsConfig.title) ? undefined : template
  return resolvedTemplate?.replace('%s', title) ?? title
}

describe('vocs.config docs SEO controls', () => {
  test('uses Tempo Docs title suffix for docs pages', () => {
    expect(titleFor('/docs', 'Documentation')).toBe('Tempo Documentation ⋅ Tempo Docs')
    expect(titleFor('/docs/guide/payments/send-a-payment', 'Send a Payment')).toBe(
      'Send a Payment ⋅ Tempo Docs',
    )
    expect(titleFor('/docs/api', 'Tempo API')).toBe('Tempo API ⋅ Tempo Docs')
    expect(titleFor('/docs/protocol/transactions', 'Tempo Transactions')).toBe(
      'Tempo Transactions ⋅ Tempo Docs',
    )
    expect(titleFor('/', 'Tempo')).toBe('Tempo')
    expect(titleFor('/build/tempo-transactions', 'Tempo Transactions')).toBe('Tempo Transactions')
    expect(titleFor('/blog', 'Blog')).toBe('Blog ⋅ Tempo')
  })

  test('omits article modified metadata for docs pages only', () => {
    const head = vocsConfig.head

    expect(typeof head).toBe('function')
    if (typeof head !== 'function') return

    expect(head('/docs', {})).toEqual({ meta: { articleModifiedTime: false } })
    expect(head('/docs/guide/payments/send-a-payment', {})).toEqual({
      meta: { articleModifiedTime: false },
    })
    expect(head('/blog/stablecoins-as-a-platform', {})).toBeUndefined()
  })

  test('omits sitemap lastmod for docs pages only', () => {
    const sitemap = vocsConfig.sitemap

    expect(sitemap).not.toBe(false)
    if (!sitemap) return

    const lastmod = sitemap.lastmod

    expect(typeof lastmod).toBe('function')
    if (typeof lastmod !== 'function') return

    const context = { filePath: 'docs/index.mdx', lastmod: '2026-07-07' }
    expect(lastmod('/docs', context)).toBe(false)
    expect(lastmod('/docs/guide/payments/send-a-payment', context)).toBe(false)
    expect(lastmod('/blog/stablecoins-as-a-platform', context)).toBe('2026-07-07')
  })
})

import { describe, expect, test } from 'vitest'
import vocsConfig from '../../vocs.config'

function titleFor(path: string, title: string, seoTitle?: string) {
  expect(typeof vocsConfig.titleTemplate).toBe('function')
  const template =
    typeof vocsConfig.titleTemplate === 'function'
      ? vocsConfig.titleTemplate(path, {
          frontmatter: { seoTitle, title },
          siteTitle: vocsConfig.title,
          title,
        })
      : vocsConfig.titleTemplate

  const resolvedTemplate = title.includes(vocsConfig.title) ? undefined : template
  return resolvedTemplate?.replace('%s', title) ?? title
}

describe('vocs.config docs SEO controls', () => {
  test('uses exact authored SEO titles without changing page titles', () => {
    expect(
      titleFor(
        '/docs/guide/payments/send-a-payment',
        'How to send a stablecoin payment on Tempo',
        'Send a Stablecoin Payment on Tempo | Docs',
      ),
    ).toBe('Send a Stablecoin Payment on Tempo | Docs')
    expect(
      titleFor(
        '/docs',
        'Tempo developer documentation',
        'Tempo Developer Docs: APIs, SDKs & Guides',
      ),
    ).toBe('Tempo Developer Docs: APIs, SDKs & Guides')
  })

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

  test('formats authored API titles when Vocs supplies routed metadata', () => {
    expect(titleFor('/docs/api/authentication', 'Authentication')).toBe(
      'Authentication ⋅ Tempo Docs',
    )
    expect(titleFor('/docs/api/json-rpc', 'Tempo JSON-RPC API: Endpoints & Methods')).toBe(
      'Tempo JSON-RPC API: Endpoints & Methods ⋅ Tempo Docs',
    )
    expect(
      titleFor('/docs/api/indexer-api', 'Tempo Indexer API: Query Blockchain Data with SQL'),
    ).toBe('Tempo Indexer API: Query Blockchain Data with SQL ⋅ Tempo Docs')
    expect(titleFor('/docs/api/fee-payer', 'Tempo Fee Payer API: Sponsor Transaction Fees')).toBe(
      'Tempo Fee Payer API: Sponsor Transaction Fees ⋅ Tempo Docs',
    )
  })

  test('omits article modified metadata for docs pages only', () => {
    const head = vocsConfig.head

    expect(typeof head).toBe('function')
    if (typeof head !== 'function') return

    expect(head('/docs', {})).toMatchObject({ meta: { articleModifiedTime: false } })
    expect(head('/docs/guide/payments/send-a-payment', {})).toMatchObject({
      meta: { articleModifiedTime: false },
    })
    expect(head('/blog/stablecoins-as-a-platform', {})).toBeUndefined()
  })

  test('excludes route templates from the sitemap', () => {
    const sitemap = vocsConfig.sitemap

    expect(sitemap).not.toBe(false)
    if (!sitemap) return

    const include = sitemap.include

    expect(typeof include).toBe('function')
    if (typeof include !== 'function') return

    const context = { filePath: 'blog/[slug].tsx' }
    expect(include('/blog/[slug]', context)).toBe(false)
    expect(include('/example/[id]/details', context)).toBe(false)
    expect(include('/example/[[...slug]]', context)).toBe(false)
    expect(include('/blog/stablecoins-as-a-platform', context)).toBe(true)
  })

  test('disables Vocs JSON-LD in favor of the context-aware docs graph', () => {
    expect(vocsConfig.jsonLd).toBe(false)
  })

  test('uses sitemap lastmod only for authored Markdown', () => {
    const sitemap = vocsConfig.sitemap

    expect(sitemap).not.toBe(false)
    if (!sitemap) return

    const lastmod = sitemap.lastmod

    expect(typeof lastmod).toBe('function')
    if (typeof lastmod !== 'function') return

    expect(lastmod('/docs', { filePath: 'docs/index.mdx', lastmod: '2026-07-07' })).toBe(
      '2026-07-07',
    )
    expect(
      lastmod('/docs/api/authentication', {
        filePath: 'docs/api/authentication.mdx',
        lastmod: '2026-07-08',
      }),
    ).toBe('2026-07-08')
    expect(lastmod('/blog', { filePath: 'blog.tsx', lastmod: '2026-07-09' })).toBe(false)
  })

  test('links the TIP index directly to tips.sh', () => {
    const sidebar = JSON.stringify(vocsConfig.sidebar)

    expect(sidebar).toContain('https://tips.sh/')
    expect(sidebar).not.toContain('"/docs/protocol/tips"')
  })
})

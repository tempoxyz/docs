import { describe, expect, test } from 'vitest'
import { docsStructuredDataHead } from './docs-structured-data'

function graph(path: string, frontmatter?: { description?: string; title?: string }) {
  const head = docsStructuredDataHead(path, { frontmatter })
  if (!head) throw new Error(`Structured data is missing for ${path}`)
  return JSON.parse(head.script[0].innerHTML) as {
    '@graph': Record<string, unknown>[]
  }
}

function node(schema: ReturnType<typeof graph>, type: string) {
  const match = schema['@graph'].find((entry) => {
    const entryType = entry['@type']
    return entryType === type || (Array.isArray(entryType) && entryType.includes(type))
  })
  if (!match) throw new Error(`${type} schema is missing`)
  return match
}

describe('docs structured data', () => {
  test('uses authored page metadata for TechArticle semantics', () => {
    const schema = graph('/docs/guide/payments/send-a-payment', {
      title: 'Send a Payment',
      description: 'Send stablecoin payments between accounts on Tempo.',
    })

    expect(node(schema, 'TechArticle')).toMatchObject({
      '@id': 'https://tempo.xyz/developers/docs/guide/payments/send-a-payment',
      url: 'https://tempo.xyz/developers/docs/guide/payments/send-a-payment',
      name: 'Send a Payment',
      headline: 'Send a Payment',
      description: 'Send stablecoin payments between accounts on Tempo.',
      breadcrumb: {
        '@id': 'https://tempo.xyz/developers/docs/guide/payments/send-a-payment#breadcrumb',
      },
    })
  })

  test('uses the scoped Tempo entity description and verified profiles', () => {
    const schema = graph('/docs/api/authentication', { title: 'Authentication' })

    expect(node(schema, 'Corporation')).toMatchObject({
      description:
        'Tempo is a payments-first Layer 1 blockchain built for stablecoin payments, global payouts, agentic payments, and enterprise settlement.',
      sameAs: [
        'https://x.com/tempo',
        'https://twitter.com/tempo',
        'https://github.com/tempoxyz',
        'https://www.linkedin.com/company/tempo',
      ],
    })
    expect(node(schema, 'WebSite')).toMatchObject({
      description:
        'Tempo is a payments-first Layer 1 blockchain built for stablecoin payments, global payouts, agentic payments, and enterprise settlement.',
    })
  })

  test('uses generated titles and omits an unavailable generated description', () => {
    const article = node(
      graph('/docs/api/activities', { title: 'Activities · Tempo API' }),
      'TechArticle',
    )

    expect(article).toMatchObject({
      name: 'Activities · Tempo API',
      headline: 'Activities · Tempo API',
    })
    expect(article).not.toHaveProperty('description')
  })

  test('adds a BreadcrumbList with authored current-page names', () => {
    const breadcrumbs = node(
      graph('/docs/api/authentication', { title: 'Authentication' }),
      'BreadcrumbList',
    )

    expect(breadcrumbs.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Tempo developers',
        item: 'https://tempo.xyz/developers/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tempo Docs',
        item: 'https://tempo.xyz/developers/docs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Authentication',
        item: 'https://tempo.xyz/developers/docs/api/authentication',
      },
    ])
  })

  test('keeps the serialized callback self-contained and escapes script content', () => {
    const revived = Function(
      `return (${docsStructuredDataHead.toString()})`,
    )() as typeof docsStructuredDataHead
    const head = revived('/docs/example', {
      frontmatter: { title: '</script><script>alert(1)</script>' },
    })

    expect(head?.script[0].innerHTML).not.toContain('</script>')
    expect(head?.script[0].innerHTML).toContain('\\u003c/script\\u003e')
  })

  test('leaves non-docs routes unchanged', () => {
    expect(docsStructuredDataHead('/blog', {})).toBeUndefined()
  })

  test('does not emit JSON-LD outside the page frontmatter context', () => {
    expect(docsStructuredDataHead('/docs/api/activities', {})).toEqual({
      meta: { articleModifiedTime: false },
    })
  })
})

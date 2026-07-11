import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from '../lib/tempo-entity'
import { createDocsJsonLdSchema } from './DocsJsonLd'

function techArticle(schema: ReturnType<typeof createDocsJsonLdSchema>) {
  const article = schema['@graph'].find((entry) => {
    const type = entry['@type']
    return type === 'TechArticle' || (Array.isArray(type) && type.includes('TechArticle'))
  })
  if (!article) throw new Error('TechArticle schema is missing')
  return article
}

describe('DocsJsonLd', () => {
  it.each([
    ['/docs', 'https://tempo.xyz/developers/docs'],
    ['docs/api', 'https://tempo.xyz/developers/docs/api'],
    [
      '/docs/quickstart/integrate-tempo',
      'https://tempo.xyz/developers/docs/quickstart/integrate-tempo',
    ],
  ])('uses the page path in TechArticle URLs', (path, url) => {
    const article = techArticle(createDocsJsonLdSchema({ path }))

    expect(article).toMatchObject({
      '@id': url,
      url,
      isPartOf: { '@id': 'https://tempo.xyz/#website' },
      about: { '@id': 'https://tempo.xyz/#organization' },
    })
  })

  it('uses page metadata and the canonical Tempo entity graph', () => {
    const schema = createDocsJsonLdSchema({
      path: '/docs/api',
      title: 'Tempo API',
      description: 'API reference for Tempo developers.',
    })
    const article = techArticle(schema)
    const website = schema['@graph'].find((entry) => entry['@type'] === 'WebSite')
    const organization = schema['@graph'].find((entry) => entry['@type'] === 'Corporation')

    expect(article).toMatchObject({
      '@type': ['WebPage', 'TechArticle'],
      name: 'Tempo API',
      headline: 'Tempo API',
      description: 'API reference for Tempo developers.',
    })
    expect(website).toMatchObject({
      '@id': 'https://tempo.xyz/#website',
      name: 'Tempo',
      alternateName: ['Tempo Blockchain', 'tempo.xyz'],
      url: 'https://tempo.xyz',
    })
    expect(organization).toMatchObject({
      '@id': 'https://tempo.xyz/#organization',
      name: 'Tempo',
      alternateName: ['Tempo Blockchain', 'tempo.xyz'],
      sameAs: expect.arrayContaining([
        'https://www.linkedin.com/company/tempo',
        'https://www.crunchbase.com/organization/tempo-24b7',
        'https://www.wikidata.org/wiki/Q140472934',
      ]),
    })
  })

  it.each([
    ['/docs', 'Tempo documentation'],
    ['/docs/api', 'Tempo API'],
    ['/docs/guide/payments/send-a-payment', 'Send a payment'],
  ])('derives a distinct fallback title for %s', (path, title) => {
    expect(techArticle(createDocsJsonLdSchema({ path }))).toMatchObject({
      name: title,
      headline: title,
    })
  })

  it('escapes JSON-LD before injecting into a script tag', () => {
    const json = serializeJsonLd(
      createDocsJsonLdSchema({
        path: '</script><script>alert(1)</script>',
      }),
    )

    expect(json).not.toContain('</script>')
    expect(json).toContain('\\u003c/script\\u003e')
    expect(json).toContain('\\u003e')
  })
})

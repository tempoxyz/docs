import { describe, expect, it } from 'vitest'
import { createDocsJsonLdSchema, serializeJsonLd } from './DocsJsonLd'

function techArticle(schema: ReturnType<typeof createDocsJsonLdSchema>) {
  const article = schema['@graph'].find((entry) => entry['@type'] === 'TechArticle')
  if (!article) throw new Error('TechArticle schema is missing')
  return article
}

describe('DocsJsonLd', () => {
  it.each([
    ['/docs', 'https://docs.tempo.xyz/docs'],
    ['docs/api', 'https://docs.tempo.xyz/docs/api'],
    ['/docs/quickstart/integrate-tempo', 'https://docs.tempo.xyz/docs/quickstart/integrate-tempo'],
  ])('uses the page path in TechArticle URLs', (path, url) => {
    const article = techArticle(createDocsJsonLdSchema({ path }))

    expect(article).toMatchObject({
      '@id': url,
      url,
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

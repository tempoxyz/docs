import { describe, expect, test } from 'vitest'
import { canonicalizeGeneratedDeveloperLinks } from './canonical-developer-links'

const publicDevelopersUrl = 'https://tempo.xyz/developers/docs'

describe('canonicalizeGeneratedDeveloperLinks', () => {
  test('uses canonical public URLs for generated HTML hrefs', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/docs">Docs</a><a href="/docs/api#authentication">API</a>',
        publicDevelopersUrl,
      ),
    ).toBe(
      '<a href="https://tempo.xyz/developers">Docs</a><a href="https://tempo.xyz/developers/docs/api#authentication">API</a>',
    )
  })

  test('uses canonical public URLs in raw and HTML-escaped RSC href fields', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '{"href":"/docs/api","to":"/docs/api"} {\\"href\\":\\"/docs/api\\",\\"to\\":\\"/docs/api\\"}',
        publicDevelopersUrl,
      ),
    ).toBe(
      '{"href":"https://tempo.xyz/developers/docs/api","to":"/docs/api"} {\\"href\\":\\"https://tempo.xyz/developers/docs/api\\",\\"to\\":\\"/docs/api\\"}',
    )
  })

  test('uses canonical public URLs for generated Markdown links', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        [
          '- [Docs](/docs)',
          '- [API](/docs/api)',
          '- [Authentication](/docs/api#authentication)',
          '<Card title="API" to="/docs/api" />',
        ].join('\n'),
        publicDevelopersUrl,
      ),
    ).toBe(
      [
        '- [Docs](https://tempo.xyz/developers)',
        '- [API](https://tempo.xyz/developers/docs/api)',
        '- [Authentication](https://tempo.xyz/developers/docs/api#authentication)',
        '<Card title="API" to="https://tempo.xyz/developers/docs/api" />',
      ].join('\n'),
    )
  })

  test('normalizes already-prefixed generated links', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/developers/docs/api">API</a> [API](/developers/docs/api)',
        publicDevelopersUrl,
      ),
    ).toBe(
      '<a href="https://tempo.xyz/developers/docs/api">API</a> [API](https://tempo.xyz/developers/docs/api)',
    )
  })

  test('uses the configured public URL', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/docs/api">API</a>',
        'https://docs.example.com/reference/docs',
      ),
    ).toBe('<a href="https://docs.example.com/reference/docs/api">API</a>')
  })

  test('canonicalizes the landing and getting-started routes while preserving anchors and queries', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/">Docs</a> [Start](/get-started?ref=nav#payment) <a href="/developers">Home</a> <a href="/docs#start-here">Legacy</a>',
        publicDevelopersUrl,
      ),
    ).toBe(
      '<a href="https://tempo.xyz/developers">Docs</a> [Start](https://tempo.xyz/developers/get-started?ref=nav#payment) <a href="https://tempo.xyz/developers">Home</a> <a href="https://tempo.xyz/developers#start-here">Legacy</a>',
    )
  })

  test('leaves internal route values and unrelated URLs unchanged', () => {
    const content = [
      '{"to":"/docs/api","path":"/docs/api"}',
      '<a href="/docsify">Docsify</a>',
      '<a href="#section">Section</a><a href="">Current page</a>',
      '{"to":"/get-started","path":"/"}',
      '[External](https://example.com/docs)',
    ].join('\n')

    expect(canonicalizeGeneratedDeveloperLinks(content, publicDevelopersUrl)).toBe(content)
  })
})

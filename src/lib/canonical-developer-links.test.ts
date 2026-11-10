import { describe, expect, test } from 'vitest'
import { canonicalizeGeneratedDeveloperLinks } from './canonical-developer-links'

const publicDocsUrl = 'https://tempo.xyz/docs'

describe('canonicalizeGeneratedDeveloperLinks', () => {
  test('uses canonical public URLs for generated HTML hrefs', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/docs">Docs</a><a href="/docs/api#authentication">API</a>',
        publicDocsUrl,
      ),
    ).toBe(
      '<a href="https://tempo.xyz/docs">Docs</a><a href="https://tempo.xyz/docs/api#authentication">API</a>',
    )
  })

  test('uses canonical public URLs in raw and HTML-escaped RSC href fields', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '{"href":"/docs/api","to":"/docs/api"} {\\"href\\":\\"/docs/api\\",\\"to\\":\\"/docs/api\\"}',
        publicDocsUrl,
      ),
    ).toBe(
      '{"href":"https://tempo.xyz/docs/api","to":"/docs/api"} {\\"href\\":\\"https://tempo.xyz/docs/api\\",\\"to\\":\\"/docs/api\\"}',
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
        publicDocsUrl,
      ),
    ).toBe(
      [
        '- [Docs](https://tempo.xyz/docs)',
        '- [API](https://tempo.xyz/docs/api)',
        '- [Authentication](https://tempo.xyz/docs/api#authentication)',
        '<Card title="API" to="https://tempo.xyz/docs/api" />',
      ].join('\n'),
    )
  })

  test('normalizes already-prefixed generated links', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/developers/docs/api">API</a> [API](/developers/docs/api)',
        publicDocsUrl,
      ),
    ).toBe('<a href="https://tempo.xyz/docs/api">API</a> [API](https://tempo.xyz/docs/api)')
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
        '<a href="/">Docs</a> [Start](/docs/get-started?ref=nav#payment) <a href="/developers">Home</a> <a href="/docs#start-here">Legacy</a>',
        publicDocsUrl,
      ),
    ).toBe(
      '<a href="https://tempo.xyz/docs">Docs</a> [Start](https://tempo.xyz/docs/get-started?ref=nav#payment) <a href="https://tempo.xyz/docs">Home</a> <a href="https://tempo.xyz/docs#start-here">Legacy</a>',
    )
  })

  test('leaves internal route values and unrelated URLs unchanged', () => {
    const content = [
      '{"to":"/docs/api","path":"/docs/api"}',
      '<a href="/docsify">Docsify</a>',
      '<a href="#section">Section</a><a href="">Current page</a>',
      '{"to":"/docs/get-started","path":"/"}',
      '<a href="/get-started-extra">Unrelated route</a>',
      '{"to":"/docs/get-started/stablecoins","path":"/docs/get-started/stablecoins"}',
      '[External](https://example.com/docs)',
    ].join('\n')

    expect(canonicalizeGeneratedDeveloperLinks(content, publicDocsUrl)).toBe(content)
  })

  test('canonicalizes nested getting-started links on both route mounts', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/docs/get-started/stablecoins?ref=nav#token-amounts">Tokens</a> [Tokens](/docs/get-started/stablecoins#token-amounts)',
        publicDocsUrl,
      ),
    ).toBe(
      '<a href="https://tempo.xyz/docs/get-started/stablecoins?ref=nav#token-amounts">Tokens</a> [Tokens](https://tempo.xyz/docs/get-started/stablecoins#token-amounts)',
    )
  })
})

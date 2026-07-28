import { describe, expect, test } from 'vitest'
import { canonicalizeGeneratedDeveloperLinks } from './canonical-developer-links'

describe('canonicalizeGeneratedDeveloperLinks', () => {
  test('uses canonical public URLs for generated HTML hrefs', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/docs">Docs</a><a href="/docs/api#authentication">API</a>',
      ),
    ).toBe(
      '<a href="https://tempo.xyz/developers/docs">Docs</a><a href="https://tempo.xyz/developers/docs/api#authentication">API</a>',
    )
  })

  test('uses canonical public URLs in raw and HTML-escaped RSC href fields', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '{"href":"/docs/api","to":"/docs/api"} {\\"href\\":\\"/docs/api\\",\\"to\\":\\"/docs/api\\"}',
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
      ),
    ).toBe(
      [
        '- [Docs](https://tempo.xyz/developers/docs)',
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
      ),
    ).toBe(
      '<a href="https://tempo.xyz/developers/docs/api">API</a> [API](https://tempo.xyz/developers/docs/api)',
    )
  })

  test('leaves internal route values and unrelated URLs unchanged', () => {
    const content = [
      '{"to":"/docs/api","path":"/docs/api"}',
      '<a href="/docsify">Docsify</a>',
      '[External](https://example.com/docs)',
    ].join('\n')

    expect(canonicalizeGeneratedDeveloperLinks(content)).toBe(content)
  })
})

import { describe, expect, test } from 'vitest'
import { canonicalizeGeneratedDeveloperLinks } from './canonical-developer-links'

describe('canonicalizeGeneratedDeveloperLinks', () => {
  test('prefixes generated HTML hrefs with the public developers mount', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '<a href="/docs">Docs</a><a href="/docs/api#authentication">API</a>',
      ),
    ).toBe(
      '<a href="/developers/docs">Docs</a><a href="/developers/docs/api#authentication">API</a>',
    )
  })

  test('prefixes href fields in raw and HTML-escaped RSC payloads', () => {
    expect(
      canonicalizeGeneratedDeveloperLinks(
        '{"href":"/docs/api","to":"/docs/api"} {\\"href\\":\\"/docs/api\\",\\"to\\":\\"/docs/api\\"}',
      ),
    ).toBe(
      '{"href":"/developers/docs/api","to":"/docs/api"} {\\"href\\":\\"/developers/docs/api\\",\\"to\\":\\"/docs/api\\"}',
    )
  })

  test('prefixes generated Markdown links', () => {
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
        '- [Docs](/developers/docs)',
        '- [API](/developers/docs/api)',
        '- [Authentication](/developers/docs/api#authentication)',
        '<Card title="API" to="/developers/docs/api" />',
      ].join('\n'),
    )
  })

  test('leaves internal route values and unrelated URLs unchanged', () => {
    const content = [
      '{"to":"/docs/api","path":"/docs/api"}',
      '<a href="/docsify">Docsify</a>',
      '[External](https://example.com/docs)',
      '<a href="/developers/docs/api">API</a>',
    ].join('\n')

    expect(canonicalizeGeneratedDeveloperLinks(content)).toBe(content)
  })
})

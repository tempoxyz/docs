import { describe, expect, it } from 'vitest'
import {
  canonicalDocsUrl,
  normalizeDocsRoutePath,
  parseGraphiteRelatedDocs,
  relatedDocsForRoute,
} from './graphite-related-docs'

const source = 'https://tempo.xyz/developers/docs/guide/payments/send-a-payment'

describe('parseGraphiteRelatedDocs', () => {
  it('keeps all valid related and random links in response order', () => {
    expect(
      parseGraphiteRelatedDocs(
        {
          related_links: [
            {
              type: 'related',
              title: 'Accept a payment',
              description: 'Accept stablecoin payments.',
              url: 'https://tempo.xyz/developers/docs/guide/payments/accept-a-payment',
            },
            {
              type: 'random',
              title: 'Tempo transactions',
              url: 'https://tempo.xyz/developers/docs/protocol/transactions',
            },
          ],
        },
        source,
      ),
    ).toEqual([
      {
        type: 'related',
        title: 'Accept a payment',
        description: 'Accept stablecoin payments.',
        href: '/docs/guide/payments/accept-a-payment',
      },
      {
        type: 'random',
        title: 'Tempo transactions',
        href: '/docs/protocol/transactions',
      },
    ])
  })

  it('rejects untrusted, non-docs, self, duplicate, and malformed links', () => {
    expect(
      parseGraphiteRelatedDocs(
        {
          related_links: [
            { type: 'related', title: 'Self', url: `${source}/` },
            {
              type: 'related',
              title: 'External',
              url: 'https://example.com/developers/docs/external',
            },
            {
              type: 'related',
              title: 'Wrong protocol',
              url: 'http://tempo.xyz/developers/docs/wrong-protocol',
            },
            {
              type: 'related',
              title: 'Marketing page',
              url: 'https://tempo.xyz/developers/blog/post',
            },
            {
              type: 'other',
              title: 'Unknown type',
              url: 'https://tempo.xyz/developers/docs/unknown-type',
            },
            {
              type: 'related',
              title: 'Valid',
              url: 'https://tempo.xyz/developers/docs/tools',
            },
            {
              type: 'random',
              title: 'Duplicate',
              url: 'https://tempo.xyz/developers/docs/tools/',
            },
            {
              type: 'related',
              title: ' ',
              url: 'https://tempo.xyz/developers/docs/no-title',
            },
            {
              type: 'related',
              title: 'x'.repeat(241),
              url: 'https://tempo.xyz/developers/docs/oversized-title',
            },
            {
              type: 'related',
              title: 'Control\u0000character',
              url: 'https://tempo.xyz/developers/docs/control-character',
            },
          ],
        },
        source,
      ),
    ).toEqual([{ type: 'related', title: 'Valid', href: '/docs/tools' }])
  })

  it('fails open for invalid response shapes and source URLs', () => {
    expect(parseGraphiteRelatedDocs(null, source)).toEqual([])
    expect(parseGraphiteRelatedDocs({ related_links: 'invalid' }, source)).toEqual([])
    expect(parseGraphiteRelatedDocs({ related_links: [] }, 'not a URL')).toEqual([])
  })

  it('keeps the docs root and drops an oversized optional description', () => {
    expect(
      parseGraphiteRelatedDocs(
        {
          related_links: [
            {
              type: 'related',
              title: 'Documentation home',
              description: 'x'.repeat(501),
              url: 'https://tempo.xyz/developers/docs',
            },
          ],
        },
        source,
      ),
    ).toEqual([
      {
        type: 'related',
        title: 'Documentation home',
        href: '/docs',
      },
    ])
  })
})

describe('docs URL normalization', () => {
  it.each([
    ['/developers/docs/tools', '/docs/tools'],
    ['/docs/tools/', '/docs/tools'],
    ['/developers', '/'],
    ['/docs', '/docs'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeDocsRoutePath(input)).toBe(expected)
  })

  it('builds only canonical public docs URLs', () => {
    expect(canonicalDocsUrl('/docs/tools')).toBe('https://tempo.xyz/developers/docs/tools')
    expect(canonicalDocsUrl('/developers/docs/tools')).toBe(
      'https://tempo.xyz/developers/docs/tools',
    )
    expect(canonicalDocsUrl('/blog')).toBeUndefined()
  })

  it('selects new links when the Vocs route changes', () => {
    const manifest = {
      '/docs/tools': [{ type: 'related' as const, title: 'SDKs', href: '/docs/sdk' }],
      '/docs/sdk': [{ type: 'random' as const, title: 'Tools', href: '/docs/tools' }],
    }

    expect(relatedDocsForRoute(manifest, '/docs/tools')).toEqual(manifest['/docs/tools'])
    expect(relatedDocsForRoute(manifest, '/developers/docs/sdk')).toEqual(manifest['/docs/sdk'])
  })
})

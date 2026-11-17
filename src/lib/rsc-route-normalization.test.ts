import { describe, expect, it, vi } from 'vitest'
import { normalizeProxiedRscFetch, normalizeRscFetchUrl } from './rsc-route-normalization'

const currentHref = 'https://docs.tempo.xyz/docs/guide/payments/send-a-payment'
const origin = 'https://docs.tempo.xyz'

describe('normalizeRscFetchUrl', () => {
  it.each([
    [
      'keeps cross-origin RSC requests on the current origin',
      'https://tempo.com/RSC/R/docs/guide/payments.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/guide/payments.txt?query=',
    ],
    [
      'normalizes proxied developers route payloads',
      'https://tempo.com/RSC/R/developers/docs/tools.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=',
    ],
    [
      'normalizes the proxied developers root payload',
      'https://tempo.com/RSC/R/developers.txt?query=',
      'https://docs.tempo.xyz/RSC/R/_root.txt?query=',
    ],
    [
      'preserves search and hash fragments',
      'https://tempo.com/RSC/R/docs/tools.txt?query=abc#flight',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=abc#flight',
    ],
    [
      'leaves non-RSC asset requests alone',
      'https://tempo.com/assets/index.js',
      'https://tempo.com/assets/index.js',
    ],
    ['leaves relative non-RSC requests alone', '/api/og?title=Tools', '/api/og?title=Tools'],
  ])('%s', (_name, input, expected) => {
    expect(normalizeRscFetchUrl(input, currentHref, origin)).toBe(expected)
  })
})

describe('normalizeProxiedRscFetch', () => {
  it('normalizes the exact developers mount before Waku initializes', () => {
    const replaceState = vi.fn()
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        __tempoNormalizeProxiedRscFetch: false,
        fetch: vi.fn(),
        history: { replaceState, state: { key: 'value' } },
        location: {
          hash: '#start',
          hostname: 'tempo.com',
          href: 'https://tempo.com/developers?tab=docs#start',
          origin: 'https://tempo.com',
          pathname: '/developers',
          search: '?tab=docs',
        },
      },
    })

    try {
      Function(normalizeProxiedRscFetch)()
      expect(replaceState).toHaveBeenCalledWith({ key: 'value' }, '', '/developers/?tab=docs#start')
    } finally {
      Reflect.deleteProperty(globalThis, 'window')
    }
  })

  it.each([
    [
      'rewrites cross-origin RSC requests to the current origin',
      'https://tempo.com/RSC/R/docs/tools.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=',
    ],
    [
      'rewrites proxied developers RSC requests',
      'https://tempo.com/RSC/R/developers/docs/tools.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=',
    ],
    [
      'leaves non-RSC requests unchanged',
      'https://tempo.com/assets/index.js',
      'https://tempo.com/assets/index.js',
    ],
  ])('%s', async (_name, input, expected) => {
    const requests: unknown[] = []
    const fetch = (request: unknown) => {
      requests.push(request)
      return Promise.resolve(new Response())
    }
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        __tempoNormalizeProxiedRscFetch: false,
        fetch,
        location: {
          href: currentHref,
          origin,
        },
      },
    })

    try {
      Function(normalizeProxiedRscFetch)()
      await globalThis.window.fetch(input)
      expect(requests).toEqual([expected])
    } finally {
      Reflect.deleteProperty(globalThis, 'window')
    }
  })
})

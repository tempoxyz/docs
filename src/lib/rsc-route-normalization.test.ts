import { describe, expect, it } from 'vitest'
import { normalizeProxiedRscFetch } from '../pages/_layout'
import { normalizeRscFetchUrl } from './rsc-route-normalization'

const currentHref = 'https://docs.tempo.xyz/docs/guide/payments/send-a-payment'
const origin = 'https://docs.tempo.xyz'

describe('normalizeRscFetchUrl', () => {
  it.each([
    [
      'keeps cross-origin RSC requests on the current origin',
      'https://tempo.xyz/RSC/R/docs/guide/payments.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/guide/payments.txt?query=',
    ],
    [
      'normalizes proxied developers route payloads',
      'https://tempo.xyz/RSC/R/developers/docs/tools.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=',
    ],
    [
      'normalizes the proxied developers root payload',
      'https://tempo.xyz/RSC/R/developers.txt?query=',
      'https://docs.tempo.xyz/RSC/R/_root.txt?query=',
    ],
    [
      'preserves search and hash fragments',
      'https://tempo.xyz/RSC/R/docs/tools.txt?query=abc#flight',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=abc#flight',
    ],
    [
      'leaves non-RSC asset requests alone',
      'https://tempo.xyz/assets/index.js',
      'https://tempo.xyz/assets/index.js',
    ],
    ['leaves relative non-RSC requests alone', '/api/og?title=Tools', '/api/og?title=Tools'],
  ])('%s', (_name, input, expected) => {
    expect(normalizeRscFetchUrl(input, currentHref, origin)).toBe(expected)
  })
})

describe('normalizeProxiedRscFetch', () => {
  it.each([
    [
      'rewrites cross-origin RSC requests to the current origin',
      'https://tempo.xyz/RSC/R/docs/tools.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=',
    ],
    [
      'rewrites proxied developers RSC requests',
      'https://tempo.xyz/RSC/R/developers/docs/tools.txt?query=',
      'https://docs.tempo.xyz/RSC/R/docs/tools.txt?query=',
    ],
    [
      'leaves non-RSC requests unchanged',
      'https://tempo.xyz/assets/index.js',
      'https://tempo.xyz/assets/index.js',
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

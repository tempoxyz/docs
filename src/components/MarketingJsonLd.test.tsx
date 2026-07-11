import { describe, expect, it } from 'vitest'
import { createMarketingJsonLdSchema } from './MarketingJsonLd'

describe('MarketingJsonLd', () => {
  it.each([
    ['/', 'https://tempo.xyz/developers/'],
    ['/build', 'https://tempo.xyz/developers/build'],
  ])('uses the canonical developer URL for %s', (route, url) => {
    const schema = createMarketingJsonLdSchema({
      route,
      title: 'Tempo developers',
      description: 'Developer resources for Tempo.',
    })
    const page = schema['@graph'].find((entry) => entry['@type'] === 'WebPage')

    expect(page).toMatchObject({
      '@id': url,
      url,
      name: 'Tempo developers',
      description: 'Developer resources for Tempo.',
      isPartOf: { '@id': 'https://tempo.xyz/#website' },
      about: { '@id': 'https://tempo.xyz/#organization' },
      publisher: { '@id': 'https://tempo.xyz/#organization' },
    })
  })
})

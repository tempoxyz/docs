import { describe, expect, it } from 'vitest'
import { createMarketingJsonLdSchema } from './MarketingJsonLd'

describe('MarketingJsonLd', () => {
  it.each([
    ['/', 'https://tempo.com/developers/'],
    ['/build', 'https://tempo.com/developers/build'],
  ])('uses the canonical developer URL for %s', (route, url) => {
    const schema = createMarketingJsonLdSchema({
      route,
      title: 'Tempo developers',
      description: 'Developer resources for Tempo.',
    })
    const page = schema['@graph'].find((entry) => entry['@type'] === 'WebPage')
    const website = schema['@graph'].find((entry) => entry['@type'] === 'WebSite')
    const organization = schema['@graph'].find((entry) => entry['@type'] === 'Corporation')

    expect(page).toMatchObject({
      '@id': url,
      url,
      name: 'Tempo developers',
      description: 'Developer resources for Tempo.',
      isPartOf: { '@id': 'https://tempo.com/#website' },
      about: { '@id': 'https://tempo.com/#organization' },
      publisher: { '@id': 'https://tempo.com/#organization' },
    })
    expect(website).not.toHaveProperty('alternateName')
    expect(organization).not.toHaveProperty('alternateName')
  })
})

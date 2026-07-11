import {
  canonicalDevelopersUrl,
  serializeJsonLd,
  TEMPO_ORGANIZATION_ID,
  TEMPO_WEBSITE_ID,
  tempoOrganizationSchema,
  tempoWebsiteSchema,
} from '../lib/tempo-entity'

type MarketingJsonLdOptions = {
  route: string
  title: string
  description: string
}

export function createMarketingJsonLdSchema(options: MarketingJsonLdOptions) {
  const url = canonicalDevelopersUrl(options.route)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      tempoOrganizationSchema(),
      tempoWebsiteSchema(),
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: options.title,
        description: options.description,
        isPartOf: { '@id': TEMPO_WEBSITE_ID },
        about: { '@id': TEMPO_ORGANIZATION_ID },
        publisher: { '@id': TEMPO_ORGANIZATION_ID },
      },
    ],
  }
}

export default function MarketingJsonLd(options: MarketingJsonLdOptions) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML; content is escaped above.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(createMarketingJsonLdSchema(options)) }}
    />
  )
}

import { useRouter } from 'vocs'

const tempoSameAs = [
  'https://x.com/tempo',
  'https://twitter.com/tempo',
  'https://github.com/tempoxyz',
  'https://www.linkedin.com/company/tempoxyz',
  'https://www.crunchbase.com/organization/tempo-87e4',
]

const tempoKnowsAbout = [
  'stablecoin payments',
  'cross-border payments',
  'global payouts',
  'agentic payments',
  'machine payments',
  'enterprise settlement',
  'payment blockchains',
  'Layer 1 blockchain',
  'stablecoin infrastructure',
]

const description =
  'Tempo is a payments-first Layer 1 blockchain incubated by Stripe and Paradigm. Tempo documentation covers stablecoin payments, global payouts, agentic payments, APIs, wallets, and protocol specifications.'

type DocsJsonLdOptions = {
  path?: string
}

export function createDocsJsonLdSchema(options: DocsJsonLdOptions = {}) {
  const path = options.path || '/docs'
  const pathname = path.startsWith('/') ? path : `/${path}`
  const url = `https://docs.tempo.xyz${pathname}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://tempo.xyz/#organization',
        name: 'Tempo',
        url: 'https://tempo.xyz',
        description,
        sameAs: tempoSameAs,
        knowsAbout: tempoKnowsAbout,
      },
      {
        '@type': 'WebSite',
        '@id': 'https://docs.tempo.xyz/#website',
        name: 'Tempo Docs',
        url: 'https://docs.tempo.xyz',
        description,
        publisher: { '@id': 'https://tempo.xyz/#organization' },
      },
      {
        '@type': 'TechArticle',
        '@id': url,
        url,
        headline: 'Tempo documentation',
        description,
        isPartOf: { '@id': 'https://docs.tempo.xyz/#website' },
        about: { '@id': 'https://tempo.xyz/#organization' },
        publisher: { '@id': 'https://tempo.xyz/#organization' },
      },
    ],
  }
}

export function serializeJsonLd(schema: unknown) {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export default function DocsJsonLd(props: { path?: string }) {
  const { path } = useRouter()
  const schema = createDocsJsonLdSchema({
    path: props.path ?? path,
  })

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML; content is escaped above.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  )
}

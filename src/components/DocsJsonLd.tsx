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

export default function DocsJsonLd(props: { path: string }) {
  const pathname = props.path.startsWith('/') ? props.path : `/${props.path}`
  const url = `https://docs.tempo.xyz${pathname}`
  const schema = {
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

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD is serialized by React.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

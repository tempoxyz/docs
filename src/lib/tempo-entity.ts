export const TEMPO_ORIGIN = 'https://tempo.xyz'
export const TEMPO_DEVELOPERS_ORIGIN = `${TEMPO_ORIGIN}/developers`
export const TEMPO_ORGANIZATION_ID = `${TEMPO_ORIGIN}/#organization`
export const TEMPO_WEBSITE_ID = `${TEMPO_ORIGIN}/#website`

export const TEMPO_ENTITY_DESCRIPTION =
  'Tempo is a payments-first Layer 1 blockchain incubated by Stripe and Paradigm. Tempo is built for stablecoin payments, global payouts, agentic payments, and enterprise settlement.'

export const TEMPO_ALTERNATE_NAMES = ['Tempo Blockchain', 'tempo.xyz']

export const TEMPO_SAME_AS = [
  'https://x.com/tempo',
  'https://twitter.com/tempo',
  'https://github.com/tempoxyz',
  'https://www.linkedin.com/company/tempo',
  'https://www.crunchbase.com/organization/tempo-24b7',
  'https://www.wikidata.org/wiki/Q140472934',
]

export const TEMPO_KNOWS_ABOUT = [
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

export function canonicalDevelopersUrl(path = '/') {
  const pathname = path.startsWith('/') ? path : `/${path}`
  return pathname === '/' ? `${TEMPO_DEVELOPERS_ORIGIN}/` : `${TEMPO_DEVELOPERS_ORIGIN}${pathname}`
}

export function tempoOrganizationSchema() {
  return {
    '@type': 'Corporation',
    '@id': TEMPO_ORGANIZATION_ID,
    name: 'Tempo',
    alternateName: TEMPO_ALTERNATE_NAMES,
    url: TEMPO_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      '@id': `${TEMPO_ORIGIN}/#logo`,
      url: `${TEMPO_ORIGIN}/apple-touch-icon.png`,
      contentUrl: `${TEMPO_ORIGIN}/apple-touch-icon.png`,
      width: 180,
      height: 180,
    },
    description: TEMPO_ENTITY_DESCRIPTION,
    sameAs: TEMPO_SAME_AS,
    knowsAbout: TEMPO_KNOWS_ABOUT,
  }
}

export function tempoWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': TEMPO_WEBSITE_ID,
    name: 'Tempo',
    alternateName: TEMPO_ALTERNATE_NAMES,
    url: TEMPO_ORIGIN,
    description: TEMPO_ENTITY_DESCRIPTION,
    publisher: { '@id': TEMPO_ORGANIZATION_ID },
  }
}

export function serializeJsonLd(schema: unknown) {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

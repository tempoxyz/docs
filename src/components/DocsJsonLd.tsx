import { useRouter } from 'vocs'
import {
  canonicalDevelopersUrl,
  serializeJsonLd,
  TEMPO_ENTITY_DESCRIPTION,
  TEMPO_ORGANIZATION_ID,
  TEMPO_WEBSITE_ID,
  tempoOrganizationSchema,
  tempoWebsiteSchema,
} from '../lib/tempo-entity'

type DocsJsonLdOptions = {
  path?: string
  title?: string
  description?: string
}

export function createDocsJsonLdSchema(options: DocsJsonLdOptions = {}) {
  const url = canonicalDevelopersUrl(options.path || '/docs')
  const title = options.title || titleFromPath(options.path || '/docs')
  const description = options.description || TEMPO_ENTITY_DESCRIPTION

  return {
    '@context': 'https://schema.org',
    '@graph': [
      tempoOrganizationSchema(),
      tempoWebsiteSchema(),
      {
        '@type': ['WebPage', 'TechArticle'],
        '@id': url,
        url,
        name: title,
        headline: title,
        description,
        isPartOf: { '@id': TEMPO_WEBSITE_ID },
        about: { '@id': TEMPO_ORGANIZATION_ID },
        publisher: { '@id': TEMPO_ORGANIZATION_ID },
      },
    ],
  }
}

function titleFromPath(path: string) {
  const segment = path.split('/').filter(Boolean).at(-1)
  if (!segment || segment === 'docs') return 'Tempo documentation'

  const labels: Record<string, string> = {
    api: 'Tempo API',
    cli: 'Tempo CLI',
    rpc: 'RPC',
    sdk: 'Tempo SDKs',
    tip20: 'TIP-20',
    tip403: 'TIP-403',
  }
  if (labels[segment]) return labels[segment]

  return segment
    .split('-')
    .map((word, index) => (index === 0 ? `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}` : word))
    .join(' ')
}

export default function DocsJsonLd(props: { path?: string; title?: string; description?: string }) {
  const { path } = useRouter()
  const schema = createDocsJsonLdSchema({
    path: props.path ?? path,
    title: props.title,
    description: props.description,
  })

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML; content is escaped above.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  )
}

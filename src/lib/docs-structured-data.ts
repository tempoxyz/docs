type DocsFrontmatter = {
  description?: string
  title?: string
}

type DocsStructuredDataContext = {
  frontmatter?: DocsFrontmatter
}

/**
 * Builds the docs JSON-LD head entry from Vocs' page context.
 *
 * Vocs serializes this callback for the client, so every runtime dependency must
 * remain inside the function body.
 */
export function docsStructuredDataHead(path: string, { frontmatter }: DocsStructuredDataContext) {
  const pagePath = path.startsWith('/') ? path : `/${path}`
  if (pagePath !== '/docs' && !pagePath.startsWith('/docs/')) return undefined

  const title = frontmatter?.title?.trim()
  if (!title) return { meta: { articleModifiedTime: false as const } }

  const developersUrl = 'https://tempo.xyz/developers'
  const docsUrl = `${developersUrl}/docs`
  const organizationId = 'https://tempo.xyz/#organization'
  const websiteId = 'https://tempo.xyz/#website'
  const entityDescription =
    'Tempo is a payments-first Layer 1 blockchain built for stablecoin payments, global payouts, agentic payments, and enterprise settlement.'
  const url = `${developersUrl}${pagePath}`
  const description = frontmatter?.description?.trim()
  const breadcrumbId = `${url}#breadcrumb`
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Tempo developers',
      item: `${developersUrl}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Tempo Docs',
      item: docsUrl,
    },
  ]

  if (pagePath !== '/docs') {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 3,
      name: title,
      item: url,
    })
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Corporation',
        '@id': organizationId,
        name: 'Tempo',
        url: 'https://tempo.xyz',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://tempo.xyz/#logo',
          url: 'https://tempo.xyz/apple-touch-icon.png',
          contentUrl: 'https://tempo.xyz/apple-touch-icon.png',
          width: 180,
          height: 180,
        },
        description: entityDescription,
        sameAs: [
          'https://x.com/tempo',
          'https://twitter.com/tempo',
          'https://github.com/tempoxyz',
          'https://www.linkedin.com/company/tempo',
        ],
        knowsAbout: [
          'stablecoin payments',
          'cross-border payments',
          'global payouts',
          'agentic payments',
          'machine payments',
          'enterprise settlement',
          'payment blockchains',
          'Layer 1 blockchain',
          'stablecoin infrastructure',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: 'Tempo',
        url: 'https://tempo.xyz',
        description: entityDescription,
        publisher: { '@id': organizationId },
      },
      {
        '@type': ['WebPage', 'TechArticle'],
        '@id': url,
        url,
        name: title,
        headline: title,
        ...(description ? { description } : {}),
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
        publisher: { '@id': organizationId },
        breadcrumb: { '@id': breadcrumbId },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: breadcrumbs,
      },
    ],
  }
  const innerHTML = JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')

  return {
    meta: { articleModifiedTime: false as const },
    script: [{ type: 'application/ld+json', innerHTML }],
  }
}

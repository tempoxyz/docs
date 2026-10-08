type DocsFrontmatter = {
  description?: string
  title?: string
  ogImage?: string
}

type DocsStructuredDataContext = {
  frontmatter?: DocsFrontmatter
}

type DocsHeadTags = {
  canonical?: string
  meta: {
    ogType?: 'article'
    ogImage?: string
    articleModifiedTime?: false
  }
  script?: { type: 'application/ld+json'; innerHTML: string }[]
}

/**
 * Builds the docs JSON-LD head entry from Vocs' page context.
 *
 * Vocs serializes this callback for the client, so every runtime dependency must
 * remain inside the function body.
 */
export function docsStructuredDataHead(
  path: string,
  { frontmatter }: DocsStructuredDataContext,
): DocsHeadTags | undefined {
  const pagePath = path.startsWith('/') ? path : `/${path}`
  // Keep article type in the native head owner: sibling overrides can race
  // with Vocs' default website tag during streamed prerendering.
  if (pagePath.startsWith('/blog/')) {
    return {
      meta: {
        ogType: 'article' as const,
        ...(frontmatter?.ogImage ? { ogImage: frontmatter.ogImage } : {}),
      },
    }
  }
  if (
    pagePath !== '/' &&
    pagePath !== '/get-started' &&
    !pagePath.startsWith('/get-started/') &&
    !pagePath.startsWith('/docs/')
  ) {
    return undefined
  }

  const developersUrl = 'https://tempo.xyz/developers'
  // The public mount has no trailing slash. Match its redirect policy and the
  // URLs used by the docs graph instead of Vocs' default baseUrl + "/".
  const canonical = pagePath === '/' ? { canonical: developersUrl } : {}
  const title = frontmatter?.title?.trim()
  if (!title) return { ...canonical, meta: { articleModifiedTime: false as const } }

  const docsUrl = developersUrl
  const organizationId = 'https://tempo.xyz/#organization'
  const websiteId = 'https://tempo.xyz/#website'
  const entityDescription =
    'Tempo is a payments-first Layer 1 blockchain built for stablecoin payments, global payouts, agentic payments, and enterprise settlement.'
  const url = `${developersUrl}${pagePath === '/' ? '' : pagePath}`
  const description = frontmatter?.description?.trim()
  const breadcrumbId = `${url}#breadcrumb`
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Tempo Docs',
      item: docsUrl,
    },
  ]

  if (pagePath !== '/') {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 2,
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
    ...canonical,
    meta: { articleModifiedTime: false as const },
    script: [{ type: 'application/ld+json', innerHTML }],
  }
}

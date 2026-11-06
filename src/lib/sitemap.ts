const TEMPLATE_URL_PATTERN = /<url>\s*<loc>([^<]*\/\[[^\]]+\][^<]*)<\/loc>[\s\S]*?<\/url>\s*/g
const LOCATION_PATTERN = /<loc>([^<]+)<\/loc>/g

/** Check built content routes without requiring the retired `/docs` landing page. */
export function sitemapCoverage(sitemap: string, routes: readonly string[]) {
  const locations = new Set(
    Array.from(sitemap.matchAll(LOCATION_PATTERN), ([, location]) => location.replace(/\/$/, '')),
  )
  const indexUrl = [...locations].find((location) => /\/(?:get-started|docs\/api)$/.test(location))
  if (!indexUrl) throw new Error('Could not resolve the site base URL from the sitemap')
  const baseUrl = indexUrl.replace(/\/(?:get-started|docs\/api)$/, '')
  const urls = [...new Set(routes)].map((route) => {
    const pathname = route.replace(/^\/+|\/+$/g, '')
    return pathname
      ? `${baseUrl}/${pathname.split('/').map(encodeURIComponent).join('/')}`
      : baseUrl
  })
  return { urls, missing: urls.filter((url) => !locations.has(url)) }
}

export function finalizeSitemap(
  sitemap: string,
  openApiRouteSlugs: readonly string[] = [],
): string {
  let withoutTemplates = sitemap.replace(TEMPLATE_URL_PATTERN, '')

  const existingLocations = new Set(
    Array.from(withoutTemplates.matchAll(LOCATION_PATTERN), ([, location]) => location),
  )

  // Marketing and blog pages now live on tempo.xyz, not the docs mount.
  const docsIndexUrl = Array.from(existingLocations).find((location) =>
    /\/(?:get-started|docs\/api)\/?$/.test(location),
  )
  const siteBaseUrl = docsIndexUrl?.replace(/(?:get-started|docs\/api)\/?$/, '')
  if (siteBaseUrl) {
    // The mounted docs homepage uses a canonical URL without a trailing slash.
    withoutTemplates = withoutTemplates.replace(LOCATION_PATTERN, (entry, location: string) =>
      location === siteBaseUrl && new URL(location).pathname !== '/'
        ? `<loc>${location.replace(/\/$/, '')}</loc>`
        : entry,
    )
    withoutTemplates = withoutTemplates.replace(
      /<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>\s*/g,
      (entry, location: string) => {
        const relativePath = location.startsWith(siteBaseUrl)
          ? location.slice(siteBaseUrl.length)
          : undefined
        if (
          location === siteBaseUrl.replace(/\/$/, '') ||
          relativePath === '' ||
          /^get-started(?:\/|$)/.test(relativePath ?? '') ||
          /^docs\/.+/.test(relativePath ?? '')
        ) {
          return entry
        }
        existingLocations.delete(location)
        return ''
      },
    )
  }

  const uniqueOpenApiSlugs = [...new Set(openApiRouteSlugs)].sort((a, b) => a.localeCompare(b))
  if (uniqueOpenApiSlugs.length === 0) return withoutTemplates
  if (!withoutTemplates.includes('</urlset>')) {
    throw new Error('Could not find the sitemap urlset closing tag')
  }

  const entries: { lastmod?: string; location: string }[] = []

  if (uniqueOpenApiSlugs.length > 0) {
    const openApiIndexUrl = Array.from(existingLocations).find((location) =>
      /\/docs\/api\/?$/.test(location),
    )
    if (!openApiIndexUrl) {
      throw new Error('Could not resolve the OpenAPI base URL from the sitemap')
    }
    const openApiBaseUrl = `${openApiIndexUrl.replace(/\/$/, '')}/`
    entries.push(
      ...uniqueOpenApiSlugs.map((slug) => ({
        location: `${openApiBaseUrl}${slug.split('/').map(encodeURIComponent).join('/')}`,
      })),
    )
  }

  const newEntries = entries
    .filter(({ location }) => !existingLocations.has(location))
    .map(({ location, lastmod }) =>
      [
        '  <url>',
        `    <loc>${location}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : undefined,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )

  if (newEntries.length === 0) return withoutTemplates

  return withoutTemplates.replace('</urlset>', `${newEntries.join('\n')}\n</urlset>`)
}

const TEMPLATE_URL_PATTERN = /<url>\s*<loc>([^<]*\/\[[^\]]+\][^<]*)<\/loc>[\s\S]*?<\/url>\s*/g
const LOCATION_PATTERN = /<loc>([^<]+)<\/loc>/g
const URL_ENTRY_PATTERN = /<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>\s*/g

// Docs pages are served at tempo.xyz/docs, outside the /developers mount that keeps the blog.
function docsBaseFor(siteBaseUrl: string) {
  return siteBaseUrl.replace(/developers\/$/, '')
}

/** Check built content routes against the sitemap: docs at the docs base, the blog at the site base. */
export function sitemapCoverage(sitemap: string, routes: readonly string[]) {
  const locations = new Set(
    Array.from(sitemap.matchAll(LOCATION_PATTERN), ([, location]) => location.replace(/\/$/, '')),
  )
  const blogIndexUrl = [...locations].find((location) => /\/blog$/.test(location))
  const docsIndexUrl = [...locations].find((location) => /\/docs(?:\/api)?$/.test(location))
  if (!blogIndexUrl && !docsIndexUrl) {
    throw new Error('Could not resolve the site base URL from the sitemap')
  }
  const siteBaseUrl = blogIndexUrl
    ? blogIndexUrl.replace(/blog$/, '')
    : `${docsIndexUrl?.replace(/docs(?:\/api)?$/, '')}`
  const docsBaseUrl = blogIndexUrl
    ? docsBaseFor(siteBaseUrl)
    : `${docsIndexUrl?.replace(/docs(?:\/api)?$/, '')}`
  const urls = [...new Set(routes)].map((route) => {
    const pathname = route.replace(/^\/+|\/+$/g, '')
    const baseUrl = /^docs(?:\/|$)/.test(pathname) ? docsBaseUrl : siteBaseUrl
    return pathname
      ? `${baseUrl}${pathname.split('/').map(encodeURIComponent).join('/')}`
      : baseUrl.replace(/\/$/, '')
  })
  return { urls, missing: urls.filter((url) => !locations.has(url)) }
}

export type BlogSitemapEntry = {
  slug: string
  lastmod?: string
}

export function finalizeSitemap(
  sitemap: string,
  blogPosts: readonly BlogSitemapEntry[],
  openApiRouteSlugs: readonly string[] = [],
): string {
  let blogBaseUrl: string | undefined

  let withoutTemplates = sitemap.replace(TEMPLATE_URL_PATTERN, (_entry, location: string) => {
    const blogTemplate = /^(.*\/blog\/)\[slug\]\/?$/.exec(location)
    if (blogTemplate) blogBaseUrl = blogTemplate[1]
    return ''
  })

  const initialLocations = new Set(
    Array.from(withoutTemplates.matchAll(LOCATION_PATTERN), ([, location]) => location),
  )

  if (!blogBaseUrl) {
    const blogIndexUrl = Array.from(initialLocations).find((location) =>
      /\/blog\/?$/.test(location),
    )
    if (blogIndexUrl) blogBaseUrl = `${blogIndexUrl.replace(/\/$/, '')}/`
  }

  // Redirected marketing pages are not canonical content. Keep the sitemap
  // limited to the docs and blog surfaces, including when finalizing older output.
  const docsLocation = Array.from(initialLocations).find((location) =>
    /\/docs(?:\/|$)/.test(location),
  )
  const siteBaseUrl =
    blogBaseUrl?.replace(/blog\/$/, '') ?? docsLocation?.replace(/docs(?:\/.*)?$/, '')
  if (siteBaseUrl) {
    const docsBaseUrl = docsBaseFor(siteBaseUrl)
    withoutTemplates = withoutTemplates.replace(URL_ENTRY_PATTERN, (entry, location: string) => {
      const docsPath = [siteBaseUrl, docsBaseUrl]
        .filter((baseUrl) => location.startsWith(baseUrl))
        .map((baseUrl) => location.slice(baseUrl.length))
        .find((relativePath) => /^docs(?:\/|$)/.test(relativePath))
      if (docsPath !== undefined) {
        return entry.replace(
          `<loc>${location}</loc>`,
          `<loc>${docsBaseUrl}${docsPath.replace(/\/$/, '')}</loc>`,
        )
      }
      if (
        location.startsWith(siteBaseUrl) &&
        /^blog(?:\/|$)/.test(location.slice(siteBaseUrl.length))
      ) {
        return entry
      }
      return ''
    })
  }

  const existingLocations = new Set(
    Array.from(withoutTemplates.matchAll(LOCATION_PATTERN), ([, location]) => location),
  )

  const uniqueBlogPosts = [
    ...new Map(blogPosts.map((post) => [post.slug, post] as const)).values(),
  ].sort((a, b) => a.slug.localeCompare(b.slug))
  const uniqueOpenApiSlugs = [...new Set(openApiRouteSlugs)].sort((a, b) => a.localeCompare(b))
  if (uniqueBlogPosts.length === 0 && uniqueOpenApiSlugs.length === 0) return withoutTemplates
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

  if (uniqueBlogPosts.length > 0) {
    if (!blogBaseUrl) throw new Error('Could not resolve the blog base URL from the sitemap')
    entries.push(
      ...uniqueBlogPosts.map(({ slug, lastmod }) => ({
        location: `${blogBaseUrl}${encodeURIComponent(slug)}`,
        lastmod,
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

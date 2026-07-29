const TEMPLATE_URL_PATTERN = /<url>\s*<loc>([^<]*\/\[[^\]]+\][^<]*)<\/loc>[\s\S]*?<\/url>\s*/g
const LOCATION_PATTERN = /<loc>([^<]+)<\/loc>/g

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

  const withoutTemplates = sitemap.replace(TEMPLATE_URL_PATTERN, (_entry, location: string) => {
    const blogTemplate = /^(.*\/blog\/)\[slug\]\/?$/.exec(location)
    if (blogTemplate) blogBaseUrl = blogTemplate[1]
    return ''
  })

  const existingLocations = new Set(
    Array.from(withoutTemplates.matchAll(LOCATION_PATTERN), ([, location]) => location),
  )

  if (!blogBaseUrl) {
    const blogIndexUrl = Array.from(existingLocations).find((location) =>
      /\/blog\/?$/.test(location),
    )
    if (blogIndexUrl) blogBaseUrl = `${blogIndexUrl.replace(/\/$/, '')}/`
  }

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
        location: `${openApiBaseUrl}${encodeURIComponent(slug)}`,
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

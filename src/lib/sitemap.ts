const TEMPLATE_URL_PATTERN = /<url>\s*<loc>([^<]*\/\[[^\]]+\][^<]*)<\/loc>[\s\S]*?<\/url>\s*/g
const LOCATION_PATTERN = /<loc>([^<]+)<\/loc>/g

export function finalizeSitemap(
  sitemap: string,
  blogPostSlugs: readonly string[],
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

  const uniqueBlogSlugs = [...new Set(blogPostSlugs)].sort((a, b) => a.localeCompare(b))
  const uniqueOpenApiSlugs = [...new Set(openApiRouteSlugs)].sort((a, b) => a.localeCompare(b))
  if (uniqueBlogSlugs.length === 0 && uniqueOpenApiSlugs.length === 0) return withoutTemplates
  if (!withoutTemplates.includes('</urlset>')) {
    throw new Error('Could not find the sitemap urlset closing tag')
  }

  const locations: string[] = []

  if (uniqueOpenApiSlugs.length > 0) {
    const openApiIndexUrl = Array.from(existingLocations).find((location) =>
      /\/docs\/api\/?$/.test(location),
    )
    if (!openApiIndexUrl) {
      throw new Error('Could not resolve the OpenAPI base URL from the sitemap')
    }
    const openApiBaseUrl = `${openApiIndexUrl.replace(/\/$/, '')}/`
    locations.push(
      ...uniqueOpenApiSlugs.map((slug) => `${openApiBaseUrl}${encodeURIComponent(slug)}`),
    )
  }

  if (uniqueBlogSlugs.length > 0) {
    if (!blogBaseUrl) throw new Error('Could not resolve the blog base URL from the sitemap')
    locations.push(...uniqueBlogSlugs.map((slug) => `${blogBaseUrl}${encodeURIComponent(slug)}`))
  }

  const entries = locations
    .filter((location) => !existingLocations.has(location))
    .map((location) => `  <url>\n    <loc>${location}</loc>\n  </url>`)

  if (entries.length === 0) return withoutTemplates

  return withoutTemplates.replace('</urlset>', `${entries.join('\n')}\n</urlset>`)
}

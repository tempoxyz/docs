/**
 * Search metadata rules shared by the frontmatter lint (`seo-metadata.test.ts`)
 * and the post-build HTML check (`scripts/check-seo.ts`).
 *
 * Keep this module free of imports so Node can run the build check with
 * `--experimental-strip-types`.
 */

/** Public origin of the docs mount. Mirrors `canonicalDevelopersOrigin`. */
export const seoCanonicalOrigin = 'https://tempo.xyz/developers'
export const docsTitleSuffix = ' | Tempo Docs'
/** Shorter brand suffix allowed for the Resources explainers. */
export const explainerTitleSuffix = ' | Tempo'
export const maxTitleLength = 60
export const minDescriptionLength = 50
export const maxDescriptionLength = 160

/** Returns the public canonical URL for a docs route, with no trailing slash. */
export function canonicalUrlForRoute(route: string): string {
  const pathname = `/${route.replace(/^\/+|\/+$/g, '')}`
  return pathname === '/' ? seoCanonicalOrigin : `${seoCanonicalOrigin}${pathname}`
}

/** Title suffixes a route may end with. Resources explainers may use the brand suffix. */
export function allowedTitleSuffixes(route: string): readonly string[] {
  return /^\/docs\/resources\/guides\/[^/]+$/.test(route)
    ? [docsTitleSuffix, explainerTitleSuffix]
    : [docsTitleSuffix]
}

/** Lists the ways a rendered document title breaks the docs title rules. */
export function titleProblems(route: string, title: string | undefined): string[] {
  if (!title?.trim()) return ['missing title']
  const problems: string[] = []
  const suffixes = allowedTitleSuffixes(route)
  if (!suffixes.some((suffix) => title.endsWith(suffix) && title.length > suffix.length))
    problems.push(`title must end with ${suffixes.map((suffix) => `"${suffix}"`).join(' or ')}`)
  if (title.length > maxTitleLength)
    problems.push(`title is ${title.length} characters (max ${maxTitleLength})`)
  if (title !== title.trim() || /\s{2}/.test(title)) problems.push('title has extra whitespace')
  return problems
}

/** Lists the ways a page description breaks the docs description rules. */
export function descriptionProblems(description: string | undefined): string[] {
  if (!description?.trim()) return ['missing description']
  const { length } = description.trim()
  if (length < minDescriptionLength)
    return [`description is ${length} characters (min ${minDescriptionLength})`]
  if (length > maxDescriptionLength)
    return [`description is ${length} characters (max ${maxDescriptionLength})`]
  return []
}

/** Finds titles used by more than one route, ignoring case. */
export function duplicateTitles(pages: readonly { route: string; title: string }[]) {
  const routesByTitle = new Map<string, string[]>()
  for (const { route, title } of pages) {
    const key = title.trim().toLowerCase()
    routesByTitle.set(key, [...(routesByTitle.get(key) ?? []), route])
  }
  return [...routesByTitle.entries()]
    .filter(([, routes]) => routes.length > 1)
    .map(([title, routes]) => ({ title, routes }))
}

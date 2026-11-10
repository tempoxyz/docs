/**
 * Rewrites public links while preserving Waku's internal route values. Docs pages resolve under
 * `publicDocsUrl` (such as https://tempo.xyz/docs); llms.txt, SKILL.md and Markdown exports
 * resolve under `publicDevelopersUrl` (such as https://tempo.xyz/developers).
 */
export function canonicalizeGeneratedDeveloperLinks(
  content: string,
  publicDocsUrl: string,
  publicDevelopersUrl = `${publicDocsUrl.replace(/\/docs\/?$/, '')}/developers`,
) {
  const docsUrl = publicDocsUrl.replace(/\/$/, '')
  const siteUrl = docsUrl.replace(/\/docs$/, '')
  const developersUrl = publicDevelopersUrl.replace(/\/$/, '')
  function canonicalUrl(value: string) {
    const [, pathname = '', suffix = ''] = /^([^?#]*)(.*)$/.exec(value) ?? []
    const route = pathname.replace(/^\/developers(?=\/|$)/, '')
    if (['/llms.txt', '/llms-full.txt', '/SKILL.md', '/index.md'].includes(route))
      return `${developersUrl}${route}${suffix}`
    if (route === '/' || route === '' || route === '/docs') {
      // Empty hrefs and fragment-only links retain their current-page meaning.
      return pathname ? `${docsUrl}${suffix}` : value
    }
    if (route.startsWith('/docs/')) return `${siteUrl}${route}${suffix}`
    return value
  }

  return content
    .replace(
      /\b(href|to)=(["'])([^"']*)\2/g,
      (_match, key, quote, url: string) => `${key}=${quote}${canonicalUrl(url)}${quote}`,
    )
    .replace(/"href":"([^"]*)"/g, (_match, url: string) => `"href":"${canonicalUrl(url)}"`)
    .replace(
      /\\"href\\":\\"([^"\\]*)\\"/g,
      (_match, url: string) => `\\"href\\":\\"${canonicalUrl(url)}\\"`,
    )
    .replace(/\]\(([^)\s]+)\)/g, (_match, url: string) => `](${canonicalUrl(url)})`)
}

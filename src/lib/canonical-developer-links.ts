/** Rewrites public links while preserving Waku's internal route values. */
export function canonicalizeGeneratedDeveloperLinks(content: string, publicDocsUrl: string) {
  const siteUrl = publicDocsUrl.replace(/\/docs\/?$/, '')
  function canonicalUrl(value: string) {
    const [, pathname = '', suffix = ''] = /^([^?#]*)(.*)$/.exec(value) ?? []
    const route = pathname.replace(/^\/developers(?=\/|$)/, '')
    if (['/llms.txt', '/llms-full.txt', '/SKILL.md', '/index.md'].includes(route))
      return `${siteUrl}${route}${suffix}`
    if (route === '/' || route === '' || route === '/docs') {
      // Empty hrefs and fragment-only links retain their current-page meaning.
      return pathname ? `${siteUrl}${suffix}` : value
    }
    if (
      route === '/get-started' ||
      route === '/get-started.md' ||
      route.startsWith('/get-started/') ||
      route.startsWith('/docs/')
    ) {
      return `${siteUrl}${route}${suffix}`
    }
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

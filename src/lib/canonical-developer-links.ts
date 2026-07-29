/**
 * Rewrites generated public link targets without changing Vocs' internal route
 * values. The docs app routes at `/docs` internally, but production is mounted
 * on a different origin path, so a root-relative href otherwise takes a 308 hop.
 */
export function canonicalizeGeneratedDeveloperLinks(content: string, publicDevelopersUrl: string) {
  return content
    .replace(/href=(["'])(?:\/developers)?\/docs(?=\/|[#?]|\1)/g, `href=$1${publicDevelopersUrl}`)
    .replace(/to=(["'])(?:\/developers)?\/docs(?=\/|[#?]|\1)/g, `to=$1${publicDevelopersUrl}`)
    .replace(/"href":"(?:\/developers)?\/docs(?=\/|[#?]|")/g, `"href":"${publicDevelopersUrl}`)
    .replace(
      /\\"href\\":\\"(?:\/developers)?\/docs(?=\/|[#?]|\\")/g,
      `\\"href\\":\\"${publicDevelopersUrl}`,
    )
    .replace(/\]\((?:\/developers)?\/docs(?=\/|[#?]|\))/g, `](${publicDevelopersUrl}`)
}

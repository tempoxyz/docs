const publicDevelopersPath = '/developers/docs'

/**
 * Rewrites generated public link targets without changing Vocs' internal route
 * values. The docs app routes at `/docs` internally, but production is mounted
 * at `/developers`, so a bare href otherwise takes an unnecessary 308 hop.
 */
export function canonicalizeGeneratedDeveloperLinks(content: string) {
  return content
    .replace(/href=(["'])\/docs(?=\/|[#?]|\1)/g, `href=$1${publicDevelopersPath}`)
    .replace(/to=(["'])\/docs(?=\/|[#?]|\1)/g, `to=$1${publicDevelopersPath}`)
    .replace(/"href":"\/docs(?=\/|[#?]|")/g, `"href":"${publicDevelopersPath}`)
    .replace(/\\"href\\":\\"\/docs(?=\/|[#?]|\\")/g, `\\"href\\":\\"${publicDevelopersPath}`)
    .replace(/\]\(\/docs(?=\/|[#?]|\))/g, `](${publicDevelopersPath}`)
}

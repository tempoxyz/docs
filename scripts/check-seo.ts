import fs from 'node:fs/promises'
import path from 'node:path'
import { canonicalUrlForRoute, titleProblems } from '../src/lib/seo-metadata.ts'

// Checks the prerendered HTML after `vite build`: every docs page in the
// sitemap, and every built docs page, has exactly one canonical link equal to
// its public sitemap URL and one document title that follows the title rules.

const publicDirectory = path.resolve(process.argv[2] ?? 'dist/public')
const sitemapPath = path.join(publicDirectory, 'sitemap.xml')
// Vocs titles generated OpenAPI groups "<Group> · <API title>" without the
// site title template. Report them, but only fail on authored page titles.
const generatedOpenApiTitle = /^[^|]+ · Tempo API$/

const sitemap = await fs.readFile(sitemapPath, 'utf-8').catch((error: NodeJS.ErrnoException) => {
  if (error.code !== 'ENOENT') throw error
  return undefined
})
if (!sitemap) {
  if (process.env.VITE_E2E === 'true' || process.env.VERCEL_ENV !== 'production') {
    console.log(
      `Skipped the SEO check: no sitemap at ${path.relative(process.cwd(), sitemapPath)}.`,
    )
    process.exit(0)
  }
  throw new Error(`Missing production sitemap at ${sitemapPath}`)
}

const locations = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, location]) => location)
const indexLocation = locations.find((location) => /\/(?:get-started|docs\/api)\/?$/.test(location))
if (!indexLocation) throw new Error('Could not resolve the site base URL from the sitemap')
const siteBase = indexLocation.replace(/\/(?:get-started|docs\/api)\/?$/, '')

const sitemapRoutes = new Map<string, string>()
for (const location of locations) {
  if (!location.startsWith(siteBase)) continue
  const route = decodeURIComponent(location.slice(siteBase.length)).replace(/\/+$/, '') || '/'
  sitemapRoutes.set(route, location)
}

async function builtRoutes(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => [])
  const routes = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return builtRoutes(entryPath)
      if (!entry.isFile() || entry.name !== 'index.html') return []
      return [`/${path.relative(publicDirectory, directory).split(path.sep).join('/')}`]
    }),
  )
  return routes.flat()
}

const routes = [
  ...new Set([
    ...sitemapRoutes.keys(),
    '/',
    ...(await builtRoutes(path.join(publicDirectory, 'docs'))),
    ...(await builtRoutes(path.join(publicDirectory, 'get-started'))),
  ]),
].sort((a, b) => a.localeCompare(b))

const errors: string[] = []
const generatedTitles: string[] = []

for (const route of routes) {
  const file = path.join(
    publicDirectory,
    route === '/' ? 'index.html' : route.slice(1),
    route === '/' ? '' : 'index.html',
  )
  const html = await fs.readFile(file, 'utf-8').catch(() => undefined)
  if (html === undefined) {
    errors.push(
      `${route}: listed in the sitemap but no built HTML at ${path.relative(process.cwd(), file)}`,
    )
    continue
  }
  if (!sitemapRoutes.has(route)) errors.push(`${route}: built page is missing from the sitemap`)

  const head = html.slice(0, Math.max(html.indexOf('</head>'), 0))
  const canonicals = Array.from(
    head.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi),
    ([tag]) => tag.match(/\bhref=["']([^"']*)["']/i)?.[1],
  )
  const expected = canonicalUrlForRoute(route)
  if (canonicals.length !== 1) {
    errors.push(`${route}: expected one canonical link, found ${canonicals.length}`)
  } else if (canonicals[0] !== expected) {
    errors.push(`${route}: canonical ${canonicals[0]} does not match ${expected}`)
  }
  const sitemapUrl = sitemapRoutes.get(route)
  if (sitemapUrl && siteBase === canonicalUrlForRoute('/') && sitemapUrl !== expected) {
    errors.push(`${route}: sitemap URL ${sitemapUrl} does not match canonical ${expected}`)
  }

  const titles = Array.from(
    head.matchAll(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/gi),
    ([, title]) =>
      (title ?? '')
        .replaceAll('&amp;', '&')
        .replaceAll('&#x27;', "'")
        .replaceAll('&#39;', "'")
        .replaceAll('&quot;', '"'),
  )
  if (titles.length !== 1) {
    errors.push(`${route}: expected one document title, found ${titles.length}`)
    continue
  }
  const [title] = titles as [string]
  if (generatedOpenApiTitle.test(title)) {
    generatedTitles.push(`${route}: ${title}`)
    continue
  }
  for (const problem of titleProblems(route, title)) errors.push(`${route}: ${problem} (${title})`)
}

if (errors.length > 0) {
  throw new Error(`SEO check failed for ${errors.length} issue(s):\n${errors.join('\n')}`)
}

console.log(
  `Validated canonical links and titles for ${routes.length} built pages in ${path.relative(process.cwd(), publicDirectory)}.`,
)
if (generatedTitles.length > 0) {
  console.log(
    `${generatedTitles.length} generated OpenAPI pages keep Vocs' "<Group> · Tempo API" title:\n${generatedTitles.join('\n')}`,
  )
}

import fs from 'node:fs/promises'
import path from 'node:path'

const vercelStaticDirectory = path.resolve('.vercel/output/static')
const sitemapPath = path.join(vercelStaticDirectory, 'sitemap.xml')
const docsOutputDirectory = path.join(vercelStaticDirectory, 'docs')

const [sitemap, docsRouteFiles] = await Promise.all([
  fs.readFile(sitemapPath, 'utf-8'),
  findRouteIndexFiles(docsOutputDirectory),
])

const sitemapLocations = new Set(
  Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, location]) => location),
)
const docsIndexUrl = Array.from(sitemapLocations).find((location) => /\/docs\/?$/.test(location))

if (!docsIndexUrl) {
  throw new Error(`Could not resolve the docs base URL from ${sitemapPath}`)
}

if (docsRouteFiles.length === 0) {
  throw new Error(`Could not find generated docs routes in ${docsOutputDirectory}`)
}

const normalizedDocsIndexUrl = docsIndexUrl.replace(/\/$/, '')
const canonicalBaseUrl = normalizedDocsIndexUrl.slice(0, -'/docs'.length)
const canonicalDocsUrls = docsRouteFiles
  .map((file) => path.relative(vercelStaticDirectory, path.dirname(file)))
  .map((route) => route.split(path.sep).map(encodeURIComponent).join('/'))
  .map((route) => `${canonicalBaseUrl}/${route}`)
  .sort((a, b) => a.localeCompare(b))
const missingDocsUrls = canonicalDocsUrls.filter((location) => !sitemapLocations.has(location))

if (missingDocsUrls.length > 0) {
  throw new Error(
    `Vercel sitemap is missing ${missingDocsUrls.length} canonical docs routes:\n${missingDocsUrls.join('\n')}`,
  )
}

console.log(
  `Validated ${canonicalDocsUrls.length} canonical docs routes in ${path.relative(process.cwd(), sitemapPath)}.`,
)

async function findRouteIndexFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return findRouteIndexFiles(entryPath)
      if (entry.isFile() && entry.name === 'index.html') return [entryPath]
      return []
    }),
  )
  return files.flat()
}

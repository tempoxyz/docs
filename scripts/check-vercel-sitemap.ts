import fs from 'node:fs/promises'
import path from 'node:path'

const vercelStaticDirectory = path.resolve('.vercel/output/static')
const sitemapPath = path.join(vercelStaticDirectory, 'sitemap.xml')
const apiOutputDirectory = path.join(vercelStaticDirectory, 'docs/api')

const [sitemap, apiRouteFiles] = await Promise.all([
  fs.readFile(sitemapPath, 'utf-8'),
  findRouteIndexFiles(apiOutputDirectory),
])

const sitemapLocations = new Set(
  Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, location]) => location),
)
const openApiIndexUrl = Array.from(sitemapLocations).find((location) =>
  /\/docs\/api\/?$/.test(location),
)

if (!openApiIndexUrl) {
  throw new Error(`Could not resolve the OpenAPI base URL from ${sitemapPath}`)
}

if (apiRouteFiles.length === 0) {
  throw new Error(`Could not find generated API routes in ${apiOutputDirectory}`)
}

const normalizedOpenApiIndexUrl = openApiIndexUrl.replace(/\/$/, '')
const canonicalBaseUrl = normalizedOpenApiIndexUrl.slice(0, -'/docs/api'.length)
const canonicalApiUrls = apiRouteFiles
  .map((file) => path.relative(vercelStaticDirectory, path.dirname(file)))
  .map((route) => route.split(path.sep).map(encodeURIComponent).join('/'))
  .map((route) => `${canonicalBaseUrl}/${route}`)
  .sort((a, b) => a.localeCompare(b))
const missingApiUrls = canonicalApiUrls.filter((location) => !sitemapLocations.has(location))

if (missingApiUrls.length > 0) {
  throw new Error(
    `Vercel sitemap is missing ${missingApiUrls.length} canonical API routes:\n${missingApiUrls.join('\n')}`,
  )
}

console.log(
  `Validated ${canonicalApiUrls.length} canonical API routes in ${path.relative(process.cwd(), sitemapPath)}.`,
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

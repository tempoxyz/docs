import fs from 'node:fs/promises'
import path from 'node:path'
import { sitemapCoverage } from '../src/lib/sitemap.ts'

const vercelStaticDirectory = path.resolve('.vercel/output/static')
const sitemapPath = path.join(vercelStaticDirectory, 'sitemap.xml')
const [sitemap, contentRouteFiles] = await Promise.all([
  fs.readFile(sitemapPath, 'utf-8'),
  Promise.all(
    ['docs', 'get-started', 'blog'].map((section) =>
      findRouteIndexFiles(path.join(vercelStaticDirectory, section)),
    ),
  ).then((files) => files.flat()),
])

if (contentRouteFiles.length === 0) {
  throw new Error(`Could not find generated content routes in ${vercelStaticDirectory}`)
}

await fs.access(path.join(vercelStaticDirectory, 'index.html'))
const routes = [
  '/',
  ...contentRouteFiles.map((file) =>
    path.relative(vercelStaticDirectory, path.dirname(file)).split(path.sep).join('/'),
  ),
].sort((a, b) => a.localeCompare(b))
const { urls, missing } = sitemapCoverage(sitemap, routes)

if (missing.length > 0) {
  throw new Error(
    `Vercel sitemap is missing ${missing.length} canonical content routes:\n${missing.join('\n')}`,
  )
}

console.log(
  `Validated ${urls.length} canonical content routes in ${path.relative(process.cwd(), sitemapPath)}.`,
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

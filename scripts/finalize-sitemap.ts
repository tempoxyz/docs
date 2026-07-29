import fs from 'node:fs/promises'
import path from 'node:path'
import { finalizeSitemap } from '../src/lib/sitemap.ts'
import { getBlogPostSlugs } from '../src/marketing/blogPlugin.ts'

const sitemapPath = path.resolve('dist/public/sitemap.xml')
const openApiMarkdownPath = path.resolve('dist/public/assets/md/docs/api')
let sitemap: string

try {
  sitemap = await fs.readFile(sitemapPath, 'utf-8')
} catch (error) {
  const isMissingSitemap = (error as NodeJS.ErrnoException).code === 'ENOENT'
  const canSkipMissingSitemap =
    process.env.VITE_E2E === 'true' || process.env.VERCEL_ENV !== 'production'

  if (isMissingSitemap && canSkipMissingSitemap) {
    process.exit(0)
  }
  throw error
}

const openApiRouteSlugs = await fs
  .readdir(openApiMarkdownPath, { withFileTypes: true })
  .then((entries) =>
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name.slice(0, -'.md'.length)),
  )
  .catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return []
    throw error
  })

const finalized = finalizeSitemap(sitemap, getBlogPostSlugs(), openApiRouteSlugs)

if (finalized !== sitemap) {
  await fs.writeFile(sitemapPath, finalized, 'utf-8')
}

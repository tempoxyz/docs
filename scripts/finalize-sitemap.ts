import fs from 'node:fs/promises'
import path from 'node:path'
import { finalizeSitemap } from '../src/lib/sitemap.ts'
import { getBlogPostSlugs } from '../src/marketing/blogPlugin.ts'

const sitemapPath = path.resolve('dist/public/sitemap.xml')
let sitemap: string | undefined

try {
  sitemap = await fs.readFile(sitemapPath, 'utf-8')
} catch (error) {
  const isMissingSitemap = error instanceof Error && 'code' in error && error.code === 'ENOENT'
  if (!isMissingSitemap) throw error
}

if (sitemap === undefined) process.exit(0)

const finalized = finalizeSitemap(sitemap, getBlogPostSlugs())

if (finalized !== sitemap) {
  await fs.writeFile(sitemapPath, finalized, 'utf-8')
}

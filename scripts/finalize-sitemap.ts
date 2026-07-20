import fs from 'node:fs/promises'
import path from 'node:path'
import { finalizeSitemap } from '../src/lib/sitemap.ts'
import { getBlogPostSlugs } from '../src/marketing/blogPlugin.ts'

const sitemapPath = path.resolve('dist/public/sitemap.xml')
const sitemap = await fs.readFile(sitemapPath, 'utf-8')
const finalized = finalizeSitemap(sitemap, getBlogPostSlugs())

if (finalized !== sitemap) {
  await fs.writeFile(sitemapPath, finalized, 'utf-8')
}

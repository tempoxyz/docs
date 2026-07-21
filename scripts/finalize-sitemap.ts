import fs from 'node:fs/promises'
import path from 'node:path'
import { finalizeSitemap } from '../src/lib/sitemap.ts'
import { getBlogPostSlugs } from '../src/marketing/blogPlugin.ts'

const sitemapPath = path.resolve('dist/public/sitemap.xml')
let sitemap: string

try {
  sitemap = await fs.readFile(sitemapPath, 'utf-8')
} catch (error) {
  if (process.env.VITE_E2E === 'true' && (error as NodeJS.ErrnoException).code === 'ENOENT') {
    process.exit(0)
  }
  throw error
}

const finalized = finalizeSitemap(sitemap, getBlogPostSlugs())

if (finalized !== sitemap) {
  await fs.writeFile(sitemapPath, finalized, 'utf-8')
}

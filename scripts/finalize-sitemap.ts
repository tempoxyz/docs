import fs from 'node:fs/promises'
import path from 'node:path'
import { finalizeSitemap } from '../src/lib/sitemap.ts'
import { getBlogPostSlugs } from '../src/marketing/blogPlugin.ts'

const sitemapPath = path.resolve('dist/public/sitemap.xml')
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

const finalized = finalizeSitemap(sitemap, getBlogPostSlugs())

if (finalized !== sitemap) {
  await fs.writeFile(sitemapPath, finalized, 'utf-8')
}

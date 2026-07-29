import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { type BlogSitemapEntry, finalizeSitemap } from '../src/lib/sitemap.ts'
import { getBlogPostSlugs } from '../src/marketing/blogPlugin.ts'

const distSitemapPath = path.resolve('dist/public/sitemap.xml')
const vercelSitemapPath = path.resolve('.vercel/output/static/sitemap.xml')
const openApiMarkdownPath = path.resolve('dist/public/assets/md/docs/api')

function getGitLastmod(filePath: string): string | undefined {
  try {
    const timestamp = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], {
      encoding: 'utf-8',
    }).trim()
    const lastmod = timestamp.split('T')[0]
    return /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? lastmod : undefined
  } catch {
    return undefined
  }
}

async function readSitemap(sitemapPath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(sitemapPath, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

async function writeFinalizedSitemap(
  sitemapPath: string,
  blogPosts: readonly BlogSitemapEntry[],
  openApiRouteSlugs: readonly string[] = [],
) {
  const sitemap = await readSitemap(sitemapPath)
  if (!sitemap) return false

  const finalized = finalizeSitemap(sitemap, blogPosts, openApiRouteSlugs)
  if (finalized !== sitemap) {
    await fs.writeFile(sitemapPath, finalized, 'utf-8')
  }
  return true
}

const blogPosts = getBlogPostSlugs().map((slug) => ({
  slug,
  lastmod: getGitLastmod(`blogs/${slug}.md`),
}))

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

const wroteDistSitemap = await writeFinalizedSitemap(distSitemapPath, blogPosts, openApiRouteSlugs)

await writeFinalizedSitemap(vercelSitemapPath, blogPosts, openApiRouteSlugs)

if (wroteDistSitemap) process.exit(0)

const canSkipMissingSitemap =
  process.env.VITE_E2E === 'true' || process.env.VERCEL_ENV !== 'production'

if (canSkipMissingSitemap) process.exit(0)

throw new Error(`Missing production sitemap at ${distSitemapPath}`)

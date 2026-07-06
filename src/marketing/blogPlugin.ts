import fs from 'node:fs'
import path from 'node:path'
import rehypeShiki from '@shikijs/rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import type { Plugin } from 'vite'

// Blog content lives as dev-managed markdown files in /blogs at the repo root.
// Frontmatter schema: title, excerpt, date (YYYY-MM-DD), category, and an
// optional `featured: true` to pin a post to the hero card.
//
// Markdown is rendered to HTML here, in Node, at build/dev time, so the heavy
// markdown + Shiki toolchain never ships to the client bundle. The rendered
// posts are exposed through the `virtual:blog-posts` module.

const VIRTUAL_ID = 'virtual:blog-posts'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

const BLOGS_DIR = path.resolve(process.cwd(), 'blogs')
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')

// Inline local SVG diagrams (`![alt](/blog/foo.svg)`) into the HTML so they can
// follow the active theme via CSS custom properties; SVGs loaded through an
// `<img>` tag are isolated from the page's theme tokens. Photos (jpg/png) and
// remote images are left as-is.
function inlineSvgImages(html: string): string {
  return html.replace(/<img\b[^>]*?>/g, (tag) => {
    const src = /\ssrc="([^"]+)"/.exec(tag)?.[1]
    if (!src?.startsWith('/') || !src.endsWith('.svg')) return tag

    const filePath = path.join(PUBLIC_DIR, src)
    if (!fs.existsSync(filePath)) return tag

    const alt = (/\salt="([^"]*)"/.exec(tag)?.[1] ?? '').replace(/"/g, '&quot;')
    const svg = fs.readFileSync(filePath, 'utf8').trim()
    return svg.replace(/<svg\b/, `<svg class="blog-diagram" role="img" aria-label="${alt}"`)
  })
}

const CATEGORY_SLUGS = ['network-upgrades', 'events', 'technical', 'case-studies']

// ALL-CAPS markdown files (AGENTS.md, DIAGRAMS.md, …) are documentation for
// authors, not posts.
const DOC_FILE = /^[A-Z0-9_-]+\.md$/

export type RenderedPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  featured: boolean
  html: string
}

// Markdown → HTML with Shiki syntax highlighting. Vesper is the closest
// built-in theme to the site's muted dark palette; the pre background is
// overridden to the surface token in CSS.
// `@shikijs/rehype` uses a process-wide singleton highlighter whose `langAlias`
// is fixed by the *first* caller. Vocs registers `sol -> solidity` for the docs;
// if this blog processor initializes the singleton first (e.g. the homepage
// renders the blog before docs), it must register the same alias and a fallback,
// otherwise docs pages with ```sol fences crash with "Language `sol` is not
// included in this bundle".
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeShiki, {
    theme: 'vesper',
    langAlias: { sol: 'solidity' },
    fallbackLanguage: 'plaintext',
  })
  .use(rehypeStringify)

// Minimal frontmatter parser for our simple schema (quoted strings, an
// unquoted YYYY-MM-DD date, a category slug, and an optional boolean). Avoids
// pulling in gray-matter + js-yaml for a handful of known keys.
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const keyValue = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!keyValue) continue
    let value = keyValue[2].trim()
    // Strip an inline comment that is not inside a quoted value.
    if (!value.startsWith('"') && !value.startsWith("'")) {
      value = value.replace(/\s+#.*$/, '').trim()
    }
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[keyValue[1]] = value
  }
  return { data, content: match[2] }
}

async function renderPost(filename: string): Promise<RenderedPost> {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(BLOGS_DIR, filename), 'utf8')
  const { data, content } = parseFrontmatter(raw)

  if (!CATEGORY_SLUGS.includes(data.category)) {
    throw new Error(
      `blogs/${filename}: unknown category "${data.category}". ` +
        `Expected one of: ${CATEGORY_SLUGS.join(', ')}`,
    )
  }

  const html = inlineSvgImages(String(await processor.process(content)))

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    category: data.category,
    featured: data.featured === 'true',
    html,
  }
}

// Reads + renders every post, newest first.
async function loadRenderedPosts(): Promise<RenderedPost[]> {
  const filenames = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith('.md') && !DOC_FILE.test(f))

  const posts = await Promise.all(filenames.map(renderPost))
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export function blogPostsPlugin(): Plugin {
  let cache: RenderedPost[] | null = null

  async function getPosts() {
    if (!cache) cache = await loadRenderedPosts()
    return cache
  }

  return {
    name: 'tempo-blog-posts',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return
      const posts = await getPosts()
      return `export const posts = ${JSON.stringify(posts)}`
    },
    configureServer(server) {
      const BLOG_ASSETS_DIR = path.join(PUBLIC_DIR, 'blog')
      server.watcher.add(BLOGS_DIR)
      server.watcher.add(BLOG_ASSETS_DIR)
      const invalidate = (file: string) => {
        // Posts are rendered with their referenced SVGs inlined, so a change to
        // either the markdown or a /blog asset must drop the cache.
        if (!file.startsWith(BLOGS_DIR) && !file.startsWith(BLOG_ASSETS_DIR)) return
        cache = null
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
      server.watcher.on('add', invalidate)
      server.watcher.on('change', invalidate)
      server.watcher.on('unlink', invalidate)
    },
  }
}

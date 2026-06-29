import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const vocsSearchPath = path.resolve(process.cwd(), 'node_modules/vocs/dist/internal/search.js')
const { extract } = (await import(pathToFileURL(vocsSearchPath).href)) as {
  extract: (
    source: string,
    config: unknown,
  ) => {
    searchPriority: number | undefined
    sections: Array<{
      anchor: string
      isPage: boolean
      subtitle: string
      text: string
      title: string
      titles: string[]
    }>
  }
}

export type Doc = {
  id: string
  href: string
  title: string
  titles: string[]
  subtitle: string
  text: string
  category: string
  searchPriority: number | undefined
  type: 'page' | 'section'
}

const PAGES_DIR = path.resolve(process.cwd(), 'src/pages')

export function hrefFromPage(page: string): string {
  return (
    `/${page}`
      .replace(/\.(md|mdx)$/, '')
      .replace(/\/index$/, '')
      .replace(/^$/, '/') || '/'
  )
}

/**
 * Build the benchmark corpus from every MDX/MD page using Vocs' own section
 * extractor, so benchmark input matches production docs search content.
 */
export async function buildCorpus(): Promise<Doc[]> {
  const entries = await fs.readdir(PAGES_DIR, { recursive: true })
  const pages = entries.filter((p) => p.endsWith('.md') || p.endsWith('.mdx'))

  const docs: Doc[] = []
  for (const page of pages) {
    const filePath = path.join(PAGES_DIR, page)
    const content = await fs.readFile(filePath, 'utf-8')
    const { searchPriority, sections } = extract(content, {})
    if (sections.length === 0) continue
    const href = hrefFromPage(page)
    for (const section of sections) {
      docs.push({
        id: `${filePath}#${section.anchor}`,
        href: section.anchor ? `${href}#${section.anchor}` : href,
        title: section.title,
        titles: section.titles,
        subtitle: section.subtitle,
        text: section.text,
        category: '',
        searchPriority,
        type: section.isPage ? 'page' : 'section',
      })
    }
  }
  return docs
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const docs = await buildCorpus()
  const pages = new Set(docs.map((d) => d.href.split('#')[0]))
  console.error(`corpus: ${docs.length} sections across ${pages.size} pages`)
  // Print page-level docs (title + href) to author fixtures.
  for (const d of docs) {
    if (d.type === 'page') console.log(`${d.href}\t${d.title}`)
  }
}

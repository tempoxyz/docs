import fs from 'node:fs'
import path from 'node:path'
import GithubSlugger from 'github-slugger'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

type AstNode = {
  type: string
  name?: string | null
  value?: unknown
  url?: string
  alt?: string | null
  attributes?: Array<{ type: string; name: string; value?: unknown }>
  children?: AstNode[]
  position?: { start: { line: number } }
}

type SourceEvent =
  | { type: 'heading'; file: string; line: number; text: string }
  | { type: 'anchor'; file: string; line: number; id: string }
  | { type: 'link'; file: string; line: number; href: string }

type Page = {
  file: string
  route: string
  routeDirectory: string
}

export type BrokenInternalAnchor = {
  file: string
  line: number
  href: string
  targetRoute: string
  fragment: string
}

export type InternalAnchorCheck = {
  pagesChecked: number
  linksChecked: number
  failures: BrokenInternalAnchor[]
}

const markdownExtensions = new Set(['.md', '.mdx'])

function markdownFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) return markdownFiles(file)
      return entry.isFile() && markdownExtensions.has(path.extname(file)) ? [file] : []
    })
    .sort()
}

function pageFor(file: string, pagesDirectory: string): Page {
  const relativeFile = path.relative(pagesDirectory, file).split(path.sep).join('/')
  const withoutExtension = relativeFile.replace(/\.(?:md|mdx)$/, '')
  const isIndex = withoutExtension === 'index' || withoutExtension.endsWith('/index')
  const route = normalizeRoute(`/${withoutExtension.replace(/(?:^|\/)index$/, '')}`)

  return {
    file,
    route,
    routeDirectory: isIndex ? route : path.posix.dirname(route),
  }
}

function normalizeRoute(route: string): string {
  const withoutExtension = route.replace(/\.(?:md|mdx)$/, '')
  const withoutIndex = withoutExtension.replace(/\/index$/, '')
  if (withoutIndex === '/') return '/'
  return withoutIndex.replace(/\/$/, '')
}

function nodeText(node: AstNode): string {
  if ((node.type === 'text' || node.type === 'inlineCode') && typeof node.value === 'string') {
    return node.value
  }
  if (node.type === 'image' && typeof node.alt === 'string') return node.alt
  return node.children?.map(nodeText).join('') ?? ''
}

function staticAttribute(node: AstNode, names: Set<string>): string | undefined {
  const attribute = node.attributes?.find(
    (candidate) => candidate.type === 'mdxJsxAttribute' && names.has(candidate.name),
  )
  return typeof attribute?.value === 'string' ? attribute.value : undefined
}

function importsFor(node: AstNode, file: string): Map<string, string> {
  const imports = new Map<string, string>()
  const source = typeof node.value === 'string' ? node.value : ''
  const pattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+\.(?:md|mdx))['"]/g

  for (const match of source.matchAll(pattern)) {
    const [, localName, importPath] = match
    if (!localName || !importPath) continue
    imports.set(localName, path.resolve(path.dirname(file), importPath))
  }
  return imports
}

function parseFile(file: string): AstNode {
  try {
    return unified().use(remarkParse).use(remarkMdx).parse(fs.readFileSync(file, 'utf8')) as AstNode
  } catch (error) {
    throw new Error(`Unable to parse ${file}`, { cause: error })
  }
}

function sourceEvents(file: string, stack: string[] = []): SourceEvent[] {
  if (stack.includes(file)) {
    throw new Error(`Circular MDX import: ${[...stack, file].join(' -> ')}`)
  }

  const tree = parseFile(file)
  const imports = new Map<string, string>()
  for (const child of tree.children ?? []) {
    if (child.type !== 'mdxjsEsm') continue
    for (const [localName, importFile] of importsFor(child, file)) {
      imports.set(localName, importFile)
    }
  }

  const visit = (node: AstNode): SourceEvent[] => {
    const line = node.position?.start.line ?? 1
    const events: SourceEvent[] = []

    if (node.type === 'heading') {
      events.push({ type: 'heading', file, line, text: nodeText(node) })
    }

    if (node.type === 'link' || node.type === 'definition') {
      if (typeof node.url === 'string') {
        events.push({ type: 'link', file, line, href: node.url })
      }
    }

    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      const id = staticAttribute(node, new Set(['id']))
      if (id) events.push({ type: 'anchor', file, line, id })

      const href = staticAttribute(node, new Set(['href', 'to']))
      if (href) events.push({ type: 'link', file, line, href })

      const importedFile = node.name ? imports.get(node.name) : undefined
      if (importedFile) {
        if (!fs.existsSync(importedFile)) {
          throw new Error(`${file}:${line} imports missing Markdown file ${importedFile}`)
        }
        events.push(...sourceEvents(importedFile, [...stack, file]))
      }
    }

    for (const child of node.children ?? []) events.push(...visit(child))
    return events
  }

  return visit(tree)
}

function headingAnchor(text: string, slugger: GithubSlugger): string {
  return slugger.slug(text)
}

function targetFor(href: string, page: Page): { route: string; fragment: string } | undefined {
  if (/^(?:https?:|mailto:|tel:)/.test(href)) return

  const basePath = href.startsWith('#') ? page.route : `${page.routeDirectory}/`
  const base = `https://tempo.local${basePath}`
  const url = new URL(href, base)
  if (!url.hash || url.origin !== 'https://tempo.local') return

  let route = url.pathname
  if (route === '/developers/docs' || route.startsWith('/developers/docs/')) {
    route = route.slice('/developers'.length)
  }
  route = normalizeRoute(route)
  if (route !== '/docs' && !route.startsWith('/docs/')) return

  return { route, fragment: decodeURIComponent(url.hash.slice(1)) }
}

export function checkInternalAnchors(
  pagesDirectory = path.resolve('src/pages'),
): InternalAnchorCheck {
  const pages = markdownFiles(pagesDirectory).map((file) => pageFor(file, pagesDirectory))
  const docsPages = pages.filter(
    (page) => page.route === '/docs' || page.route.startsWith('/docs/'),
  )
  const eventsByRoute = new Map(docsPages.map((page) => [page.route, sourceEvents(page.file)]))
  const anchorsByRoute = new Map<string, Set<string>>()

  for (const page of docsPages) {
    const slugger = new GithubSlugger()
    const anchors = new Set<string>()
    for (const event of eventsByRoute.get(page.route) ?? []) {
      if (event.type === 'heading') anchors.add(headingAnchor(event.text, slugger))
      if (event.type === 'anchor') anchors.add(event.id)
    }
    anchorsByRoute.set(page.route, anchors)
  }

  const failures: BrokenInternalAnchor[] = []
  let linksChecked = 0
  for (const page of docsPages) {
    for (const event of eventsByRoute.get(page.route) ?? []) {
      if (event.type !== 'link') continue
      const target = targetFor(event.href, page)
      if (!target) continue

      const anchors = anchorsByRoute.get(target.route)
      if (!anchors) continue // Vocs checks whether the target page exists.

      linksChecked += 1
      if (anchors.has(target.fragment)) continue
      failures.push({
        file: event.file,
        line: event.line,
        href: event.href,
        targetRoute: target.route,
        fragment: target.fragment,
      })
    }
  }

  return { pagesChecked: docsPages.length, linksChecked, failures }
}

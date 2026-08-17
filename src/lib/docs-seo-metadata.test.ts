import fs from 'node:fs'
import path from 'node:path'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'

const docsRoot = path.resolve('src/pages/docs')
const markdownParser = unified().use(remarkParse).use(remarkMdx)

const migratedOpenApiTitleFiles = [
  'api.mdx',
  'api/console.mdx',
  'api/console/api-keys.mdx',
  'api/console/projects-and-environments.mdx',
  'api/console/team.mdx',
  'api/console/usage-and-billing.mdx',
  'api/conventions.mdx',
  'api/errors.mdx',
  'api/pagination.mdx',
  'api/rate-limits.mdx',
  'api/reference.mdx',
  'api/transactions-and-transfers.mdx',
  'api/transactions.mdx',
  'api/transfers.mdx',
  'api/typed-client.mdx',
  'api/versioning-policy.mdx',
]

const preservedJxomFiles = [
  'api/authentication.mdx',
  'api/fee-payer.mdx',
  'api/indexer-api.mdx',
  'api/json-rpc.mdx',
]

type MarkdownNode = {
  children?: MarkdownNode[] | undefined
  depth?: number | undefined
  name?: string | null | undefined
  type: string
  value?: string | undefined
}

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filepath = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(filepath)
    return entry.isFile() && /\.mdx?$/.test(filepath) ? [filepath] : []
  })
}

function frontmatterString(source: string, key: string): string | undefined {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  const serialized = frontmatter?.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1]
  if (!serialized) return undefined
  return JSON.parse(serialized)
}

function parseMarkdown(source: string): MarkdownNode {
  const withoutFrontmatter = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
  return markdownParser.parse(withoutFrontmatter) as MarkdownNode
}

function findNodes(node: MarkdownNode, predicate: (node: MarkdownNode) => boolean): MarkdownNode[] {
  const matches = predicate(node) ? [node] : []
  return [...matches, ...(node.children ?? []).flatMap((child) => findNodes(child, predicate))]
}

function nodeText(node: MarkdownNode): string {
  if (typeof node.value === 'string') return node.value
  return (node.children ?? []).map(nodeText).join('')
}

function authoredH1(source: string): string | undefined {
  const heading = findNodes(
    parseMarkdown(source),
    (node) => node.type === 'heading' && node.depth === 1,
  )[0]
  return heading ? nodeText(heading) : undefined
}

describe('docs SEO metadata', () => {
  test('keeps audited page titles, H1s, and SEO titles aligned', () => {
    const auditedPages = markdownFiles(docsRoot)
      .map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }))
      .filter(
        ({ file, source }) =>
          /^seoTitle:/m.test(source) && path.relative(docsRoot, file) !== 'api/reference.mdx',
      )

    expect(auditedPages).toHaveLength(106)

    for (const { file, source } of auditedPages) {
      const title = frontmatterString(source, 'title')
      const seoTitle = frontmatterString(source, 'seoTitle')

      expect(title, file).toBeTruthy()
      expect(authoredH1(source), file).toBe(title)
      expect(seoTitle, file).toBeTruthy()
      expect(seoTitle, file).not.toContain('—')
      expect(authoredH1(source), file).not.toContain('—')
    }
  })

  test('keeps jxom-authored API metadata outside the audit rewrite', () => {
    for (const file of preservedJxomFiles) {
      const source = fs.readFileSync(path.join(docsRoot, file), 'utf8')
      expect(frontmatterString(source, 'seoTitle'), file).toBeUndefined()
    }
  })

  test('stores optimized OpenAPI document titles in frontmatter', () => {
    for (const file of migratedOpenApiTitleFiles) {
      const source = fs.readFileSync(path.join(docsRoot, file), 'utf8')
      expect(frontmatterString(source, 'seoTitle'), file).toBeTruthy()
    }
  })

  test('gives every authored docs page exactly one H1 and no literal title element', () => {
    for (const file of markdownFiles(docsRoot)) {
      const source = fs.readFileSync(file, 'utf8')
      const tree = parseMarkdown(source)
      const h1s = findNodes(tree, (node) => node.type === 'heading' && node.depth === 1)
      const titleElements = findNodes(
        tree,
        (node) =>
          (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
          node.name?.toLowerCase() === 'title',
      )

      expect(h1s.map(nodeText), file).toHaveLength(1)
      expect(titleElements, file).toHaveLength(0)
    }
  })
})

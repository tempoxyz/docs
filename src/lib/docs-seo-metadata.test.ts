import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const docsRoot = path.resolve('src/pages/docs')

const openApiTitleFiles = [
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

function mdxFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filepath = path.join(directory, entry.name)
    if (entry.isDirectory()) return mdxFiles(filepath)
    return entry.isFile() && filepath.endsWith('.mdx') ? [filepath] : []
  })
}

function frontmatterString(source: string, key: string): string | undefined {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1]
  const serialized = frontmatter?.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1]
  if (!serialized) return undefined
  return JSON.parse(serialized)
}

function authoredH1(source: string): string | undefined {
  return source.match(/^# (.+?)(?:\s+\{#[^}]+\})?$/m)?.[1].replaceAll('`', '')
}

describe('docs SEO metadata', () => {
  test('keeps audited page titles, H1s, and SEO titles aligned', () => {
    const auditedPages = mdxFiles(docsRoot)
      .map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }))
      .filter(({ source }) => /^seoTitle:/m.test(source))

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

  test('works around OpenAPI title overrides without leaking tags into source titles', () => {
    for (const file of openApiTitleFiles) {
      const source = fs.readFileSync(path.join(docsRoot, file), 'utf8')
      const seoTitle = frontmatterString(source, 'seoTitle')
      const literalTitle = `<title>${seoTitle}</title>`

      expect(seoTitle, file).toBeTruthy()
      expect(source.lastIndexOf(literalTitle), file).toBeGreaterThan(source.lastIndexOf('<OpenApi'))
    }
  })
})

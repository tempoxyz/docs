import { expect, test } from '@playwright/test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function findMdxFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...findMdxFiles(full))
    } else if (entry.name.endsWith('.mdx')) {
      results.push(full)
    }
  }
  return results
}

test('no raw ```mermaid code blocks in MDX files', () => {
  const pagesDir = join(__dirname, '..', 'src', 'pages')
  const mdxFiles = findMdxFiles(pagesDir)

  const violations: string[] = []
  for (const file of mdxFiles) {
    const content = readFileSync(file, 'utf-8')
    if (/^```mermaid\s*$/m.test(content)) {
      const relative = file.replace(join(__dirname, '..') + '/', '')
      violations.push(relative)
    }
  }

  expect(violations, [
    'Found raw ```mermaid code blocks. Use <StaticMermaidDiagram> instead:',
    ...violations.map((f) => `  - ${f}`),
  ].join('\n')).toHaveLength(0)
})

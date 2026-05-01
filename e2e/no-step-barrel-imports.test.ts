import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const srcDir = join(repoRoot, 'src')
const stepsBarrelDir = join(srcDir, 'components', 'guides', 'steps')
const SOURCE_EXTENSIONS = new Set(['.mdx', '.ts', '.tsx'])

function findSourceFiles(dir: string): string[] {
  const results: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)

    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...findSourceFiles(full))
      continue
    }

    if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
      results.push(full)
    }
  }

  return results
}

function findImports(content: string): string[] {
  const imports: string[] = []

  for (const match of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    imports.push(match[1])
  }

  for (const match of content.matchAll(/import\s+['"]([^'"]+)['"]/g)) {
    imports.push(match[1])
  }

  return imports
}

function resolvesToStepsBarrel(file: string, importPath: string): boolean {
  if (!importPath.startsWith('.')) return false

  const resolved = resolve(dirname(file), importPath)
  return resolved === stepsBarrelDir || resolved === join(stepsBarrelDir, 'index')
}

test('no imports from the guides steps barrel', () => {
  const files = findSourceFiles(srcDir)
  const violations: string[] = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const imports = findImports(content)

    for (const importPath of imports) {
      if (resolvesToStepsBarrel(file, importPath)) {
        violations.push(`${relative(repoRoot, file)} -> ${importPath}`)
      }
    }
  }

  expect(
    violations,
    [
      'Found imports from the guides steps barrel. Import the specific step modules instead:',
      ...violations.map((entry) => `  - ${entry}`),
    ].join('\n'),
  ).toHaveLength(0)
})

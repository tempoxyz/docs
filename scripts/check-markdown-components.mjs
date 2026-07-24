import { spawnSync } from 'node:child_process'
import { glob, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const audit = spawnSync(command, ['exec', 'vocs', 'markdown-audit', '--json'], {
  encoding: 'utf8',
})

if (audit.error) throw audit.error

let report
try {
  report = JSON.parse(audit.stdout)
} catch {
  console.error(audit.stderr || audit.stdout)
  throw new Error('Vocs did not produce a JSON Markdown audit report.')
}

if (audit.status !== 0 && audit.status !== 1) {
  console.error(audit.stderr)
  process.exit(audit.status ?? 1)
}

if (report.errors.length > 0 || report.components.length > 0) {
  console.error('Markdown component audit failed.')
  for (const { path, error } of report.errors) console.error(`- ${path}: ${error}`)
  for (const { name, count } of report.components)
    console.error(`- ${name}: ${count} unresolved occurrence${count === 1 ? '' : 's'}`)
  process.exit(1)
}

const markdownDirectory = resolve('dist/public/assets/md')
const files = []
for await (const file of glob(`${markdownDirectory}/**/*.md`)) files.push(file)

if (files.length === 0)
  throw new Error('No generated Markdown files found. Run `pnpm run build` before this audit.')

const llmsFile = resolve('dist/public/llms-full.txt')
const generatedFiles = [...files, llmsFile]
const unresolvedIncludes = []
for (const file of generatedFiles) {
  const content = await readFile(file, 'utf8')
  const count = content.match(/\[!include /g)?.length ?? 0
  if (count > 0) unresolvedIncludes.push({ count, file })
}

if (unresolvedIncludes.length > 0) {
  console.error('Generated Markdown include audit failed.')
  for (const { count, file } of unresolvedIncludes)
    console.error(`- ${file}: ${count} unresolved include${count === 1 ? '' : 's'}`)
  process.exit(1)
}

const generatedComponents = new Set()
for (const file of generatedFiles) {
  const content = await readFile(file, 'utf8')
  const parseableContent = file === llmsFile ? content.replaceAll(/<!--[\s\S]*?-->/g, '') : content
  const tree = unified().use(remarkParse).use(remarkMdx).parse(parseableContent)
  visit(tree, (node) => {
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return
    if (!/^[A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*$/.test(node.name ?? '')) return
    generatedComponents.add(node.name)
  })
}

if (generatedComponents.size > 0) {
  console.error('Generated Markdown component audit failed.')
  for (const name of generatedComponents) console.error(`- ${name}: unresolved component`)
  process.exit(1)
}

console.log('Markdown output audit passed (no unresolved component types or includes).')

function visit(node, callback) {
  callback(node)
  for (const child of node.children ?? []) visit(child, callback)
}

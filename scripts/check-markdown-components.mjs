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

const llmsFiles = [resolve('dist/public/llms.txt'), resolve('dist/public/llms-full.txt')]
const generatedFiles = [...files, ...llmsFiles]
const hiddenChangelogFallbacks = []
const missingMcpGuidance = []
const unresolvedIncludes = []
for (const file of generatedFiles) {
  const content = await readFile(file, 'utf8')
  if (hasHiddenChangelogFallback(content)) hiddenChangelogFallbacks.push(file)
  if (
    !content.includes('https://mcp.tempo.xyz') ||
    !content.includes('`search`') ||
    !content.includes('`find_pages`') ||
    !content.includes('`read_page`') ||
    !content.includes('`code`')
  )
    missingMcpGuidance.push(file)
  const count = content.match(/\[!include /g)?.length ?? 0
  if (count > 0) unresolvedIncludes.push({ count, file })
}

if (hiddenChangelogFallbacks.length > 0) {
  console.error('Generated Markdown changelog fallback audit failed.')
  for (const file of hiddenChangelogFallbacks) console.error(`- ${file}: hidden changelog fallback`)
  process.exit(1)
}

if (unresolvedIncludes.length > 0) {
  console.error('Generated Markdown include audit failed.')
  for (const { count, file } of unresolvedIncludes)
    console.error(`- ${file}: ${count} unresolved include${count === 1 ? '' : 's'}`)
  process.exit(1)
}

if (missingMcpGuidance.length > 0) {
  console.error('Generated Markdown is missing canonical MCP guidance.')
  for (const file of missingMcpGuidance) console.error(`- ${file}`)
  process.exit(1)
}

const generatedComponents = new Set()
const generatedEsmFiles = new Set()
const generatedExpressions = new Set()
const generatedPresentationElements = []
for (const file of generatedFiles) {
  const content = await readFile(file, 'utf8')
  const parseableContent = maskHtmlComments(content)
  const tree = unified().use(remarkParse).use(remarkMdx).parse(parseableContent)
  visit(tree, (node) => {
    if (node.type === 'mdxjsEsm') generatedEsmFiles.add(file)
    if (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression')
      generatedExpressions.add(file)
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return
    if (/^(?:meta|script|style|title)$/.test(node.name ?? ''))
      generatedPresentationElements.push({ file, name: node.name })
    if (!/^[A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*$/.test(node.name ?? '')) return
    generatedComponents.add(node.name)
  })
}

if (
  generatedComponents.size > 0 ||
  generatedEsmFiles.size > 0 ||
  generatedExpressions.size > 0 ||
  generatedPresentationElements.length > 0
) {
  console.error('Generated Markdown syntax audit failed.')
  for (const name of generatedComponents) console.error(`- ${name}: unresolved component`)
  for (const file of generatedEsmFiles) console.error(`- ${file}: executable import or export`)
  for (const file of generatedExpressions) console.error(`- ${file}: executable expression`)
  for (const { file, name } of generatedPresentationElements)
    console.error(`- ${file}: presentation-only <${name}> element`)
  process.exit(1)
}

console.log(
  'Markdown output audit passed (no unresolved components, includes, executable MDX, or presentation-only elements).',
)

function hasHiddenChangelogFallback(content) {
  let found = false
  const tree = unified().use(remarkParse).parse(content)
  visit(tree, (node) => {
    if (node.type === 'html' && node.value?.trim() === '<!-- changelog unavailable -->')
      found = true
  })
  return found
}

function maskHtmlComments(content) {
  const ranges = []
  const tree = unified().use(remarkParse).parse(content)
  visit(tree, (node) => {
    if (node.type !== 'html' || !/^<!--[\s\S]*-->$/.test(node.value?.trim() ?? '')) return
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start !== undefined && end !== undefined) ranges.push({ end, start })
  })

  let output = content
  for (const { end, start } of ranges.reverse())
    output = `${output.slice(0, start)}${output.slice(start, end).replace(/[^\r\n]/g, ' ')}${output.slice(end)}`
  return output
}

function visit(node, callback) {
  callback(node)
  for (const child of node.children ?? []) visit(child, callback)
}

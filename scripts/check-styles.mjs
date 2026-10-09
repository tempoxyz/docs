import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Keep site styling compiled and component-owned. The OG renderer and runnable
// documentation snippets are separate rendering targets, not browser UI.
const excluded = ['src/snippets/', 'src/pages/_api/']
const obsolete = new Set(['cva', 'tailwind-merge', 'tailwindcss', '@tailwindcss/vite'])
const utility =
  /^(?:(?:[\w/-]+|\[[^\]]+\]):)*(?:(?:p[xytrblse]?|m[xytrblse]?|gap|space-[xy]|text|bg|font|border|rounded|shadow|ring|outline|w|h|min-w|max-w|min-h|max-h|size|opacity|z|grid-cols|col-span|row-span|translate-[xy]|rotate|scale|duration|ease|tracking|leading)-|(?:flex|grid|block|inline-flex|inline-block|hidden|absolute|relative|fixed|sticky|sr-only)$)/
const failures = []
const files = []
function visitDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) visitDirectory(file)
    else if (
      /\.(tsx|mdx)$/.test(file) &&
      !excluded.some((prefix) => file.startsWith(prefix)) &&
      !file.includes('.test.')
    )
      files.push(file)
  }
}
visitDirectory('src')
function checkClasses(text, file, line) {
  for (const token of text.trim().split(/\s+/)) {
    // Semantic hooks may contain these words; only diagnose utility-shaped
    // numeric, color, and layout values, with known marker exceptions.
    if (utility.test(token) && !['block-in', 'grid-bg', 'border-grid'].includes(token))
      failures.push(
        `${file}:${line}: replace utility class ${JSON.stringify(token)} with a Zyzz recipe`,
      )
  }
}
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  if (file.endsWith('.mdx')) {
    let fenced = false
    for (const [index, line] of source.split('\n').entries()) {
      if (/^\s*```/.test(line)) fenced = !fenced
      if (fenced) continue
      for (const match of line.matchAll(/className=["']([^"']+)["']/g))
        checkClasses(match[1], file, index + 1)
      if (/<style[ >]|\bstyle=\{/.test(line))
        failures.push(`${file}:${index + 1}: move page styling into its Zyzz recipe module`)
    }
    continue
  }
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function visit(node, inClasses = false) {
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'className') inClasses = true
    if (ts.isJsxAttribute(node)) {
      inClasses = node.name.getText(ast) === 'className'
      if (node.name.getText(ast) === 'style')
        failures.push(
          `${file}:${ast.getLineAndCharacterOfPosition(node.getStart()).line + 1}: bind instance styling with a typed Zyzz recipe`,
        )
    }
    if (
      inClasses &&
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node))
    )
      checkClasses(node.text, file, ast.getLineAndCharacterOfPosition(node.getStart()).line + 1)
    if (ts.isImportDeclaration(node) && obsolete.has(node.moduleSpecifier.text))
      failures.push(`${file}: obsolete styling import ${node.moduleSpecifier.text}`)
    ts.forEachChild(node, (child) => visit(child, inClasses))
  }
  visit(ast)
}
// Zyzz 0.0.27 requires literal arrays in authoring configuration. Verify the
// duplicated literals so no entry can accidentally change the global cascade.
function layerNames(file) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  let result
  function visit(node) {
    if (ts.isArrayLiteralExpression(node) && node.elements.every(ts.isStringLiteral)) {
      const values = node.elements.map((element) => element.text)
      if (values.includes('vocs_base')) result = values
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return JSON.stringify(result)
}
const cascade = layerNames('src/styles/layers.ts')
for (const name of ['theme', 'recipes', 'controls', 'metrics', 'globals']) {
  const file = `src/styles/${name}.ts`
  if (layerNames(file) !== cascade) failures.push(`${file}: CSS layers must match layers.ts`)
}
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'))
for (const name of obsolete)
  if (manifest.dependencies?.[name] || manifest.devDependencies?.[name])
    failures.push(`package.json: remove direct styling dependency ${name}`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else console.log(`Zyzz architecture checked across ${files.length} UI and page files.`)

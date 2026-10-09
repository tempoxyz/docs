import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { checkStylePolicy } from './style-policy.ts'

// Keep site styling compiled and component-owned. The OG renderer and runnable
// documentation snippets are separate rendering targets, not browser UI.
const excluded = ['src/snippets/', 'src/pages/_api/', 'src/test/']
const obsolete = new Set(['cva', 'tailwind-merge', 'tailwindcss', '@tailwindcss/vite'])
const utility =
  /^(?:(?:[\w/-]+|\[[^\]]+\]):)*(?:(?:p[xytrblse]?|m[xytrblse]?|gap|space-[xy]|text|bg|font|border|rounded|shadow|ring|outline|w|h|min-w|max-w|min-h|max-h|size|opacity|z|grid-cols|col-span|row-span|translate-[xy]|rotate|scale|duration|ease|tracking|leading)-|(?:flex|grid|block|inline-flex|inline-block|hidden|absolute|relative|fixed|sticky|sr-only)$)/
const failures = []
const lintImports = new Set(
  JSON.parse(fs.readFileSync('.oxlintrc.json', 'utf8')).settings.zyzz.imports,
)
const files = []
function visitDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) visitDirectory(file)
    else if (file.endsWith('.css')) {
      const css = fs
        .readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim()
      if (file !== 'src/pages/_root.css' || !/^@import ["']zyzz\/reset\.css["'];$/.test(css))
        failures.push(`${file}: author site styles through the checked Zyzz helpers`)
    } else if (
      /\.([cm]?[jt]sx?|mdx)$/.test(file) &&
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
      if (/from ["']zyzz(?:\/[^"']*)?["']/.test(line))
        failures.push(`${file}:${index + 1}: import configured Tempo recipes in MDX`)
      for (const match of line.matchAll(/className=["']([^"']+)["']/g))
        checkClasses(match[1], file, index + 1)
      if (/<style[ >]|\bstyle=\{/.test(line))
        failures.push(`${file}:${index + 1}: move page styling into its Zyzz recipe module`)
    }
    continue
  }
  failures.push(...checkStylePolicy(source, file))
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('sx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
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
    if (
      ts.isImportDeclaration(node) &&
      /(?:styles\/|^\.\/)(?:theme|recipes|controls|scoped)$/.test(node.moduleSpecifier.text) &&
      !lintImports.has(node.moduleSpecifier.text)
    )
      failures.push(
        `${file}: register ${node.moduleSpecifier.text} in Oxlint's Zyzz imports so its rules apply`,
      )
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
for (const name of ['theme', 'recipes', 'scoped', 'globals']) {
  const file = `src/styles/${name}.ts`
  if (layerNames(file) !== cascade) failures.push(`${file}: CSS layers must match layers.ts`)
}
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'))
for (const name of obsolete)
  if (manifest.dependencies?.[name] || manifest.devDependencies?.[name])
    failures.push(`package.json: remove direct styling dependency ${name}`)

// A helper must not silently weaken the contract. The compiler requires literal
// mapping objects in each config, so compare them with the shared policy.
function configPolicy(file) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  function literal(node) {
    if (ts.isAsExpression(node)) return literal(node.expression)
    if (ts.isStringLiteral(node)) return node.text
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal)
    if (ts.isObjectLiteralExpression(node))
      return Object.fromEntries(
        node.properties.map((item) => [item.name.getText(ast), literal(item.initializer)]),
      )
    return node.getText(ast)
  }
  let mappings
  let vars
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'mappings')
      mappings = literal(node.initializer)
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'mappings')
      mappings = literal(node.initializer)
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'vars')
      vars = node.initializer.getText(ast)
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return { mappings: JSON.stringify(mappings), vars }
}
const expectedPolicy = configPolicy('src/styles/contract.ts')
for (const name of ['theme', 'recipes', 'scoped']) {
  const file = `src/styles/${name}.ts`
  const policy = configPolicy(file)
  if (policy.vars !== 'design' || policy.mappings !== expectedPolicy.mappings) {
    failures.push(`${file}: every helper must apply the full Tempo design contract`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else console.log(`Zyzz architecture checked across ${files.length} UI and page files.`)

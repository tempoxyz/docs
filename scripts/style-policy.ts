import path from 'node:path'
import ts from 'typescript'

// Native keywords do not introduce new design values.
const keyword =
  /^(?:0(?:px)?|auto|none|normal|inherit|initial|unset|revert(?:-layer)?|currentcolor|transparent)(?: !custom)?$/i
const factories = new Set(
  ['theme', 'recipes', 'scoped', 'contract', 'palette'].map((name) => `src/styles/${name}.ts`),
)
const vocabulary = new Set([
  'src/styles/contract.ts',
  'src/styles/palette.ts',
  'src/styles/inherited.ts',
])
const governed =
  /^(?:color|background(?:Color)?|(?:border\w*|outline|textDecoration|textEmphasis|columnRule)(?:Color|Width)?|fill|stroke|caretColor|accentColor|(?:padding|margin)\w*|(?:row|column)?Gap|gap|font(?:Size|Family|Weight)|letterSpacing|lineHeight|zIndex|boxShadow|textShadow)$/

/** Complements Zyzz's types/linter at the boundaries they cannot check: imports,
 * explicit exceptions, and global/keyframe declarations without a configured helper. */
export function checkStylePolicy(source: string, file: string): string[] {
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const failures: string[] = []
  const helpers = new Map<string, 'configured' | 'global'>()
  const bindings = new Map<string, ts.Expression>()
  const tokenImports = new Set<string>()
  const report = (node: ts.Node, message: string) =>
    failures.push(
      `${file}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}: ${message}`,
    )
  const name = (node: ts.PropertyName) =>
    ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : node.getText(ast)
  const comments = (node: ts.Node) =>
    (ts.getLeadingCommentRanges(source, node.getFullStart()) ?? [])
      .map((range) => source.slice(range.pos, range.end))
      .join('\n')
  const reason = (node: ts.Node) => /design-exception: .{20,}/.test(comments(node))

  for (const node of ast.statements) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.importClause?.isTypeOnly
    ) {
      const specifier = node.moduleSpecifier.text
      const imports = node.importClause?.namedBindings
      if (specifier.startsWith('zyzz') && !factories.has(file)) {
        if (!imports || ts.isNamespaceImport(imports))
          report(
            node,
            'Import the configured Tempo helpers instead of an unrestricted Zyzz namespace.',
          )
        else
          for (const item of imports.elements) {
            const imported = item.propertyName?.text ?? item.name.text
            if (
              !item.isTypeOnly &&
              !['cx', 'global', 'keyframes', 'fontFace', 'layers'].includes(imported)
            )
              report(
                item,
                'Use src/styles helpers; design-token factories belong in the shared contract.',
              )
          }
      }
      if (imports && ts.isNamedImports(imports)) {
        const target = path.posix
          .normalize(path.posix.join(path.posix.dirname(file), specifier))
          .replace(/\.ts$/, '')
        for (const item of imports.elements) {
          const imported = item.propertyName?.text ?? item.name.text
          if (
            (imported === 'vars' && target === 'src/styles/theme') ||
            (imported === 'inherited' && target === 'src/styles/inherited')
          )
            tokenImports.add(item.name.text)
          if (
            ['style', 'variants'].includes(imported) &&
            /^src\/styles\/(theme|recipes|scoped)$/.test(target)
          )
            helpers.set(item.name.text, 'configured')
          if (specifier === 'zyzz/web' && ['global', 'keyframes'].includes(imported))
            helpers.set(item.name.text, 'global')
        }
      }
    }
    if (ts.isVariableStatement(node))
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer)
          bindings.set(declaration.name.text, declaration.initializer)
      }
  }

  function declarations(node: ts.Node, kind: 'configured' | 'global', seen = new Set<ts.Node>()) {
    if (seen.has(node)) return
    seen.add(node)
    if (ts.isIdentifier(node) && bindings.has(node.text)) {
      const bound = bindings.get(node.text)
      if (bound) declarations(bound, kind, seen)
      return
    }
    if (
      kind === 'global' &&
      ts.isSpreadAssignment(node) &&
      (!ts.isIdentifier(node.expression) || !bindings.has(node.expression.text))
    )
      report(node, 'Keep global declaration blocks local so their design values can be checked.')
    if (ts.isPropertyAssignment(node)) {
      const property = name(node.name)
      let value = node.initializer
      const values = new Set<ts.Node>()
      while (ts.isIdentifier(value) && bindings.has(value.text) && !values.has(value)) {
        values.add(value)
        const bound = bindings.get(value.text)
        if (!bound) break
        value = bound
      }
      if (
        (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) &&
        value.text.includes('!custom') &&
        !keyword.test(value.text) &&
        !reason(node)
      )
        report(
          node,
          'Explain this !custom value with a design-exception comment, or use a shared token.',
        )
      if (ts.isTemplateExpression(value) && value.getText(ast).includes('!custom') && !reason(node))
        report(node, 'Explain this composed !custom value with a design-exception comment.')
      if (
        kind === 'global' &&
        governed.test(property) &&
        (ts.isIdentifier(value) ||
          ts.isPropertyAccessExpression(value) ||
          ts.isElementAccessExpression(value))
      ) {
        let root: ts.Expression = value
        while (ts.isPropertyAccessExpression(root) || ts.isElementAccessExpression(root))
          root = root.expression
        if (!ts.isIdentifier(root) || !tokenImports.has(root.text))
          report(
            node,
            'Global design values must reference the shared token contract, not unchecked imports.',
          )
      }
      if (
        kind === 'global' &&
        governed.test(property) &&
        !/(?:Style|Collapse|Spacing)$/.test(property) &&
        property !== 'textDecoration' &&
        (ts.isStringLiteral(value) || ts.isNumericLiteral(value)) &&
        !keyword.test(value.text) &&
        !value.text.includes('!custom')
      )
        report(
          node,
          'Global styles must use shared token references or an explained !custom value.',
        )
      // Shorthands must not become a back door around color/spacing policies.
      if (
        kind === 'configured' &&
        /^(?:background|border(?:Block|Inline|Top|Bottom|Left|Right|BlockStart|BlockEnd|InlineStart|InlineEnd)?|outline|boxShadow|textShadow)$/.test(
          property,
        ) &&
        ts.isStringLiteral(value) &&
        !keyword.test(value.text) &&
        !value.text.includes('!custom') &&
        !reason(node)
      )
        report(node, 'Use token-based longhands, or document this compound design value.')
    }
    ts.forEachChild(node, (child) => declarations(child, kind, seen))
  }
  function member(node: ts.Node): { object: ts.Expression; key?: string } | undefined {
    if (ts.isPropertyAccessExpression(node)) return { object: node.expression, key: node.name.text }
    if (ts.isElementAccessExpression(node))
      return {
        object: node.expression,
        key: ts.isStringLiteral(node.argumentExpression) ? node.argumentExpression.text : undefined,
      }
  }
  function visit(node: ts.Node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const target = member(node.left)
      if (
        target &&
        member(target.object)?.key === 'style' &&
        !['overflow', 'colorScheme'].includes(target.key ?? '')
      )
        report(
          node,
          'Use Zyzz selectors for presentation; DOM style assignments are reserved for scroll locking and theme application.',
        )
    }
    if (ts.isCallExpression(node)) {
      const method = member(node.expression)
      if (method?.key === 'setProperty' && member(method.object)?.key === 'style') {
        const argument = node.arguments[0]
        const property = argument && ts.isStringLiteral(argument) ? argument.text : ''
        if (!property.startsWith('--') && !['overflow', 'color-scheme'].includes(property))
          report(
            node,
            'Bind a named CSS variable for runtime measurements; define presentation in Zyzz.',
          )
      }
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const kind = helpers.get(node.expression.text)
      if (kind && node.arguments[0]) declarations(node.arguments[0], kind)
    }
    ts.forEachChild(node, visit)
  }
  if (!vocabulary.has(file)) visit(ast)
  return failures
}

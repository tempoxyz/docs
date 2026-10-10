import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, it } from 'vitest'
import { checkStylePolicy } from '../../scripts/style-policy'

const file = 'src/components/Card.tsx'
const configured = "import { style } from '../styles/recipes';\n"

it('rejects token-free helpers and namespace/factory bypasses', () => {
  for (const source of [
    "import { style } from 'zyzz'",
    "import { style as unsafe } from 'zyzz/default'",
    "import * as Zyzz from 'zyzz'",
    "import { defineConfig } from 'zyzz'",
  ])
    expect(checkStylePolicy(source, file)).not.toEqual([])
  expect(checkStylePolicy("import { cx, type Props } from 'zyzz'", file)).toEqual([])
})

it('requires a declaration-local reason for a deliberate exception', () => {
  expect(
    checkStylePolicy(`${configured}const card = style({ padding: '7px !custom' })`, file),
  ).toHaveLength(1)
  expect(
    checkStylePolicy(
      `${configured}const card = style({\n// design-exception: Align this marker to the partner artwork grid.\npadding: '7px !custom' })`,
      file,
    ),
  ).toEqual([])
})

it('requires a reason even when an exception is stored in a local constant', () => {
  expect(
    checkStylePolicy(
      `${configured}const offScale = '7px !custom'; const card = style({ padding: offScale })`,
      file,
    ),
  ).toHaveLength(1)
})

it('checks global styles, keyframes, and local object spreads too', () => {
  for (const helper of ['global', 'keyframes']) {
    expect(
      checkStylePolicy(
        `import { ${helper} as css } from 'zyzz/web'; const bad = { color: '#123456' }; css({ ':root': { ...bad } });`,
        file,
      ),
    ).toHaveLength(1)
  }
  expect(
    checkStylePolicy(
      "import { global } from 'zyzz/web'; import { vars } from '../styles/theme'; global({ ':root': { color: vars.color.foreground } });",
      file,
    ),
  ).toEqual([])
})

it('rejects unchecked imported global values and blocks', () => {
  expect(
    checkStylePolicy(
      "import { global } from 'zyzz/web'; import { color, block } from './arbitrary'; global({ ':root': { color, ...block } });",
      file,
    ),
  ).not.toEqual([])
  expect(
    checkStylePolicy(
      "import { global } from 'zyzz/web'; import { colors } from './arbitrary'; global({ ':root': { color: colors.brand } });",
      file,
    ),
  ).toHaveLength(1)
})

it('rejects compound values that evade the token properties', () => {
  expect(
    checkStylePolicy(`${configured}const card = style({ border: '1px solid #123456' })`, file),
  ).toHaveLength(1)
})

it('runs the registered Zyzz rules against the actual configured-helper imports', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tempo-style-lint-'))
  const fixture = path.join(root, 'invalid.tsx')
  try {
    await writeFile(
      fixture,
      `${configured}const card = style({ transitionProperty: 'all', marginLeft: '4px !custom' }); export const Card = () => <div {...card()} className="overwrites-style" />;`,
    )
    let output = ''
    try {
      execFileSync('pnpm', ['exec', 'oxlint', '-c', path.resolve('.oxlintrc.json'), fixture], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    } catch (error) {
      output =
        String((error as { stdout: unknown }).stdout) +
        String((error as { stderr: unknown }).stderr)
    }
    expect(output).toContain('restricted-properties')
    expect(output).toContain('use-logical-properties')
    expect(output).toContain('no-conflicting-props')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

it('keeps presentation out of imperative DOM styles while allowing runtime integration', () => {
  for (const source of [
    "element.style.color = 'red'",
    "element['style']['padding'] = '13px'",
    "element.style.cssText = 'color: red'",
    "element.style.setProperty('color', 'red')",
  ])
    expect(checkStylePolicy(source, file)).toHaveLength(1)
  expect(
    checkStylePolicy(
      "document.body.style.overflow = 'hidden'; document.documentElement.style.colorScheme = resolved; line.style.setProperty('--diagram-line-length', String(length));",
      file,
    ),
  ).toEqual([])
})

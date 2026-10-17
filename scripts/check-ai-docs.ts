import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  aiDocsContextMarker,
  aiDocsSections,
  markdownRoute,
  parseAiIndex,
} from '../src/lib/ai-docs'

const outputs =
  process.argv.length > 2 ? process.argv.slice(2) : ['dist/public', '.vercel/output/static']
const read = (file: string) => readFileSync(file, 'utf8')
const skill = read('SKILL.md')

for (const { href, label } of aiDocsSections)
  assert(
    skill.includes(`[${label}](https://tempo.xyz/developers${href}.md)`),
    `SKILL.md: missing current ${label} landing`,
  )

for (const directory of outputs) {
  if (directory !== outputs[0] && !existsSync(directory)) continue
  const index = read(path.join(directory, 'llms.txt'))
  const full = read(path.join(directory, 'llms-full.txt'))
  const entries = parseAiIndex(index)
  const routes = entries.map(({ route }) => route)
  const markdownDir = path.join(directory, 'assets/md')
  const files = readdirSync(markdownDir, { recursive: true }).filter(
    (file): file is string => typeof file === 'string' && file.endsWith('.md'),
  )
  assert.equal(new Set(routes).size, routes.length, `${directory}: duplicate index entries`)
  assert.deepEqual(
    [...routes].sort(),
    files.map((file) => markdownRoute(`/${file}`)).sort(),
    `${directory}: index must contain every generated page exactly once`,
  )
  assert.deepEqual(
    [...index.matchAll(/^## (.+)$/gm)].map(([, label]) => label).slice(0, aiDocsSections.length),
    aiDocsSections.map(({ label }) => label),
    `${directory}: section order differs from navigation`,
  )
  for (const { href, label } of aiDocsSections)
    assert(routes.includes(href), `${directory}: missing ${label} landing`)
  for (const file of files) {
    const content = read(path.join(markdownDir, file))
    assert(content.startsWith(aiDocsContextMarker), `${file}: missing source context`)
    assert(content.includes('> Source: ['), `${file}: missing source URL`)
    if (file.startsWith('docs/'))
      assert(content.includes('> Section: ['), `${file}: missing section`)
    assert(full.includes(content), `${file}: full export differs from the per-page export`)
  }
  assert.equal(
    full.split(aiDocsContextMarker).length - 1,
    files.length,
    `${directory}: full export must attribute every page once`,
  )
  assert.equal(
    read(path.join(directory, 'SKILL.md')),
    skill,
    `${directory}: published skill differs from source`,
  )
  assert(
    index.includes('Earn is in beta') &&
      index.includes('Routes is in beta') &&
      index.includes('Zones is in limited preview'),
    `${directory}: product availability context is missing`,
  )
  assert(
    index.includes('### Earlier testnet sandbox'),
    `${directory}: legacy sandbox needs a separate group`,
  )
  console.log(
    `AI documentation audit passed: ${directory}, ${files.length} pages, ${aiDocsSections.length} sections, published skill.`,
  )
}

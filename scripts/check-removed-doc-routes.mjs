import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const base = process.env.DOCS_ROUTE_GUARD_BASE

if (!base) {
  console.log('Skipping removed docs route check outside a pull request.')
  process.exit(0)
}

const deletedFiles = execFileSync(
  'git',
  ['diff', '--diff-filter=D', '--name-only', base + '...HEAD', '--', 'src/pages/docs'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))

function routeFor(file) {
  const route = file
    .slice('src/pages/'.length)
    .replace(/\.(?:md|mdx)$/, '')
    .replace(/\/index$/, '')
  return '/' + route
}

function sourceMatchesRoute(source, route) {
  if (source === route) return true
  if (!source.endsWith('/:path*')) return false

  const prefix = source.slice(0, -7)
  return route === prefix || route.startsWith(prefix + '/')
}

const vocsConfig = await readFile(new URL('../vocs.config.ts', import.meta.url), 'utf8')
const redirectSources = [...vocsConfig.matchAll(/source:\s*'([^']+)'/g)].map(([, source]) => source)
const missingRedirects = deletedFiles
  .map(routeFor)
  .filter((route) => !redirectSources.some((source) => sourceMatchesRoute(source, route)))

if (missingRedirects.length === 0) {
  console.log('Every removed docs page has a Vocs redirect.')
  process.exit(0)
}

if (process.env.DOCS_REMOVAL_OK === 'true') {
  console.warn(
    'docs-removal-ok is present; allowing removed routes without redirects:\n' +
      missingRedirects.map((route) => '- ' + route).join('\n'),
  )
  process.exit(0)
}

const message =
  'Removed docs routes need a Vocs redirect:\n' +
  missingRedirects.map((route) => '- ' + route).join('\n') +
  '\n\nAdd redirects, or apply the docs-removal-ok label to explicitly acknowledge the intentional break.'

console.error(
  `::error title=Removed docs route requires redirect::${message.replace(/\n/g, '%0A')}`,
)
console.error(message)
process.exit(1)

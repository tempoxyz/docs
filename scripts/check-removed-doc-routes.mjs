import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const base = process.env.DOCS_ROUTE_GUARD_BASE

if (!base) {
  console.log('Skipping removed docs route check outside a pull request.')
  process.exit(0)
}

const deletedFiles = execFileSync(
  'git',
  ['diff', '--diff-filter=D', '--name-only', `${base}...HEAD`, '--', 'src/pages/docs'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))

function routeFor(file) {
  const route = file
    .slice('src/pages/'.length)
    .replace(/\.(?:md|mdx)$/, '')
    .replace(/\/index$/, '')
  return `/${route}`
}

function sourceMatchesRoute(source, route) {
  if (source === route) return true
  if (!source.endsWith('/:path*')) return false

  const prefix = source.slice(0, -7)
  return route === prefix || route.startsWith(`${prefix}/`)
}

const [vocsConfig, routeContract, vercelConfigText] = await Promise.all([
  readFile(new URL('../vocs.config.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/lib/docs-routing.ts', import.meta.url), 'utf8'),
  readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
])
const redirectSources = [vocsConfig, routeContract].flatMap((config) =>
  [...config.matchAll(/source:\s*'([^']+)'/g)].map(([, source]) => source),
)
const vercelRedirectSources = JSON.parse(vercelConfigText).redirects.map(
  (redirect) => redirect.source,
)
const missingAppRedirects = deletedFiles
  .map(routeFor)
  .filter((route) => !redirectSources.some((source) => sourceMatchesRoute(source, route)))
const missingProxyRedirects = deletedFiles
  .map(routeFor)
  .filter(
    (route) =>
      !vercelRedirectSources.some((source) => sourceMatchesRoute(source, `/developers${route}`)),
  )
const missingRedirects = [
  ...missingAppRedirects.map((route) => `Vocs route: ${route}`),
  ...missingProxyRedirects.map((route) => `Proxy route: /developers${route}`),
]

if (missingRedirects.length === 0) {
  console.log('Every removed docs page has native and proxied redirects.')
  process.exit(0)
}

if (process.env.DOCS_REMOVAL_OK === 'true') {
  console.warn(
    'docs-removal-ok is present; allowing removed routes without redirects:\n' +
      missingRedirects.map((route) => `- ${route}`).join('\n'),
  )
  process.exit(0)
}

const message =
  'Removed docs routes need native and proxied redirects:\n' +
  missingRedirects.map((route) => `- ${route}`).join('\n') +
  '\n\nAdd both redirects, or apply the docs-removal-ok label to explicitly acknowledge the intentional break.'

console.error(
  `::error title=Removed docs route requires redirects::${message.replace(/\n/g, '%0A')}`,
)
console.error(message)
process.exit(1)

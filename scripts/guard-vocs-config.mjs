import { readFile, writeFile } from 'node:fs/promises'

const configPath = new URL('../vocs.config.ts', import.meta.url)
let config = await readFile(configPath, 'utf8')
const original = config

config = config
  .replace(
    "  titleTemplate: (path, { title }) => {\n    if (path === '/docs') return 'Tempo %s ⋅ Tempo Docs'\n    if (path === '/docs' || path.startsWith('/docs/')) return '%s ⋅ Tempo Docs'",
    "  titleTemplate: (path, { title }) => {\n    const pagePath = typeof path === 'string' ? path : '/'\n    if (pagePath === '/docs') return 'Tempo %s ⋅ Tempo Docs'\n    if (pagePath === '/docs' || pagePath.startsWith('/docs/')) return '%s ⋅ Tempo Docs'",
  )
  .replace(
    "  head(path) {\n    if (path === '/docs' || path.startsWith('/docs/'))",
    "  head(path) {\n    const pagePath = typeof path === 'string' ? path : '/'\n    if (pagePath === '/docs' || pagePath.startsWith('/docs/'))",
  )
  .replace(
    "    lastmod: (path, { lastmod }) => {\n      if (path === '/docs' || path.startsWith('/docs/')) return false",
    "    lastmod: (path, { lastmod }) => {\n      const pagePath = typeof path === 'string' ? path : '/'\n      if (pagePath === '/docs' || pagePath.startsWith('/docs/')) return false",
  )
  .replace(
    "    const docsPath = path.replace(/^\\/docs(?=\\/|$)/, '') || '/'",
    "    const docsPath = String(path ?? '').replace(/^\\/docs(?=\\/|$)/, '') || '/'",
  )
  .replace(
    "badge: { text: 'Planned', variant: 'note' },",
    "badge: { text: 'Planned', variant: 'note' as const },",
  )

if (config !== original) await writeFile(configPath, config, 'utf8')

import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

// Exposes the Vocs-built search index to the marketing SPA via a single virtual
// module (`virtual:marketing/search-index`) that resolves differently depending
// on which build it's part of:
//
// - `source: 'vocs'` (vite.config.ts — the docs build and the shared dev
//   server): the `vocs()` plugin is present, so we just re-export Vocs' own
//   `virtual:vocs/search-index`. This covers dev, where the marketing pages are
//   served by this same config.
// - `source: 'dist'` (vite.marketing.config.ts — the standalone marketing
//   build): there's no `vocs()` plugin, but the docs build runs first and emits
//   `dist/public/assets/search-index-<hash>.json`. We locate that file and emit
//   a fetch-based loader. The scan happens lazily in `load()` so it never runs
//   at config time.

const VIRTUAL_ID = 'virtual:marketing/search-index'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`
const INDEX_FILE_RE = /^search-index-[a-f0-9]{12}\.json$/

type Options = {
  /**
   * Where the index comes from. `'vocs'` re-exports Vocs' virtual module (docs
   * build + dev); `'dist'` reads the hashed JSON emitted by the docs build
   * (standalone marketing build).
   */
  source: 'vocs' | 'dist'
}

export function marketingSearchIndexPlugin({ source }: Options): Plugin {
  let config: ResolvedConfig

  return {
    name: 'tempo-marketing-search-index',
    enforce: 'pre',
    configResolved(resolved) {
      config = resolved
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return

      // Docs build + dev: Vocs owns the index, so delegate to its virtual module.
      if (source === 'vocs') {
        return `export { getSearchIndex } from 'virtual:vocs/search-index'`
      }

      // Marketing build: find the hashed index emitted by the prior docs build.
      const assetsDir = path.resolve(config.root, config.build.outDir, 'assets')
      const files = await fs.readdir(assetsDir).catch(() => [] as string[])
      const candidates = await Promise.all(
        files
          .filter((name) => INDEX_FILE_RE.test(name))
          .map(async (name) => ({
            name,
            mtimeMs: (await fs.stat(path.join(assetsDir, name))).mtimeMs,
          })),
      )

      if (candidates.length === 0) {
        throw new Error(
          `[search] No search-index-*.json found in ${assetsDir}. ` +
            `The docs build must run before the marketing build.`,
        )
      }

      candidates.sort((a, b) => b.mtimeMs - a.mtimeMs)
      if (candidates.length > 1) {
        this.warn(`[search] Multiple search indexes found; using newest: ${candidates[0].name}`)
      }

      const href = `/assets/${candidates[0].name}`
      return `export async function getSearchIndex() {
  const response = await fetch(${JSON.stringify(href)})
  if (!response.ok) throw new Error('Failed to fetch search index: ' + response.status)
  return response.text()
}`
    },
  }
}

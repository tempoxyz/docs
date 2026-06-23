import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

// Exposes the Vocs-built search index to the marketing SPA via a single virtual
// module that works in both environments:
//
// - Dev: the marketing pages are served by the main `vite.config.ts` dev server,
//   which includes the `vocs()` plugin, so we re-export Vocs' own
//   `virtual:vocs/search-index`.
// - Build: the marketing build (`vite.marketing.config.ts`) has no `vocs()`
//   plugin, but the Vocs build runs first and emits
//   `dist/public/assets/search-index-<hash>.json`. We locate that file and emit
//   a fetch-based loader. The scan happens lazily in `load()` so it never runs
//   during the Vocs build (where the index doesn't exist yet).

const VIRTUAL_ID = 'virtual:marketing/search-index'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`
const INDEX_FILE_RE = /^search-index-[a-f0-9]{12}\.json$/

export function marketingSearchIndexPlugin(): Plugin {
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

      // Dev: delegate to Vocs' virtual module (only resolvable when the vocs
      // plugin is present, which it is on the shared dev server).
      if (config.command === 'serve') {
        return `export { getSearchIndex } from 'virtual:vocs/search-index'`
      }

      // Build: find the hashed index emitted by the prior Vocs build.
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
            `The Vocs build must run before the marketing build.`,
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

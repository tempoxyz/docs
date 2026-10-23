import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { normalizePath, type Plugin } from 'vite'

const require = createRequire(import.meta.url)
export const vocsSkipLinkPath = path.join(
  path.dirname(require.resolve('vocs')),
  'react/internal/SkipToContent.client.js',
)
// biome-ignore lint/suspicious/noTemplateCurlyInString: Match Vocs' literal source expression.
const nativeHref = "href: `${path.split('#')[0]}#vocs-content`"

export function rewriteVocsSkipLink(source: string): string {
  if (source.split(nativeHref).length !== 2) {
    throw new Error('Vocs skip-link source changed; review the public /developers fragment fix.')
  }
  // Docs disable the base tag, so a native fragment keeps the public mount and
  // moves keyboard navigation into main. Preserve Vocs' component and styles.
  return source.replace(nativeHref, "href: '#vocs-content'")
}

export function vocsSkipLinkPlugin(): Plugin {
  return {
    name: 'tempo-vocs-skip-link',
    enforce: 'pre',
    async buildStart() {
      // Check the installed source even if an upstream change stops importing
      // this module. Dependency upgrades must not silently lose the fix.
      rewriteVocsSkipLink(await readFile(vocsSkipLinkPath, 'utf8'))
    },
    transform(source, id) {
      if (normalizePath(id.split('?')[0]) !== normalizePath(vocsSkipLinkPath)) return
      return { code: rewriteVocsSkipLink(source), map: null }
    },
  }
}

import type { Plugin, PluginOption } from 'vite'
import { vocs } from 'vocs/vite'
import { cascadeLayers } from '../src/styles/layers'

/** Bridge compiled Zyzz styles to Vocs' server-rendered MDX and RSC delivery. */
export async function vocsWithZyzz() {
  const plugins = await flatten(await vocs())
  // Let Vite finish pruning CSS-only chunks before RSC records asset URLs.
  const manifest = plugins.find((plugin) => plugin.name === 'rsc:virtual:vite-rsc/assets-manifest')
  const generateBundle = manifest?.generateBundle
  if (!manifest || !generateBundle)
    throw new Error('Vocs changed its RSC asset plugin; update Zyzz CSS ordering')
  manifest.generateBundle =
    typeof generateBundle === 'function'
      ? { order: 'post', handler: generateBundle }
      : { ...generateBundle, order: 'post' }
  // Waku inserts its RSC transforms inside the Vocs plugin group. Extend the
  // MDX transform here so loadCss is present before rsc:importer-resources runs.
  const mdx = plugins.find(
    (plugin): plugin is Plugin =>
      typeof plugin === 'object' &&
      plugin !== null &&
      'name' in plugin &&
      plugin.name === 'vocs:mdx',
  )
  if (!mdx || typeof mdx.transform !== 'function')
    throw new Error('Vocs changed its MDX plugin; update Zyzz CSS registration')
  const transform = mdx.transform
  mdx.transform = async function (code, id, options) {
    const result = await transform.call(this, code, id, options)
    if (!result || this.environment.name !== 'rsc' || !/\.mdx?(?:\?|$)/.test(id)) return result
    const source = typeof result === 'string' ? result : result.code?.toString()
    if (!source) return result
    if (!source.includes('export function Page(')) return result
    const content = '_createElement(MDXContent, props)'
    if (!source.includes(content))
      throw new Error(`Vocs changed its MDX wrapper; update Zyzz CSS registration for ${id}`)
    // Register the page graph so first paint and client navigation receive
    // stylesheet links, not merely preloads, without adding a client wrapper.
    return {
      ...(typeof result === 'string' ? {} : result),
      code: `import { Fragment as _TempoStyleFragment } from 'react';\n${source.replace(
        content,
        `_createElement(_TempoStyleFragment, null, import.meta.viteRsc.loadCss(), ${content})`,
      )}`,
      map: null,
    }
  }
  const cascade: Plugin = {
    name: 'tempo:zyzz-cascade',
    enforce: 'pre',
    transform(code, id) {
      // RSC may put a leaf stylesheet before the shared sheet. Establish the
      // cascade in each asset, before Vite hashes and minifies its contents.
      // Keep this declaration even for empty sheets: RSC can retain their asset URLs.
      if (id.startsWith('\0zyzz:') && id.split('?', 1)[0].endsWith('.css'))
        return { code: `@layer ${cascadeLayers.join(',')};\n${code}`, map: null }
    },
  }
  return [cascade, ...plugins]
}

async function flatten(options: PluginOption[]): Promise<Plugin[]> {
  const result: Plugin[] = []
  for (const option of options) {
    const plugin = await option
    if (!plugin) continue
    if (Array.isArray(plugin)) result.push(...(await flatten(plugin)))
    else result.push(plugin)
  }
  return result
}

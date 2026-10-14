import type { Plugin } from 'vite'

/**
 * plugin-rsc analyzes client and server references with two throwaway builds
 * that keep only each module's import statements. Zyzz output cannot affect
 * those references, so skip compiling styles that the scan discards.
 */
export function skipReferenceScans(plugin: Plugin): Plugin {
  const { transform } = plugin
  if (typeof transform !== 'function')
    throw new Error('Zyzz changed its transform hook; update skipReferenceScans')
  if (process.env.ZYZZ_SKIP_SCAN === '0') return plugin

  return {
    ...plugin,
    transform(...args) {
      const { config, mode } = this.environment
      if (mode === 'build' && config.build.write === false) return
      return transform.apply(this, args)
    },
  }
}

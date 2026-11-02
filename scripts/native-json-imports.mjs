import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

// tsx compiles JSON modules to JS and retains the source, output, and source map.
// Native JSON modules keep only the parsed value, saving about 65 MB in dev.
registerHooks({
  load(url, context, nextLoad) {
    if (context.importAttributes?.type !== 'json' || !url.startsWith('file:'))
      return nextLoad(url, context)
    return { format: 'json', shortCircuit: true, source: readFileSync(new URL(url), 'utf8') }
  },
})

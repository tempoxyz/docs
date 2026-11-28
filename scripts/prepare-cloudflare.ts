import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import config from '../vocs.config'

await mkdir('dist/cloudflare', { recursive: true })

// Vocs already builds the index and emits its server-side manifest. Ship it as
// a private Worker module, where loading it needs neither disk nor a self-fetch.
const serverAssets = 'dist/server/assets'
const manifests = (await readdir(serverAssets)).filter((name) =>
  /^ai-search-manifest-.*\.json\.gz$/.test(name),
)
if (manifests.length > 1) throw new Error('Expected one Vocs AI search manifest')
await writeFile(
  'dist/cloudflare/cloudflare-build.json',
  JSON.stringify({
    redirects: config.redirects ?? [],
    aiSearch: Boolean(manifests[0]),
    posthog: { key: process.env.VITE_POSTHOG_KEY ?? '', host: process.env.VITE_POSTHOG_HOST ?? '' },
  }),
)
const target = 'dist/cloudflare/ai-search.gz'
if (manifests[0]) await copyFile(`${serverAssets}/${manifests[0]}`, target)
else await writeFile(target, gzipSync('null'))

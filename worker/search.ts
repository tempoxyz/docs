import { gunzipSync } from 'node:zlib'
import { defineConfig, Retriever } from 'vocs/config'
import manifest from '../dist/cloudflare/ai-search.gz'
import build from '../dist/cloudflare/cloudflare-build.json'
import { docsRetriever } from '../src/lib/docs-ai-retriever'

const loadManifest = () => JSON.parse(gunzipSync(new Uint8Array(manifest)).toString())

export async function search(request: Request) {
  const retriever =
    process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID
      ? docsRetriever()
      : undefined
  // A build without an AI index keeps keyword search available. Avoid rebuilding
  // the index on a request if runtime credentials arrive before the next build.
  if (!retriever || !build.aiSearch) {
    return Response.json({ error: 'AI search not enabled' }, { status: 404 })
  }
  const config = defineConfig({ ai: { retriever }, codeHighlight: { langs: [] } })
  return Retriever.handleSearchRequest(request, config, {
    loadManifest: async () => loadManifest(),
  })
}

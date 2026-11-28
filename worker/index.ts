import build from '../dist/cloudflare/cloudflare-build.json'
import { trackDocsRequest } from '../src/lib/docs-request-analytics'
import { handleApi } from './api'
import { serveAsset } from './assets'
import { edgeRedirect, edgeRewrite } from './routes'

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }) {
    const startedAt = performance.now()
    const url = new URL(request.url)
    const redirect = edgeRedirect(url)
    if (redirect) return redirect

    const target = edgeRewrite(url)
    // Serve both the strip-prefix and doubled RSC URLs used by the web proxy.
    if (target.pathname.startsWith('/developers/RSC/')) {
      target.pathname = target.pathname.slice('/developers'.length)
    }
    const rewritten = target.href === request.url ? request : new Request(target, request)
    if (target.origin !== url.origin) {
      rewritten.headers.delete('host')
      if (url.pathname.startsWith('/ingest/')) {
        rewritten.headers.delete('authorization')
        rewritten.headers.delete('cookie')
      }
      return fetch(rewritten, { redirect: 'manual' })
    }

    const api = handleApi(rewritten, target.pathname)
    if (api) return api
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Not Found', { status: 404 })
    }

    const response = await serveAsset(rewritten, env.ASSETS)
    if (build.posthog.key && (response.ok || response.status === 304)) {
      ctx.waitUntil(trackDocsRequest(rewritten, response.status, startedAt, build.posthog))
    }
    return response
  },
}

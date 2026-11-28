import { POST as faucet, OPTIONS as faucetOptions } from '../src/pages/_api/api/faucet'
import feedback from '../src/pages/_api/api/feedback'
import {
  POST as indexSupply,
  OPTIONS as indexSupplyOptions,
} from '../src/pages/_api/api/index-supply'
import { POST as routesQuote } from '../src/pages/_api/api/routes-quote'
import { POST as zoneRpc } from '../src/pages/_api/api/zone-rpc'

type Handler = (request: Request) => Response | Promise<Response>

// Vocs prerenders the docs and RSC payloads. These handlers need the runtime
// for requests with a body, upstream calls, or a query-specific image.
const routes: Record<string, Record<string, Handler>> = {
  '/api/faucet': { POST: faucet, OPTIONS: faucetOptions },
  '/api/feedback': { POST: feedback, OPTIONS: feedback },
  '/api/index-supply': { POST: indexSupply, OPTIONS: indexSupplyOptions },
  '/api/og': {
    GET: async (request) => (await import('./og')).renderOg(request),
    HEAD: () => new Response(null, { headers: { 'Content-Type': 'image/png' } }),
  },
  '/api/routes-quote': { POST: routesQuote },
  '/api/search': { POST: async (request) => (await import('./search')).search(request) },
  '/api/zone-rpc': { POST: zoneRpc },
}

export function handleApi(request: Request, pathname: string) {
  if (!Object.hasOwn(routes, pathname)) return
  const handlers = routes[pathname]
  if (Object.hasOwn(handlers, request.method)) return handlers[request.method](request)
  return new Response(null, {
    status: 405,
    headers: { Allow: Object.keys(handlers).join(', ') },
  })
}

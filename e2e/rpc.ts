import type { BrowserContext } from '@playwright/test'

// The page keeps its public RPC URL. Only Node sees the authenticated URL;
// Playwright's request client would record that URL in uploaded traces.
export async function installAuthenticatedRpc(
  context: Pick<BrowserContext, 'route' | 'routeWebSocket'>,
  key: string,
) {
  await context.route(/^https:\/\/rpc\.moderato\.tempo\.xyz\/?$/, async (route) => {
    const request = route.request()
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'POST, OPTIONS',
    }
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers })
      return
    }
    if (request.method() !== 'POST') {
      await route.abort('blockedbyclient')
      return
    }

    try {
      const response = await fetch(`https://rpc.moderato.tempo.xyz/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: request.postData(),
        signal: AbortSignal.timeout(30_000),
        redirect: 'error',
      })
      const body = Buffer.from(await response.arrayBuffer())
      const retryAfter = response.headers.get('retry-after')
      await route.fulfill({
        status: response.status,
        headers: {
          ...headers,
          'content-type': response.headers.get('content-type') ?? 'application/json',
          ...(retryAfter ? { 'retry-after': retryAfter } : {}),
        },
        body,
      })
    } catch {
      // Fetch errors can include the credential-bearing URL. Do not log or
      // surface them to Playwright, which persists failures in CI artifacts.
      await route.abort('failed')
    }
  })
  // Keep failover from silently reconnecting to the anonymous websocket pool.
  await context.routeWebSocket(/^wss:\/\/rpc\.moderato\.tempo\.xyz\/?$/, (socket) =>
    socket.close({ code: 1000, reason: 'Authenticated live tests use HTTP' }),
  )
}

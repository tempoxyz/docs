import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST as quote } from '../pages/_api/api/routes-quote'
import { POST as zoneRpc } from '../pages/_api/api/zone-rpc'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('docs API upstreams', () => {
  it.each([
    {
      name: 'Routes quote',
      handler: quote,
      path: '/api/routes-quote',
      headers: {},
      body: { kind: 'transfers' },
    },
    {
      name: 'Zone RPC',
      handler: zoneRpc,
      path: '/api/zone-rpc?zone=6',
      headers: { 'x-authorization-token': '0x00' },
      body: { jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] },
    },
  ])('$name keeps credentials at the configured upstream', async (entry) => {
    vi.stubEnv('ROUTES_QUOTE_API_KEY', 'test-quote-key')
    vi.stubEnv('ZONE_RPC_BASIC_AUTH', 'test:zone')
    const send = vi.fn(async () => Response.redirect('https://elsewhere.example/', 307))
    vi.stubGlobal('fetch', send)

    const headers = new Headers(Object.entries(entry.headers) as [string, string][])
    headers.set('content-type', 'application/json')
    const response = await entry.handler(
      new Request(`https://example.com${entry.path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(entry.body),
      }),
    )

    expect(response.status).toBe(502)
    expect(send).toHaveBeenCalledExactlyOnceWith(
      expect.any(URL),
      expect.objectContaining({ redirect: 'manual' }),
    )
  })
})

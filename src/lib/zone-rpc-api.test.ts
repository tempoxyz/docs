import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '../pages/_api/api/zone-rpc'
import { getZoneRpcHttpUrl, getZoneRpcTransportConfig, ZONE_A, ZONE_B } from './private-zones'

const fetchMock = vi.fn<typeof fetch>()
const token = '0x1234'
const rpc = {
  jsonrpc: '2.0',
  id: 7,
  method: 'eth_call',
  params: [{ to: ZONE_A.portalAddress }, 'latest'],
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

function request(zone = '6', body: unknown = rpc, auth: string | null = token) {
  return new Request(`http://localhost:5174/api/zone-rpc?zone=${zone}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(auth ? { 'X-Authorization-Token': auth } : {}),
    },
    body: JSON.stringify(body),
  })
}

describe('sandbox Zone RPC proxy', () => {
  test.each(['0', '8', 'https://example.com', '__proto__'])('rejects target %s', async (zone) => {
    expect((await POST(request(zone))).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each([
    null,
    'not-a-token',
    `0x${'a'.repeat(8192)}`,
  ])('requires a bounded signed Zone token', async (auth) => {
    expect((await POST(request('6', rpc, auth))).status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each([
    [rpc],
    { ...rpc, method: 'admin_addPeer' },
    { ...rpc, params: 'invalid' },
  ])('rejects unsupported or batched RPC requests', async (body) => {
    expect((await POST(request('6', body))).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('rejects an oversized request even without Content-Length', async () => {
    expect((await POST(request('6', { ...rpc, params: ['x'.repeat(128 * 1024)] }))).status).toBe(
      413,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each([
    ['6', ZONE_A],
    ['7', ZONE_B],
  ])('forwards zone %s without changing the request or response', async (id, zone) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 7, result: '0x0' })
    fetchMock.mockResolvedValueOnce(
      new Response(body, { headers: { 'content-type': 'application/json' } }),
    )
    const response = await POST(request(id))
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe(new URL(zone.rpcUrl).toString())
    expect(new URL(String(url)).username).toBe('')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify(rpc))
    expect(new Headers(init?.headers).get('X-Authorization-Token')).toBe(token)
    expect(new Headers(init?.headers).get('authorization')).toMatch(/^Basic /)
    expect(init?.redirect).toBe('error')
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    expect(await response.text()).toBe(body)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('authorization')).toBeNull()
  })

  test('accepts omitted params for methods without arguments', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ result: '0x1' }))
    expect(
      (await POST(request('6', { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber' }))).status,
    ).toBe(200)
  })

  test('preserves upstream token rejection', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }))
    expect((await POST(request())).status).toBe(403)
  })

  test('does not expose upstream error details', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Sensitive upstream details'))
    const response = await POST(request())
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('Sensitive')
  })

  test('bounds upstream response size', async () => {
    fetchMock.mockResolvedValueOnce(new Response('x'.repeat(2 * 1024 * 1024 + 1)))
    expect((await POST(request())).status).toBe(502)
  })

  test('browser demo URLs use the same-origin route without HTTP credentials', () => {
    expect(getZoneRpcHttpUrl(ZONE_A.id, ZONE_A.rpcUrl)).toBe('/api/zone-rpc?zone=6')
    expect(getZoneRpcTransportConfig(ZONE_A.id, ZONE_A.rpcUrl)).toBeUndefined()
    expect(new URL(ZONE_A.rpcUrl).username).toBe('')
    expect(new URL(ZONE_B.rpcUrl).username).toBe('')
    expect(getZoneRpcHttpUrl(8, 'https://example.com')).toBe('https://example.com/')
  })
})

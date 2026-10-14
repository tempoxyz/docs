import { createPublicClient } from 'viem'
import { tempoModerato } from 'viem/chains'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '../pages/_api/api/demo-rpc'
import { getDemoRpcTransport } from './demo-rpc'

const fetchMock = vi.fn<typeof fetch>()
const key = 'test-key/with?reserved=characters'
const call = { jsonrpc: '2.0', id: 7, method: 'eth_chainId', params: [] }
const request = (body: unknown = call, headers: Record<string, string> = {}) =>
  new Request('https://tempo.xyz/developers/api/demo-rpc?upstream=https://example.com', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('TEMPO_RPC_API_KEY', key)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(Response.json({ jsonrpc: '2.0', id: 7, result: '0xa5bf' }))
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('demo RPC proxy', () => {
  test('uses the fixed authenticated upstream without forwarding browser credentials', async () => {
    const response = await POST(request(call, { authorization: 'browser-auth', cookie: 'private' }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ jsonrpc: '2.0', id: 7, result: '0xa5bf' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`https://rpc.moderato.tempo.xyz/${encodeURIComponent(key)}`)
    expect(init?.body).toBe(JSON.stringify(call))
    expect(init?.headers).toEqual({ 'content-type': 'application/json' })
    expect(init?.redirect).toBe('error')
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    expect([...response.headers]).toEqual([
      ['cache-control', 'no-store'],
      ['content-type', 'application/json'],
    ])
  })

  test('supports faucet calls and five-call batches', async () => {
    const batch = Array.from({ length: 5 }, (_, id) => ({
      ...call,
      id,
      method: 'tempo_fundAddress',
      params: ['0x0000000000000000000000000000000000000001'],
    }))
    expect((await POST(request(batch))).status).toBe(200)
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify(batch))
  })

  test.each([
    null,
    [],
    Array.from({ length: 6 }, () => call),
    { ...call, method: 'admin_addPeer' },
    [call, { ...call, method: 'debug_traceTransaction' }],
    { ...call, jsonrpc: '1.0' },
    { ...call, params: {} },
    { ...call, id: {} },
    'invalid JSON',
  ])('rejects unsupported payload %j before using the key', async (body) => {
    expect((await POST(request(body))).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('rejects cross-site browser requests', async () => {
    expect((await POST(request(call, { 'sec-fetch-site': 'cross-site' }))).status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('rejects simple cross-origin form requests', async () => {
    expect((await POST(request(call, { 'content-type': 'text/plain' }))).status).toBe(415)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('bounds the request even without Content-Length', async () => {
    expect((await POST(request({ ...call, params: ['x'.repeat(128 * 1024)] }))).status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('bounds the upstream response', async () => {
    fetchMock.mockResolvedValueOnce(new Response('x'.repeat(2 * 1024 * 1024 + 1)))
    expect((await POST(request())).status).toBe(502)
  })

  test('preserves gateway throttling and Retry-After', async () => {
    const body = { jsonrpc: '2.0', id: 7, error: { code: -32005, message: 'Rate limited' } }
    fetchMock.mockResolvedValueOnce(
      Response.json(body, { status: 429, headers: { 'retry-after': '2' } }),
    )
    const response = await POST(request())
    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('2')
    expect(await response.json()).toEqual(body)
  })

  test('sanitizes fetch errors containing the key', async () => {
    fetchMock.mockRejectedValueOnce(
      new Error(`Failed to fetch https://rpc.moderato.tempo.xyz/${key}`),
    )
    const response = await POST(request())
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: 'The demo RPC is unavailable. Try again later.' },
    })
  })

  test.each([
    key,
    encodeURIComponent(key),
  ])('does not expose a key echoed by the gateway', async (echo) => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: { message: `Invalid key: ${echo}` } }))
    const response = await POST(request())
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: 'The demo RPC is unavailable. Try again later.' },
    })
  })

  test('keeps anonymous RPC available to forks without a secret', async () => {
    vi.stubEnv('TEMPO_RPC_API_KEY', '')
    expect((await POST(request())).status).toBe(200)
    expect(fetchMock.mock.calls[0][0]).toBe('https://rpc.moderato.tempo.xyz/')
  })
})

describe('demo browser transport', () => {
  test.each([
    ['preview', '/api/demo-rpc'],
    ['production', '/developers/api/demo-rpc'],
  ])('uses the %s mount without putting the key in browser requests', async (env, path) => {
    vi.stubEnv('VERCEL_ENV', env)
    vi.stubEnv('VITE_RPC_PROXY', 'true')
    fetchMock.mockImplementation(async (url, init) => {
      expect(url).toBe(path)
      const input = new Request(url, init)
      expect(input.url).toBe(`https://tempo.xyz${path}`)
      expect(input.headers.get('authorization')).toBeNull()
      const calls = await input.json()
      return Response.json(calls.map((rpc: typeof call) => ({ ...rpc, result: '0xa5bf' })))
    })
    // Node's Request needs an absolute URL; browsers resolve it against the page.
    const NodeRequest = Request
    vi.stubGlobal(
      'Request',
      class extends NodeRequest {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
          super(typeof input === 'string' ? new URL(input, 'https://tempo.xyz') : input, init)
        }
      },
    )
    const client = createPublicClient({ chain: tempoModerato, transport: getDemoRpcTransport() })
    expect(await client.getChainId()).toBe(tempoModerato.id)
  })
})

test('keeps the existing transports until the deployment enables the proxy', () => {
  vi.stubEnv('VITE_RPC_PROXY', '')
  const transport = getDemoRpcTransport()({ chain: tempoModerato })
  expect(transport.config.type).toBe('fallback')
  expect(fetchMock).not.toHaveBeenCalled()
})

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '../pages/_api/api/routes-quote'

const fetchMock = vi.fn<typeof fetch>()
const quote = { sourceAmount: { baseUnits: '1000000' }, requestId: 'req_1' }

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('ROUTES_QUOTE_API_KEY', 'docs-key')
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(Response.json(quote))
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const request = (
  body: unknown,
  headers: Record<string, string> = { 'content-type': 'application/json' },
) =>
  new Request('http://localhost:5174/api/routes-quote', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('Routes quote proxy', () => {
  test.each([
    {},
    { kind: 'transfers/..' },
    { kind: 'deposits' },
    { kind: '__proto__' },
    { kind: ['transfers'] },
  ])('rejects quote type %j', async (body) => {
    expect((await POST(request(body))).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each(['', 'null', '[]', '"transfers"', '{'])('rejects body %j', async (body) => {
    expect((await POST(request(body))).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('forwards only quote parameters, with the server-side key', async () => {
    const response = await POST(
      request({
        kind: 'deposit-addresses',
        amount: '1000000',
        sourceChain: 'eip155:8453',
        cursor: 'x',
        limit: 9,
      }),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual(quote)
    const [target, init] = fetchMock.mock.calls[0]
    expect(String(target)).toBe(
      'https://api.tempo.xyz/v1/routes/deposit-addresses/quote?amount=1000000&sourceChain=eip155%3A8453',
    )
    expect(init?.headers).toEqual({ 'tempo-api-key': 'docs-key' })
    expect(init?.redirect).toBe('error')
  })

  test.each([
    { sender: { address: '0x1' } },
    { recipient: ['0x1'] },
    { amount: '1'.repeat(129) },
  ])('rejects parameter values that are not short scalars: %j', async (values) => {
    expect((await POST(request({ kind: 'transfers', ...values }))).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('only accepts JSON bodies, which browsers preflight across sites', async () => {
    const response = await POST(request({ kind: 'transfers' }, { 'content-type': 'text/plain' }))
    expect(response.status).toBe(415)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('passes API errors through for the demo to explain', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ error: { code: 'routes_not_allowed' } }, { status: 403 }),
    )
    const response = await POST(request({ kind: 'transfers', amount: '1' }))
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: { code: 'routes_not_allowed' } })
  })

  test('says when no docs key is configured', async () => {
    vi.stubEnv('ROUTES_QUOTE_API_KEY', '')
    const response = await POST(request({ kind: 'transfers', amount: '1' }))
    expect(response.status).toBe(503)
    expect((await response.json()).error.code).toBe('quote_proxy_unavailable')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('refuses requests from other sites', async () => {
    const response = await POST(
      request(
        { kind: 'transfers' },
        { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
      ),
    )
    expect(response.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('reports an unreachable API as a gateway error', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    expect((await POST(request({ kind: 'transfers', amount: '1' }))).status).toBe(502)
  })
})

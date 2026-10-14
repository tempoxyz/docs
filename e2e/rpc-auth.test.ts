import { expect, test } from '@playwright/test'
import { installAuthenticatedRpc } from './rpc'

const key = 'fixture-key/with?reserved=characters'
const rpc = 'https://rpc.moderato.tempo.xyz/'
const originalFetch = globalThis.fetch

test.afterEach(() => {
  globalThis.fetch = originalFetch
})

test('authenticates in Node without changing browser requests', async ({ context, page }) => {
  const upstream: { url: string; options: RequestInit | undefined }[] = []
  globalThis.fetch = async (url, options) => {
    upstream.push({ url: String(url), options })
    return new Response('{"jsonrpc":"2.0","id":1,"result":"0xa5bf"}')
  }
  await installAuthenticatedRpc(context, key)
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  const body = '[{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}]'
  const result = await page.evaluate(
    async ({ rpc, body }) => {
      const response = await fetch(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })
      return response.json()
    },
    { rpc, body },
  )
  expect(result.result).toBe('0xa5bf')
  expect(upstream).toHaveLength(1)
  expect(upstream[0].url).toBe(`${rpc}${encodeURIComponent(key)}`)
  expect(upstream[0].options?.redirect).toBe('error')
  expect(upstream[0].options?.body?.toString()).toBe(body)
  expect(requests).toEqual([rpc])
})

test('preserves upstream rate limits', async ({ context, page }) => {
  globalThis.fetch = async () =>
    new Response('{"error":{"code":-32005,"message":"rate limited"}}', {
      status: 429,
      headers: { 'retry-after': '2', 'content-type': 'application/json' },
    })
  await installAuthenticatedRpc(context, key)
  const responsePromise = page.waitForResponse(rpc)
  const result = await page.evaluate(async (rpc) => {
    const response = await fetch(rpc, { method: 'POST', body: '{}' })
    return {
      status: response.status,
      body: await response.json(),
    }
  }, rpc)
  expect((await responsePromise).headers()['retry-after']).toBe('2')
  expect(result.status).toBe(429)
  expect(result.body.error.code).toBe(-32005)
})

test('does not expose upstream failures or credentials', async ({ context, page }) => {
  globalThis.fetch = async () => {
    throw new Error(`request failed at ${rpc}${key}`)
  }
  await installAuthenticatedRpc(context, key)
  const error = await page.evaluate(async (rpc) => {
    try {
      await fetch(rpc, { method: 'POST', body: '{}' })
      return 'unexpected success'
    } catch (error) {
      return String(error)
    }
  }, rpc)
  expect(error).toBe('TypeError: Failed to fetch')
})

test('prevents anonymous websocket fallback', async ({ context, page }) => {
  await installAuthenticatedRpc(context, key)
  await page.goto('data:text/html,<title>RPC transport</title>')
  const result = await page.evaluate(
    () =>
      new Promise<{ code: number; reason: string }>((resolve) => {
        const socket = new WebSocket('wss://rpc.moderato.tempo.xyz/')
        socket.onclose = (event) => resolve({ code: event.code, reason: event.reason })
      }),
  )
  expect(result).toEqual({ code: 1000, reason: 'Authenticated live tests use HTTP' })
})

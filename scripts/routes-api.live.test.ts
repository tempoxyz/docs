/**
 * Live checks for every Routes API endpoint, on every route a project API key can use.
 *
 *   TEMPO_API_KEY=… pnpm test:routes-api
 *
 * - `TEMPO_API_KEY` (required): a project key with `routes:read` and `routes:write`. It is sent
 *   only to api.tempo.xyz, in the `tempo-api-key` header.
 * - `ROUTES_TEST_ADDRESS`: the EVM address used as sender, recipient, and refund address. Defaults
 *   to a new random address each run, so runs do not tie a key to anyone's wallet.
 * - `ROUTES_TEST_TRON_ADDRESS`, `ROUTES_TEST_SOLANA_ADDRESS`: addresses for Tron and Solana routes,
 *   which are skipped without them.
 * - `ROUTES_TEST_AMOUNT`: the amount per quote, in whole tokens. Defaults to 1.
 * - `ROUTES_DOCS_URL`: also check the docs quote proxy on this deployment, such as
 *   https://docs.tempo.xyz. `VERCEL_AUTOMATION_BYPASS_SECRET` opens a protected preview.
 *
 * Each run creates one transfer and one deposit address per route. Nothing funds them, so no money
 * moves: transfers expire unsigned, and the deposit addresses stay empty. Deposit addresses count
 * toward the organization's limit.
 */
import { randomBytes, randomUUID } from 'node:crypto'
import { describe, expect, test } from 'vitest'
import { routesApi, sourceActionSchema } from '../src/lib/routes-execution'
import {
  directorySchema,
  routeQuoteRequest,
  routeTestRequest,
  type TestRoute,
} from '../src/lib/routes-test'

const key = process.env.TEMPO_API_KEY?.trim() ?? ''
if (!key)
  throw new Error('Set TEMPO_API_KEY to a project API key with routes:read and routes:write.')
const amount = process.env.ROUTES_TEST_AMOUNT ?? '1'
const addresses: Record<string, string | undefined> = {
  hex: process.env.ROUTES_TEST_ADDRESS ?? `0x${randomBytes(20).toString('hex')}`,
  base58check: process.env.ROUTES_TEST_TRON_ADDRESS,
  base58: process.env.ROUTES_TEST_SOLANA_ADDRESS,
}
const docsUrl = process.env.ROUTES_DOCS_URL

type Reply = { status: number; body: Record<string, unknown> }

async function api(
  method: 'GET' | 'POST',
  path: string,
  {
    query,
    body,
    idempotencyKey,
    anonymous = false,
  }: {
    query?: Record<string, unknown>
    body?: Record<string, unknown>
    idempotencyKey?: string
    anonymous?: boolean
  } = {},
): Promise<Reply> {
  const url = new URL(routesApi + path)
  for (const [name, value] of Object.entries(query ?? {})) url.searchParams.set(name, String(value))
  const response = await fetch(url, {
    method,
    headers: {
      ...(anonymous ? {} : { 'tempo-api-key': key }),
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : {} }
}

/** Fail with the API's error code and request ID, which is what support needs to trace it. */
function expectOk(reply: Reply, label: string) {
  const error = reply.body.error as { code?: string; message?: string } | undefined
  const reference = `${label}: HTTP ${reply.status} ${error?.code ?? ''} ${error?.message ?? ''} (request ${reply.body.requestId ?? 'none'})`
  expect(reply.status, reference).toBeGreaterThanOrEqual(200)
  expect(reply.status, reference).toBeLessThan(300)
  return reply.body
}

async function directory(anonymous: boolean) {
  const routes: TestRoute[] = []
  let cursor: string | null = null
  do {
    const reply = await api('GET', '', {
      query: { limit: 50, ...(cursor ? { cursor } : {}) },
      anonymous,
    })
    const page = directorySchema.parse(expectOk(reply, 'GET /v1/routes'))
    routes.push(...page.data)
    cursor = page.nextCursor
  } while (cursor)
  return routes
}

const label = (route: TestRoute) =>
  `${route.sourceToken.symbol} on ${route.sourceChain.name} → ${route.destinationToken.symbol} on ${route.destinationChain.name}`
const runId = randomUUID()
const listed = (body: Record<string, unknown>) =>
  (body.data as { id: string }[]).map((item) => item.id)

// Read the directory before collecting tests, so every route gets its own block.
const publicRoutes = await directory(true)
const keyRoutes = await directory(false)

describe('route directory', () => {
  test('lists routes without a key', () => {
    expect(publicRoutes.length).toBeGreaterThan(0)
  })
  test('this key can use every listed route', () => {
    expect(keyRoutes.map((r) => r.id).sort()).toEqual(publicRoutes.map((r) => r.id).sort())
  })
})

describe.each(keyRoutes.map((route) => [label(route), route] as const))('%s', (_, route) => {
  const sender = addresses[route.sourceChain.addressFormat]
  const recipient = addresses[route.destinationChain.addressFormat]
  const ready = !!sender && !!recipient
  const input = {
    amount,
    mode: 'exactSource' as const,
    sender: sender ?? '',
    recipient: recipient ?? '',
    refundAddress: sender ?? '',
  }

  describe.skipIf(!ready || !route.capabilities.transfer?.modes.includes('exactSource'))(
    'transfer',
    () => {
      const request = { ...input, method: 'transfer' as const }
      const idempotencyKey = `docs-live-${runId}-${route.id}-transfer`
      let id = ''

      test('GET /transfers/quote', async () => {
        const quote = expectOk(
          await api('GET', '/transfers/quote', { query: routeQuoteRequest(route, request) }),
          'quote',
        )
        expect(quote).toMatchObject({ sourceAmount: expect.any(Object), fees: expect.any(Array) })
        expect(quote.destinationAmount).toBeDefined()
      })
      test.runIf(!!route.subsidies?.transfer)(
        'GET /transfers/quote with subsidize=true',
        async () => {
          const query = routeQuoteRequest(route, { ...request, subsidize: true })
          expect(
            expectOk(await api('GET', '/transfers/quote', { query }), '1:1 quote'),
          ).toMatchObject({
            subsidize: true,
          })
        },
      )
      test('POST /transfers', async () => {
        const body = routeTestRequest(route, request)
        const created = expectOk(
          await api('POST', '/transfers', { body, idempotencyKey }),
          'create',
        )
        id = String(created.id)
        expect(id).toMatch(/^rtr_/)
        expect(created.status).toBe('awaiting-source')
        expect(sourceActionSchema.parse(created.action).calls.length).toBeGreaterThan(0)
        // A retry with the same idempotency key returns the same transfer, never a second one.
        const replay = expectOk(await api('POST', '/transfers', { body, idempotencyKey }), 'replay')
        expect(replay.id).toBe(id)
      })
      test('GET /transfers/{id}', async () => {
        expect(id, 'needs the created transfer').not.toBe('')
        expect(expectOk(await api('GET', `/transfers/${id}`), 'read')).toMatchObject({
          id,
          status: 'awaiting-source',
        })
      })
      test('GET /transfers', async () => {
        expect(id, 'needs the created transfer').not.toBe('')
        const list = expectOk(await api('GET', '/transfers', { query: { limit: 100 } }), 'list')
        expect(listed(list)).toContain(id)
      })
      test('POST /transfers/{id}/source-transactions refuses an unknown hash', async () => {
        expect(id, 'needs the created transfer').not.toBe('')
        const reply = await api('POST', `/transfers/${id}/source-transactions`, {
          body: { transactionHashes: [`0x${'0'.repeat(64)}`] },
        })
        // The endpoint is reachable and authorized, and it checks the hash against the source chain.
        expect(reply.status, JSON.stringify(reply.body)).toBeGreaterThanOrEqual(400)
        expect(reply.status, JSON.stringify(reply.body)).toBeLessThan(500)
        expect([401, 403]).not.toContain(reply.status)
        expect((reply.body.error as { code?: string }).code).toMatch(/^source_transaction_/)
      })
    },
  )

  describe.skipIf(!ready || !route.capabilities.depositAddress)('deposit address', () => {
    const request = { ...input, method: 'depositAddress' as const }
    const idempotencyKey = `docs-live-${runId}-${route.id}-deposit`
    let id = ''
    let address = ''

    test('GET /deposit-addresses/quote', async () => {
      const query = routeQuoteRequest(route, request)
      const quote = expectOk(await api('GET', '/deposit-addresses/quote', { query }), 'quote')
      expect(quote).toMatchObject({ sourceAmount: expect.any(Object), fees: expect.any(Array) })
    })
    test.runIf(!!route.subsidies?.depositAddress)(
      'GET /deposit-addresses/quote with subsidize=true',
      async () => {
        const query = routeQuoteRequest(route, { ...request, subsidize: true })
        const quote = expectOk(await api('GET', '/deposit-addresses/quote', { query }), '1:1 quote')
        expect(quote).toMatchObject({ subsidize: true })
      },
    )
    test('POST /deposit-addresses', async () => {
      const body = routeTestRequest(route, request)
      const created = expectOk(
        await api('POST', '/deposit-addresses', { body, idempotencyKey }),
        'create',
      )
      id = String(created.id)
      address = String(created.address)
      expect(created.status).toBe('active')
      expect(address).not.toBe('')
      const replay = expectOk(
        await api('POST', '/deposit-addresses', { body, idempotencyKey }),
        'replay',
      )
      expect(replay.id).toBe(id)
    })
    test('GET /deposit-addresses/{id}', async () => {
      expect(id, 'needs the created deposit address').not.toBe('')
      expect(expectOk(await api('GET', `/deposit-addresses/${id}`), 'read')).toMatchObject({
        id,
        address,
        status: 'active',
      })
    })
    test('GET /deposit-addresses', async () => {
      expect(id, 'needs the created deposit address').not.toBe('')
      const list = expectOk(
        await api('GET', '/deposit-addresses', { query: { limit: 100 } }),
        'list',
      )
      expect(listed(list)).toContain(id)
    })
    test('POST /deposit-addresses/{id}/reconcile', async () => {
      expect(id, 'needs the created deposit address').not.toBe('')
      expectOk(await api('POST', `/deposit-addresses/${id}/reconcile`), 'reconcile')
    })
    test('GET /deposits?depositAddress=', async () => {
      expect(address, 'needs the created deposit address').not.toBe('')
      const list = expectOk(
        await api('GET', '/deposits', { query: { depositAddress: address } }),
        'list deposits',
      )
      expect(list.data).toEqual([])
    })
  })
})

describe('deposit reads', () => {
  test('GET /deposits/{id} answers routes_deposit_not_found for an unknown deposit', async () => {
    const reply = await api('GET', '/deposits/rdp_docs_live_missing')
    expect(reply.status).toBe(404)
    expect((reply.body.error as { code?: string }).code).toBe('routes_deposit_not_found')
  })
})

describe.runIf(!!docsUrl)('docs quote proxy', () => {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

  test.each(publicRoutes.map((route) => [label(route), route] as const))('%s', async (_, route) => {
    const sender = addresses[route.sourceChain.addressFormat] ?? ''
    const recipient = addresses[route.destinationChain.addressFormat] ?? ''
    // Deposit address quotes need no addresses, so they cover routes without test addresses.
    const transfer =
      !!route.capabilities.transfer?.modes.includes('exactSource') && !!sender && !!recipient
    const query = routeQuoteRequest(route, {
      amount,
      method: transfer ? 'transfer' : 'depositAddress',
      mode: 'exactSource',
      sender,
      recipient,
      refundAddress: sender,
    })
    const response = await fetch(`${new URL(docsUrl ?? '').origin}/api/routes-quote`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}),
      },
      body: JSON.stringify({ kind: transfer ? 'transfers' : 'deposit-addresses', ...query }),
      signal: AbortSignal.timeout(30_000),
    })
    const body = await response.json()
    expect(response.status, JSON.stringify(body)).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body.sourceAmount).toBeDefined()
  })
})

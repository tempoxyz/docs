import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  erc20Address,
  executeRoutesRequest,
  isSubsidyRefusal,
  loadRoutes,
  quoteRequest,
  RoutesApiError,
  requestUrl,
  retryOn,
  submitTempoCalls,
} from './routes-execution'
import type { TestRoute } from './routes-test'

const sender = `0x${'1'.repeat(40)}`
const recipient = `0x${'2'.repeat(40)}`
const hash = `0x${'a'.repeat(64)}`
const route: TestRoute = {
  id: 'route',
  sourceChain: { id: 'eip155:1', name: 'Ethereum', addressFormat: 'hex' },
  destinationChain: { id: 'eip155:4217', name: 'Tempo', addressFormat: 'hex' },
  sourceToken: { tokenKey: 'source', symbol: 'USDC', decimals: 6 },
  destinationToken: { tokenKey: 'destination', symbol: 'USDCe', decimals: 6 },
  capabilities: { transfer: { modes: ['exactSource'] }, depositAddress: true },
}
const input = {
  method: 'transfer' as const,
  mode: 'exactSource' as const,
  amount: '1.5',
  sender,
  recipient,
  refundAddress: sender,
}
const call = { to: recipient, data: '0x1234', value: '0x0' }
const future = () => new Date(Date.now() + 60_000).toISOString()
afterEach(() => vi.unstubAllGlobals())

it('executes the complete API lifecycle using returned IDs and a stable creation key', async () => {
  const responses = [
    { sourceAmount: { formatted: '1.5' }, destinationAmount: { formatted: '1.49' } },
    { id: 'rtr_test', action: { type: 'evm:calls', calls: [call] } },
    { id: 'rtr_test', status: 'processing' },
    { id: 'rtr_test', status: 'completed', destinationTransactionHashes: [hash] },
  ]
  const fetcher = vi.fn().mockImplementation(async () => Response.json(responses.shift()))
  vi.stubGlobal('fetch', fetcher)
  await executeRoutesRequest(quoteRequest(route, input), 'secret')
  const created = await executeRoutesRequest(
    { method: 'POST', path: '/transfers', body: { ...input }, idempotencyKey: 'same-key' },
    'secret',
  )
  await executeRoutesRequest(
    {
      method: 'POST',
      path: `/transfers/${created.data.id}/source-transactions`,
      body: { transactionHashes: [hash] },
    },
    'secret',
  )
  const status = await executeRoutesRequest(
    { method: 'GET', path: `/transfers/${created.data.id}` },
    'secret',
  )
  expect(status.data.status).toBe('completed')
  expect(fetcher.mock.calls[0][0]).toContain('amount=1500000')
  for (const [, options] of fetcher.mock.calls) {
    expect(options.headers['tempo-api-key']).toBe('secret')
    expect(options.credentials).toBe('omit')
    expect(options.redirect).toBe('error')
  }
  expect(fetcher.mock.calls[1][1].headers['idempotency-key']).toBe('same-key')
  expect(fetcher.mock.calls[2][1].body).toBe(JSON.stringify({ transactionHashes: [hash] }))
})
it('explains subsidy rejections and keeps other API errors verbatim', () => {
  const subsidy = new RoutesApiError({
    status: 403,
    data: { error: { code: 'routes_subsidy_not_allowed', message: 'Forbidden' }, requestId: 'r' },
  })
  expect(subsidy.message).toContain('not approved for 1:1 delivery')
  expect(isSubsidyRefusal(subsidy)).toBe(true)
  expect(
    isSubsidyRefusal(
      new RoutesApiError({ status: 403, data: { error: { code: 'routes_not_allowed' } } }),
    ),
  ).toBe(false)
  const other = new RoutesApiError({ status: 400, data: { error: { code: 'query_invalid' } } })
  expect(other.message).toContain('query_invalid')
  const upstream = new RoutesApiError({
    status: 502,
    data: {
      error: {
        code: 'upstream_error',
        message: 'The transfer route could not be prepared right now.',
      },
      requestId: 'req_1',
    },
  })
  expect(upstream.message).toBe(
    'The transfer route could not be prepared right now. (upstream_error · request req_1)',
  )
})
it('retains API error bodies, rejects non-Routes paths, and never puts keys in URLs', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ code: 'routes_not_allowed' }, { status: 403 }))
  vi.stubGlobal('fetch', fetcher)
  await expect(
    executeRoutesRequest(
      { method: 'POST', path: '/transfers', idempotencyKey: 'existing', body: {} },
      'secret',
    ),
  ).rejects.toMatchObject({ result: { status: 403, data: { code: 'routes_not_allowed' } } })
  expect(fetcher.mock.calls[0][0]).not.toContain('secret')
  for (const path of [
    'https://other.example',
    '//other.example',
    '/transfers/../../management',
    '/transfers?id=x',
  ])
    expect(() => requestUrl({ method: 'GET', path })).toThrow()
  await expect(executeRoutesRequest({ method: 'GET', path: '/transfers' }, '')).rejects.toThrow(
    'API key',
  )
})
it('quotes without a key at public pricing, and with one at the organization pricing', async () => {
  const fetcher = vi.fn().mockImplementation(async () => Response.json({ sourceAmount: {} }))
  vi.stubGlobal('fetch', fetcher)
  const quote = quoteRequest(route, { ...input, method: 'depositAddress' })
  await executeRoutesRequest(quote, ' ')
  const [url, init] = fetcher.mock.calls[0]
  expect(url).toBe(
    'https://api.tempo.xyz/v1/routes/deposit-addresses/quote?amount=1500000&sourceChain=eip155%3A1&sourceToken=source&destinationToken=destination&subsidize=false',
  )
  expect(init.headers).toEqual({})
  await executeRoutesRequest(quote, 'key')
  expect(fetcher.mock.calls[1][1].headers).toEqual({ 'tempo-api-key': 'key' })
  // Everything past a quote needs the reader's own key.
  await expect(
    executeRoutesRequest({ method: 'POST', path: '/deposit-addresses', body: {} }, ''),
  ).rejects.toThrow('Add your project API key to continue.')
  expect(fetcher).toHaveBeenCalledTimes(2)
})
it('falls back to the docs quote proxy while the API still requires a key', async () => {
  const missing = () =>
    Response.json({ error: { code: 'api_key_missing' }, requestId: 'm' }, { status: 401 })
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(missing())
    .mockResolvedValueOnce(Response.json({ sourceAmount: { formatted: '1.5' } }))
    .mockResolvedValueOnce(missing())
    .mockResolvedValueOnce(
      Response.json({ error: { code: 'routes_not_allowed' }, requestId: 'r' }, { status: 403 }),
    )
  vi.stubGlobal('fetch', fetcher)
  const quote = quoteRequest(route, { ...input, method: 'depositAddress' })
  await executeRoutesRequest(quote, '')
  expect(fetcher.mock.calls[1][0]).toBe(
    '/api/routes-quote?kind=deposit-addresses&amount=1500000&sourceChain=eip155%3A1&sourceToken=source&destinationToken=destination&subsidize=false',
  )
  await expect(executeRoutesRequest(quote, '')).rejects.toThrow(
    'The docs demo key cannot quote this route. Add your project API key to quote this route. (routes_not_allowed · request r)',
  )
})
it('runs deposit quote, creation, paginated discovery and individual status reads', async () => {
  const quote = quoteRequest(route, { ...input, method: 'depositAddress' })
  expect(quote.query).not.toHaveProperty('recipient')
  expect(quote.query).not.toHaveProperty('refundAddress')
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ data: [{ id: 'rdp_one' }], nextCursor: 'next-page' }))
  vi.stubGlobal('fetch', fetcher)
  const result = await executeRoutesRequest(
    { method: 'GET', path: '/deposits', query: { depositAddress: 'Taddr', cursor: 'next-page' } },
    'key',
  )
  expect(result.data.nextCursor).toBe('next-page')
  expect(fetcher.mock.calls[0][0]).toContain('depositAddress=Taddr&cursor=next-page')
})
it('loads all directory pages and refuses partial catalogs', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ data: [route], nextCursor: 'page2' }))
    .mockResolvedValueOnce(Response.json({ data: [route], nextCursor: null }))
  vi.stubGlobal('fetch', fetcher)
  expect(await loadRoutes(new AbortController().signal)).toHaveLength(2)
  expect(fetcher.mock.calls[1][0].toString()).toContain('cursor=page2')
  fetcher
    .mockReset()
    .mockImplementation(async () => Response.json({ data: [route], nextCursor: 'loop' }))
  await expect(loadRoutes(new AbortController().signal)).rejects.toThrow('complete')
})

describe('Tempo Wallet source submission', () => {
  const options = (overrides: Partial<Parameters<typeof submitTempoCalls>[1]> = {}) => ({
    chainId: 4217,
    sender,
    connected: sender.toUpperCase().replace('0X', '0x'),
    calls: [call, call],
    expiresAt: future(),
    required: { amount: 1_000_000n, symbol: 'USDT0', decimals: 6 },
    readBalance: vi.fn(async () => 5_000_000n),
    simulate: vi.fn(async () => 21_000n),
    onHash: vi.fn(),
    ...overrides,
  })
  it('sends every call in one unsponsored batch and retains its hash', async () => {
    const sendCalls = vi.fn(async () => ({
      status: 'success',
      receipts: [{ transactionHash: hash }],
    }))
    const opts = options({ onBroadcast: vi.fn() })
    expect(await submitTempoCalls(sendCalls, opts)).toBe(hash)
    expect(sendCalls).toHaveBeenCalledExactlyOnceWith({
      calls: [
        { to: call.to, data: call.data, value: BigInt(call.value) },
        { to: call.to, data: call.data, value: BigInt(call.value) },
      ],
      chainId: 4217,
      capabilities: { feePayer: false },
    })
    expect(opts.onBroadcast).toHaveBeenCalledOnce()
    expect(opts.onHash).toHaveBeenCalledWith(hash)
  })
  it('explains an insufficient source balance before simulating or opening the wallet', async () => {
    const sendCalls = vi.fn()
    const opts = options({ readBalance: vi.fn(async () => 0n) })
    await expect(submitTempoCalls(sendCalls, opts)).rejects.toThrow(
      'Not enough USDT0: the sender holds 0 USDT0 and this transfer sends 1 USDT0.',
    )
    expect(opts.simulate).not.toHaveBeenCalled()
    expect(sendCalls).not.toHaveBeenCalled()
  })
  it('never opens the wallet for a batch that would revert', async () => {
    const sendCalls = vi.fn()
    const opts = options({
      onBroadcast: vi.fn(),
      simulate: vi.fn(async () => {
        throw new Error('No trading pair exists for these tokens.')
      }),
    })
    await expect(submitTempoCalls(sendCalls, opts)).rejects.toThrow('No trading pair')
    expect(opts.simulate).toHaveBeenCalledOnce()
    expect(opts.onBroadcast).not.toHaveBeenCalled()
    expect(sendCalls).not.toHaveBeenCalled()
  })
  it('refuses expired actions and accounts other than the sender', async () => {
    const sendCalls = vi.fn()
    await expect(
      submitTempoCalls(sendCalls, options({ expiresAt: '2000-01-01T00:00:00Z' })),
    ).rejects.toThrow('expired')
    await expect(submitTempoCalls(sendCalls, options({ connected: recipient }))).rejects.toThrow(
      'sender',
    )
    await expect(submitTempoCalls(sendCalls, options({ connected: undefined }))).rejects.toThrow(
      'sender',
    )
    expect(sendCalls).not.toHaveBeenCalled()
  })
  it('keeps the hash of a reverted batch so it can still be registered', async () => {
    const opts = options()
    await expect(
      submitTempoCalls(
        async () => ({ status: 'failure', receipts: [{ transactionHash: hash }] }),
        opts,
      ),
    ).rejects.toThrow('reverted')
    expect(opts.onHash).toHaveBeenCalledWith(hash)
    await expect(submitTempoCalls(async () => ({ status: 'success' }), options())).rejects.toThrow(
      'no transaction hash',
    )
  })
})

it('reads ERC-20 addresses from directory token keys', () => {
  expect(erc20Address('eip155:4217/erc20:0x20c00000000000000000000014f22ca97301eb73')).toBe(
    '0x20c00000000000000000000014f22ca97301eb73',
  )
  expect(erc20Address('tron:0x2b6653dc/trc20:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')).toBeUndefined()
})

it('turns network failures and timeouts into readable errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  await expect(executeRoutesRequest({ method: 'GET', path: '/transfers' }, 'key')).rejects.toThrow(
    'Could not reach api.tempo.xyz',
  )
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(Object.assign(new Error('timeout'), { name: 'TimeoutError' })),
  )
  await expect(executeRoutesRequest({ method: 'GET', path: '/transfers' }, 'key')).rejects.toThrow(
    'did not respond in time',
  )
})

it('loads the directory under the caller policy when a key is given', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ data: [route], nextCursor: null }))
    .mockResolvedValueOnce(
      Response.json(
        { error: { code: 'unauthorized', message: 'Invalid API key.' }, requestId: 'r' },
        { status: 401 },
      ),
    )
  vi.stubGlobal('fetch', fetcher)
  await loadRoutes(new AbortController().signal, ' key ')
  expect(fetcher.mock.calls[0][1].headers).toEqual({ 'tempo-api-key': 'key' })
  await expect(loadRoutes(new AbortController().signal, 'bad')).rejects.toThrow(
    'The API key was rejected. Check your project API key. (unauthorized · request r)',
  )
})

it('explains every kind of API failure with its code and request ID', () => {
  const message = (status: number, data: Record<string, unknown>) =>
    new RoutesApiError({ status, data }).message
  expect(
    message(401, { error: { code: 'api_key_invalid', message: 'Invalid' }, requestId: 'r1' }),
  ).toBe('The API key was rejected. Check your project API key. (api_key_invalid · request r1)')
  expect(message(404, { error: { code: 'quote_not_available', message: 'x' } })).toContain(
    'No quote is available for this route right now.',
  )
  expect(message(503, { error: { code: 'subsidy_inventory_unavailable', message: 'x' } })).toBe(
    'Subsidized delivery is temporarily unavailable. (subsidy_inventory_unavailable)',
  )
  expect(
    message(400, {
      error: {
        code: 'body_invalid',
        message: 'Invalid body.',
        details: [{ message: 'amount is required' }],
      },
    }),
  ).toBe('Invalid body. amount is required. (body_invalid)')
  expect(message(429, {})).toBe('Too many requests. Wait a moment, then try again. (rate_limited)')
  expect(message(500, {})).toBe(
    'The Routes API could not complete this request. Try again shortly.',
  )
  expect(
    new RoutesApiError({ status: 409, data: { error: { code: 'idempotency_in_progress' } } }).code,
  ).toBe('idempotency_in_progress')
})

it('retries only the error codes it is told are transient', async () => {
  const pending = new RoutesApiError({
    status: 409,
    data: { error: { code: 'source_transaction_pending' } },
  })
  const run = vi.fn().mockRejectedValueOnce(pending).mockResolvedValueOnce('registered')
  await expect(retryOn(['source_transaction_pending'], run, { intervalMs: 0 })).resolves.toBe(
    'registered',
  )
  expect(run).toHaveBeenCalledTimes(2)
  const conflict = new RoutesApiError({
    status: 409,
    data: { error: { code: 'source_transaction_conflict' } },
  })
  const once = vi.fn().mockRejectedValue(conflict)
  await expect(retryOn(['source_transaction_pending'], once, { intervalMs: 0 })).rejects.toBe(
    conflict,
  )
  expect(once).toHaveBeenCalledTimes(1)
  const always = vi.fn().mockRejectedValue(pending)
  await expect(
    retryOn(['source_transaction_pending'], always, { attempts: 3, intervalMs: 0 }),
  ).rejects.toBe(pending)
  expect(always).toHaveBeenCalledTimes(3)
})

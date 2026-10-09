import { expect, type Page, test } from '@playwright/test'
import { base58Encode } from '../src/lib/base58'

// Drives the Routes demo against a scripted Routes API, browser wallet, and Tempo RPC, so every
// funding path and its main failure modes run without credentials, funds, or live liquidity.

const demo = '/docs/routes/test'
const key = 'test-routes-key'
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
}
const sender = `0x${'1'.repeat(40)}`
const tempoRecipient = `0x${'2'.repeat(40)}`
const tronRecipient = 'TFegAih8buiLL9zWvpsCsX4bp3FsGkuzGY'
const depositAddress = `0x${'d'.repeat(40)}`
const usd = (formatted: string) => ({
  baseUnits: String(Math.round(Number(formatted) * 1e6)),
  decimals: 6,
  formatted,
  currency: 'USD',
})
const future = () => new Date(Date.now() + 10 * 60_000).toISOString()

const chains = {
  base: { id: 'eip155:8453', name: 'Base', addressFormat: 'hex' },
  tempo: { id: 'eip155:4217', name: 'Tempo', addressFormat: 'hex' },
  tron: { id: 'tron:0x2b6653dc', name: 'Tron', addressFormat: 'base58check' },
  solana: {
    id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana',
    addressFormat: 'base58',
  },
}
const usdce = {
  tokenKey: 'eip155:4217/erc20:0x20c000000000000000000000b9537d11c60e8b50',
  symbol: 'USDC.e',
  decimals: 6,
}
// Both flows, both subsidized.
const baseToTempo = {
  id: 'base-usdc-tempo-usdce',
  sourceChain: chains.base,
  sourceToken: {
    tokenKey: 'eip155:8453/erc20:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    symbol: 'USDC',
    decimals: 6,
  },
  destinationChain: chains.tempo,
  destinationToken: usdce,
  capabilities: { depositAddress: true, transfer: { modes: ['exactSource'] } },
  subsidies: { depositAddress: true, transfer: true },
}
// Transfer only, Tempo source (Tempo Wallet signing), no subsidy.
const tempoToTron = {
  id: 'tempo-usdt0-tron-usdt',
  sourceChain: chains.tempo,
  sourceToken: {
    tokenKey: 'eip155:4217/erc20:0x20c00000000000000000000014f22ca97301eb73',
    symbol: 'USDT0',
    decimals: 6,
  },
  destinationChain: chains.tron,
  destinationToken: {
    tokenKey: 'tron:0x2b6653dc/trc20:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    symbol: 'USDT',
    decimals: 6,
  },
  capabilities: { transfer: { modes: ['exactSource'] } },
  subsidies: { transfer: false },
}
// Deposit only, non-EVM source.
const solanaToTempo = {
  id: 'solana-usdc-tempo-usdce',
  sourceChain: chains.solana,
  sourceToken: {
    tokenKey:
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    decimals: 6,
  },
  destinationChain: chains.tempo,
  destinationToken: usdce,
  capabilities: { depositAddress: true },
  subsidies: { depositAddress: true },
}
// Deposit only, Tron source, as the live project policy allows.
const tronToTempo = {
  id: 'tron-usdt-tempo-usdt0',
  sourceChain: chains.tron,
  sourceToken: tempoToTron.destinationToken,
  destinationChain: chains.tempo,
  destinationToken: tempoToTron.sourceToken,
  capabilities: { depositAddress: true },
  subsidies: { depositAddress: true },
}
const directory = { body: { data: [baseToTempo, tempoToTron, solanaToTempo], nextCursor: null } }

const transferQuote = {
  sourceAmount: usd('1'),
  destinationAmount: usd('0.9991'),
  destinationAmountMin: usd('0.999'),
  // Transfers can charge source-network gas in the native asset, as Base to Tempo does live.
  fees: [
    {
      amount: { baseUnits: '100600590374639', decimals: 18, formatted: '0.000100600590374639' },
      side: 'source',
      token: { symbol: 'ETH', decimals: 18, tokenKey: 'eip155:8453/slip44:60' },
    },
  ],
  subsidize: false,
  quote: { expiresAt: future() },
}
const createdTransfer = {
  ...transferQuote,
  id: 'rtx_1',
  status: 'awaiting-source',
  action: {
    type: 'evm:calls',
    calls: [
      { to: `0x${'a'.repeat(40)}`, data: '0x095ea7b3', value: '0x0' },
      { to: `0x${'b'.repeat(40)}`, data: '0x12345678', value: '0x0' },
    ],
  },
}
const subsidizedDepositQuote = {
  sourceAmount: usd('1'),
  destinationAmount: usd('0.9591'),
  destinationAmountMin: usd('0.9591'),
  fees: [],
  subsidize: true,
}
const createdDepositAddress = {
  subsidize: true,
  id: 'rda_1',
  address: depositAddress,
  status: 'active',
}
const deposit = { id: 'rdp_1', status: 'detected', sourceAmount: usd('1') }
const apiError = (status: number, code: string, message: string, requestId: string) => ({
  status,
  body: { error: { code, message }, requestId },
})

type Reply = { status?: number; body: unknown }
type Recorded = {
  method: string
  path: string
  query: URLSearchParams
  headers: Record<string, string>
  body: unknown
}

/** Replies are consumed in order; the last one repeats. Unscripted calls fail loudly. */
async function mockRoutesApi(page: Page, replies: Record<string, Reply[]>) {
  const requests: Recorded[] = []
  await page.route('https://api.tempo.xyz/v1/**', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const url = new URL(request.url())
    let body: unknown
    try {
      body = request.postDataJSON()
    } catch {
      body = undefined
    }
    requests.push({
      method: request.method(),
      path: url.pathname,
      query: url.searchParams,
      headers: request.headers(),
      body,
    })
    const queue = replies[`${request.method()} ${url.pathname}`]
    const reply = !queue?.length
      ? apiError(404, 'not_found', `Unscripted ${request.method()} ${url.pathname}`, 'unscripted')
      : queue.length > 1
        ? (queue.shift() as Reply)
        : queue[0]
    await route.fulfill({
      status: reply.status ?? 200,
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify(reply.body),
    })
  })
  return {
    requests,
    to: (method: string, path: string) =>
      requests.filter((r) => r.method === method && r.path === path),
  }
}

/** Answers the docs quote proxy, which quotes for readers who have not added a key. */
async function mockQuoteProxy(page: Page, replies: Reply[]) {
  const requests: URLSearchParams[] = []
  await page.route('**/api/routes-quote?**', async (route) => {
    requests.push(new URL(route.request().url()).searchParams)
    const reply = replies.length > 1 ? (replies.shift() as Reply) : replies[0]
    await route.fulfill({
      status: reply.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(reply.body),
    })
  })
  return requests
}

/** `failSend` makes that send attempt fail once inside the wallet, as Phantom's -32603 does. */
/**
 * Scripted EVM wallets, announced through EIP-6963 for wagmi to connect (one "Browser wallet" by
 * default), and Base's own node, which wagmi reads receipts and gas estimates from.
 */
async function mockBrowserWallet(
  page: Page,
  { reject = false, failSend = 0, wallets = ['Browser wallet'] } = {},
) {
  await page.addInitScript(
    ({ account, reject, failSend, wallets }) => {
      const byName: Record<string, { method: string; params?: unknown[] }[]> = {}
      const wallet = (calls: { method: string; params?: unknown[] }[]) => {
        let sent = 0
        let attempts = 0
        return {
          on() {},
          removeListener() {},
          async request({ method, params }: { method: string; params?: unknown[] }) {
            calls.push({ method, params })
            if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [account]
            if (method === 'eth_chainId') return '0x2105'
            if (method === 'eth_getTransactionCount') return `0x${sent.toString(16)}`
            if (method === 'eth_sendTransaction') {
              if (reject)
                throw Object.assign(new Error('User rejected the request.'), { code: 4001 })
              if (++attempts === failSend)
                throw Object.assign(new Error('Unexpected error'), { code: -32603 })
              sent += 1
              return `0x${String(sent).padStart(64, '0')}`
            }
            return null
          },
        }
      }
      const calls: { method: string; params?: unknown[] }[] = []
      const announced = wallets.map((name, index) => {
        byName[name] = index === 0 ? calls : []
        const info = {
          uuid: `wallet-${index}`,
          name,
          rdns: `com.example.${name.toLowerCase().replace(/\s+/g, '')}`,
          icon: 'data:image/svg+xml;base64,PHN2Zy8+',
        }
        return { info, provider: wallet(byName[name]) }
      })
      const announce = () => {
        for (const detail of announced)
          window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }))
      }
      window.addEventListener('eip6963:requestProvider', announce)
      Object.assign(window, {
        __walletCalls: calls,
        __walletCallsByName: byName,
        ethereum: announced[0]?.provider,
      })
      announce()
    },
    { account: sender, reject, failSend, wallets },
  )
  await page.route('https://mainnet.base.org/**', (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const payload = route.request().postDataJSON()
    const answer = ({ id, method, params }: { id: number; method: string; params?: string[] }) => ({
      jsonrpc: '2.0',
      id,
      result:
        method === 'eth_chainId'
          ? '0x2105'
          : method === 'eth_blockNumber'
            ? '0x10'
            : method === 'eth_estimateGas'
              ? '0x5208'
              : method === 'eth_getTransactionReceipt'
                ? {
                    status: '0x1',
                    blockNumber: '0x10',
                    transactionHash: params?.[0],
                    logs: [],
                    type: '0x2',
                  }
                : null,
    })
    return route.fulfill({
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify(Array.isArray(payload) ? payload.map(answer) : answer(payload)),
    })
  })
}

/** Answers Tempo mainnet RPC reads, including the source-token `balanceOf` call. */
async function mockTempoBalance(page: Page, balance: bigint) {
  await page.route('https://rpc.tempo.xyz/**', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const payload = request.postDataJSON()
    const answer = (call: { id: number; method: string }) => ({
      jsonrpc: '2.0',
      id: call.id,
      result:
        call.method === 'eth_chainId'
          ? '0x1079'
          : call.method === 'eth_call'
            ? `0x${balance.toString(16).padStart(64, '0')}`
            : null,
    })
    await route.fulfill({
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify(Array.isArray(payload) ? payload.map(answer) : answer(payload)),
    })
  })
}

/** Add a key through the header pill and wait for the directory to reload with it. */
async function addKey(page: Page, value: string, pill = 'Add API key') {
  const keyed = page.waitForResponse(
    (response) =>
      response.url().startsWith('https://api.tempo.xyz/v1/routes?') &&
      response.request().headers()['tempo-api-key'] === value,
    { timeout: 15_000 },
  )
  await button(page, pill).click()
  await page.getByLabel('Project API key').fill(value)
  await button(page, 'Use key').click()
  await keyed
}

/** A TIP-6963 Tron wallet whose tronWeb records what it signs, and TronGrid receipts. */
async function mockTronWallet(page: Page, account: string) {
  await page.addInitScript((account) => {
    const signed: string[] = []
    let sent = 0
    const tronWeb = {
      defaultAddress: { base58: account },
      transactionBuilder: {
        async triggerSmartContract(to: string, _s: string, options: { input: string }) {
          const value = { contract_address: to, data: options.input }
          return {
            result: { result: true },
            transaction: { txID: '', raw_data: { contract: [{ parameter: { value } }] } },
          }
        },
      },
      trx: {
        async sign(tx: { raw_data: { contract: { parameter: { value: { data: string } } }[] } }) {
          signed.push(tx.raw_data.contract[0].parameter.value.data)
          return tx
        },
        async sendRawTransaction() {
          sent += 1
          return { result: true, txid: String(sent).repeat(64) }
        },
        async getBlockByNumber() {
          return { blockID: `${'0'.repeat(56)}2b6653dc` }
        },
      },
    }
    const provider = { request: async () => [account], tronWeb }
    const detail = Object.freeze({ info: { uuid: 'tronlink', name: 'TronLink' }, provider })
    const announce = () =>
      window.dispatchEvent(new CustomEvent('TIP6963:announceProvider', { detail }))
    window.addEventListener('TIP6963:requestProvider', announce)
    Object.assign(window, { __tronSigned: signed })
  }, account)
  await page.route('https://api.trongrid.io/**', (route) =>
    route.request().method() === 'OPTIONS'
      ? route.fulfill({ status: 204, headers: cors })
      : route.fulfill({
          headers: cors,
          contentType: 'application/json',
          body: JSON.stringify({ blockNumber: 1, receipt: { result: 'SUCCESS' } }),
        }),
  )
}

const solanaAccount = '11111111111111111111111111111111'
/** A Wallet Standard Solana wallet that records what it signs, and the Solana RPC it reads. */
async function mockSolanaWallet(page: Page) {
  await page.addInitScript((address) => {
    const sent: { chain: string; transaction: number[] }[] = []
    const account = {
      address,
      publicKey: new Uint8Array(32),
      chains: ['solana:mainnet'],
      features: ['solana:signAndSendTransaction'],
    }
    const wallet = {
      version: '1.0.0',
      name: 'Phantom',
      icon: 'data:image/svg+xml;base64,PHN2Zy8+',
      chains: ['solana:mainnet'],
      accounts: [account],
      features: {
        'standard:connect': { version: '1.0.0', connect: async () => ({ accounts: [account] }) },
        'solana:signAndSendTransaction': {
          version: '1.0.0',
          supportedTransactionVersions: ['legacy', 0],
          async signAndSendTransaction(input: { chain: string; transaction: Uint8Array }) {
            sent.push({ chain: input.chain, transaction: [...input.transaction] })
            return [{ signature: new Uint8Array(64).fill(7) }]
          },
        },
      },
    }
    const register = (api: { register: (w: unknown) => void }) => api.register(wallet)
    window.addEventListener('wallet-standard:app-ready', (event) =>
      register((event as CustomEvent).detail),
    )
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }))
    Object.assign(window, { __solanaSent: sent })
  }, solanaAccount)
  const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  const results: Record<string, (params: unknown[]) => unknown> = {
    getAccountInfo: ([address]) => ({
      context: { slot: 1 },
      value:
        address === solanaToTempo.sourceToken.tokenKey.split(':').at(-1)
          ? {
              owner: tokenProgram,
              data: ['', 'base64'],
              executable: false,
              lamports: 1,
              rentEpoch: 0,
              space: 82,
            }
          : null,
    }),
    getLatestBlockhash: () => ({
      context: { slot: 1 },
      value: { blockhash: solanaAccount, lastValidBlockHeight: 100 },
    }),
    getSignatureStatuses: () => ({
      context: { slot: 1 },
      value: [{ slot: 1, confirmations: null, err: null, confirmationStatus: 'confirmed' }],
    }),
    getBlockHeight: () => 1,
  }
  await page.route('https://solana-rpc.publicnode.com/**', (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const { id, method, params } = route.request().postDataJSON()
    return route.fulfill({
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify({ jsonrpc: '2.0', id, result: results[method]?.(params) ?? null }),
    })
  })
}

async function openDemo(page: Page) {
  await page.goto(demo)
  // The anonymous directory load proves the demo has hydrated before the key is added.
  await expect(fromSelect(page, 'Network')).toBeEnabled({ timeout: 30_000 })
  await addKey(page, key)
  await expect(fromSelect(page, 'Network')).toBeEnabled()
}
const fromSelect = (page: Page, label: string) =>
  page.getByRole('group', { name: 'From' }).getByLabel(label)
const toSelect = (page: Page, label: string) =>
  page.getByRole('group', { name: 'To' }).getByLabel(label)
async function chooseRoute(page: Page, from: [string, string], to: [string, string]) {
  await fromSelect(page, 'Network').selectOption({ label: from[0] })
  await fromSelect(page, 'Asset').selectOption({ label: from[1] })
  await toSelect(page, 'Network').selectOption({ label: to[0] })
  await toSelect(page, 'Asset').selectOption({ label: to[1] })
}
const lifecycle = (page: Page) => page.locator('.routes-test-lifecycle')
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

async function quoteBaseTransfer(page: Page) {
  await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
  await page.getByLabel('Amount (USDC)').fill('1')
  await page.getByLabel('Sender on Base').fill(sender)
  await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)
  await button(page, 'Get quote').click()
  await expect(lifecycle(page)).toContainText('0.9991 USDC.e')
}

async function createBaseDepositAddress(page: Page) {
  await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
  await button(page, 'Deposit address').click()
  await page.getByLabel('Amount (USDC)').fill('1')
  await button(page, 'Get quote').click()
  await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)
  await page.getByLabel('Refund address on Base').fill(sender)
  await button(page, 'Create').click()
  await expect(lifecycle(page)).toContainText(depositAddress)
}

test.use({ viewport: { width: 1280, height: 1000 } })

test.describe('Routes demo', () => {
  test('loads routes for the key and offers only supported combinations and methods', async ({
    page,
  }) => {
    const api = await mockRoutesApi(page, { 'GET /v1/routes': [directory] })
    await openDemo(page)
    expect(api.to('GET', '/v1/routes').at(-1)?.headers['tempo-api-key']).toBe(key)

    // A single valid continuation fills itself in.
    await fromSelect(page, 'Network').selectOption({ label: 'Tempo' })
    await expect(fromSelect(page, 'Asset')).toHaveValue(tempoToTron.sourceToken.tokenKey)
    await expect(toSelect(page, 'Network')).toHaveValue(chains.tron.id)
    await expect(toSelect(page, 'Asset')).toHaveValue(tempoToTron.destinationToken.tokenKey)
    await expect(button(page, 'Transfer')).toHaveAttribute('aria-pressed', 'true')
    await expect(button(page, 'Deposit address')).toBeDisabled()

    // Non-EVM sources fund a deposit address.
    await fromSelect(page, 'Network').selectOption({ label: 'Solana' })
    await expect(button(page, 'Transfer')).toBeDisabled()
    await expect(button(page, 'Deposit address')).toHaveAttribute('aria-pressed', 'true')
    // Deposit quotes price the route alone; the recipient and refund address come at creation.
    await expect(page.getByLabel('Amount (USDC)')).toBeVisible()
    await expect(page.getByLabel('Refund address on Solana')).toHaveCount(0)

    // Both flows, with the subsidy offered.
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await expect(button(page, 'Transfer')).toBeEnabled()
    await expect(button(page, 'Deposit address')).toBeEnabled()
  })

  test('transfers from a browser wallet and tracks delivery', async ({ page }) => {
    await mockBrowserWallet(page)
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [{ status: 201, body: createdTransfer }],
      'POST /v1/routes/transfers/rtx_1/source-transactions': [
        { body: { id: 'rtx_1', status: 'processing' } },
      ],
      'GET /v1/routes/transfers/rtx_1': [
        { body: { id: 'rtx_1', status: 'completed', destinationAmount: usd('0.9991') } },
      ],
    })
    await openDemo(page)
    await quoteBaseTransfer(page)

    // Transfer fees are charged on top of the routed amount, here in ETH.
    await expect(lifecycle(page)).toContainText(
      'You send1 USDCRecipient gets0.9991 USDC.eFee0.0001006 ETH',
    )
    const [quote] = api.to('GET', '/v1/routes/transfers/quote')
    expect(Object.fromEntries(quote.query)).toMatchObject({
      amount: '1000000',
      mode: 'exactSource',
      sender,
      recipient: tempoRecipient,
      // The route offers 1:1 delivery, so the demo asks for it.
      subsidize: 'true',
    })

    await button(page, 'Create').click()
    await expect(lifecycle(page)).toContainText(
      'Browser wallet signs 2 transactions from the sender, one at a time.',
    )
    // One wallet needs no picker.
    await expect(page.locator('#routes-wallet')).toHaveCount(0)
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText('Delivered 0.9991 USDC.e.')

    // After delivery, the footer links to instructions for an agent to repeat the run.
    const instructions = page.getByRole('link', { name: 'Instructions for an AI agent ↗' })
    await expect(instructions).toBeVisible()
    const markdown = await page.evaluate(
      async (href) => (await fetch(href ?? '')).text(),
      await instructions.getAttribute('href'),
    )
    expect(markdown).toContain('# Send 1 USDC from USDC on Base to USDC.e on Tempo')
    expect(markdown).toContain('sender=<SENDER>')
    expect(markdown).not.toContain(sender)

    const [create] = api.to('POST', '/v1/routes/transfers')
    expect(create.headers['idempotency-key']).toMatch(/^[0-9a-f-]{36}$/)
    expect(create.headers['tempo-api-key']).toBe(key)
    expect(api.to('POST', '/v1/routes/transfers/rtx_1/source-transactions')[0].body).toEqual({
      transactionHashes: [`0x${'1'.padStart(64, '0')}`, `0x${'2'.padStart(64, '0')}`],
    })
    const walletCalls = await page.evaluate(
      () => (window as unknown as { __walletCalls: { method: string }[] }).__walletCalls,
    )
    expect(walletCalls.filter((call) => call.method === 'eth_sendTransaction')).toHaveLength(2)
  })

  test('connects the wallet the reader chooses when several are installed', async ({ page }) => {
    await mockBrowserWallet(page, { wallets: ['Rabby', 'MetaMask'] })
    await mockRoutesApi(page, { 'GET /v1/routes': [directory] })
    await openDemo(page)
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await lifecycle(page).getByRole('button', { name: '(Connect)' }).first().click()
    await expect(lifecycle(page)).toContainText('Sender on Base · Connect with Rabby · MetaMask')
    await lifecycle(page).getByRole('button', { name: 'MetaMask', exact: true }).click()
    await expect(page.getByLabel('Sender on Base')).toHaveValue(sender)

    const prompted = await page.evaluate(() =>
      Object.fromEntries(
        Object.entries(
          (window as unknown as { __walletCallsByName: Record<string, { method: string }[]> })
            .__walletCallsByName,
        ).map(([name, calls]) => [
          name,
          calls.some((call) => call.method === 'wallet_requestPermissions'),
        ]),
      ),
    )
    expect(prompted).toEqual({ Rabby: false, MetaMask: true })
  })

  test('signs with the wallet the reader picks when several are installed', async ({ page }) => {
    await mockBrowserWallet(page, { wallets: ['Rabby', 'MetaMask'] })
    await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [{ status: 201, body: createdTransfer }],
      'POST /v1/routes/transfers/rtx_1/source-transactions': [
        { body: { id: 'rtx_1', status: 'processing' } },
      ],
      'GET /v1/routes/transfers/rtx_1': [
        { body: { id: 'rtx_1', status: 'completed', destinationAmount: usd('0.9991') } },
      ],
    })
    await openDemo(page)
    await quoteBaseTransfer(page)
    await button(page, 'Create').click()
    // The label wraps the select, so its accessible name includes the chosen wallet.
    const picker = page.locator('#routes-wallet')
    await expect(picker.locator('option')).toHaveText(['Rabby', 'MetaMask'])
    await picker.selectOption({ label: 'MetaMask' })
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText('Delivered 0.9991 USDC.e.')

    const sent = await page.evaluate(() =>
      Object.fromEntries(
        Object.entries(
          (window as unknown as { __walletCallsByName: Record<string, { method: string }[]> })
            .__walletCallsByName,
        ).map(([name, calls]) => [
          name,
          calls.filter((call) => call.method === 'eth_sendTransaction').length,
        ]),
      ),
    )
    expect(sent).toEqual({ Rabby: 0, MetaMask: 2 })
  })

  test('quotes subsidized 1:1 delivery and watches a deposit through delivery', async ({
    page,
  }) => {
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [{ body: subsidizedDepositQuote }],
      'POST /v1/routes/deposit-addresses': [{ status: 201, body: createdDepositAddress }],
      'GET /v1/routes/deposits': [
        { body: { data: [], nextCursor: null } },
        { body: { data: [deposit], nextCursor: null } },
      ],
      'GET /v1/routes/deposits/rdp_1': [
        { body: { ...deposit, status: 'completed', destinationAmount: usd('1') } },
      ],
    })
    await openDemo(page)
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await button(page, 'Deposit address').click()
    await page.getByLabel('Amount (USDC)').fill('1')
    await expect(page.getByLabel('Recipient on Tempo')).toHaveCount(0)
    await button(page, 'Get quote').click()

    await expect(lifecycle(page)).toContainText('Recipient gets1 USDC.eFeesNone')
    const quoteQuery = Object.fromEntries(
      api.to('GET', '/v1/routes/deposit-addresses/quote')[0].query,
    )
    expect(quoteQuery).toMatchObject({ subsidize: 'true', amount: '1000000' })
    expect(quoteQuery).not.toHaveProperty('recipient')
    expect(quoteQuery).not.toHaveProperty('refundAddress')

    // The deposit address is on the source network and lands on Tempo, where Tempo Wallet can
    // fill in the recipient.
    await expect(lifecycle(page)).toContainText(
      'Routes creates a Base address for this route. USDC sent to it lands automatically as USDC.e in the Tempo wallet below.',
    )
    await expect(lifecycle(page).getByRole('button', { name: '(Connect)' })).toBeEnabled()
    await expect(page.getByLabel('Recipient on Tempo')).toHaveAttribute(
      'placeholder',
      'Tempo destination wallet',
    )
    await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)
    await page.getByLabel('Refund address on Base').fill(sender)
    await button(page, 'Create').click()
    await expect(lifecycle(page)).toContainText(depositAddress)
    await expect(lifecycle(page)).toContainText('Watching for your deposit')
    // The address response has no amounts, so the summary and canvas keep the quote's.
    await expect(lifecycle(page)).toContainText('Recipient gets1 USDC.e')
    await expect(page.getByRole('group', { name: 'From' })).toContainText('1 USDC')
    expect(api.to('POST', '/v1/routes/deposit-addresses')[0].body).toMatchObject({
      recipient: tempoRecipient,
      refundAddress: sender,
      subsidize: true,
    })
    await expect(lifecycle(page)).toContainText('Delivered 1 USDC.e.', { timeout: 20_000 })
    expect(api.to('GET', '/v1/routes/deposits')[0].query.get('depositAddress')).toBe(depositAddress)
  })

  test('quotes without the subsidy when it is refused, and recovers from upstream errors', async ({
    page,
  }) => {
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [
        apiError(403, 'routes_subsidy_not_allowed', 'Forbidden.', 'req_subsidy'),
        apiError(502, 'upstream_error', 'The transfer route could not be prepared.', 'req_up'),
        { body: transferQuote },
      ],
    })
    await openDemo(page)
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await page.getByLabel('Amount (USDC)').fill('1')
    await page.getByLabel('Sender on Base').fill(sender)
    await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)

    // The refused subsidy falls back to a quote without it, which here hits an upstream error.
    await button(page, 'Get quote').click()
    await expect(lifecycle(page)).toContainText(
      'The transfer route could not be prepared. (upstream_error · request req_up)',
    )
    await expect(lifecycle(page)).not.toContainText('routes_subsidy_not_allowed')
    await button(page, 'Get quote').click()
    await expect(lifecycle(page)).toContainText('0.9991 USDC.e')
    await expect(lifecycle(page)).not.toContainText('{"error"')

    const quotes = api.to('GET', '/v1/routes/transfers/quote')
    expect(quotes.map((q) => q.query.get('subsidize'))).toEqual(['true', 'false', 'false'])
  })

  test('retries a failed creation with the same request and idempotency key', async ({ page }) => {
    await mockBrowserWallet(page)
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [
        apiError(503, 'service_unavailable', 'Try again shortly.', 'req_busy'),
        { status: 201, body: createdTransfer },
      ],
    })
    await openDemo(page)
    await quoteBaseTransfer(page)
    await button(page, 'Create').click()
    await expect(lifecycle(page)).toContainText('Try again shortly.')
    await button(page, 'Retry').click()
    await expect(button(page, 'Sign and send')).toBeVisible()

    const creates = api.to('POST', '/v1/routes/transfers')
    expect(creates).toHaveLength(2)
    expect(creates[1].headers['idempotency-key']).toBe(creates[0].headers['idempotency-key'])
    expect(creates[1].body).toEqual(creates[0].body)
  })

  test('keeps a rejected wallet signature retryable and registers nothing', async ({ page }) => {
    await mockBrowserWallet(page, { reject: true })
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [{ status: 201, body: createdTransfer }],
    })
    await openDemo(page)
    await quoteBaseTransfer(page)
    await button(page, 'Create').click()
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText('User rejected the request.')
    await expect(button(page, 'Sign and send')).toBeEnabled()
    await expect(lifecycle(page)).not.toContainText('may have sent this transaction')
    expect(api.to('POST', '/v1/routes/transfers/rtx_1/source-transactions')).toHaveLength(0)
  })

  test('resumes from the failed call when the wallet errors without broadcasting', async ({
    page,
  }) => {
    await mockBrowserWallet(page, { failSend: 2 })
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [{ status: 201, body: createdTransfer }],
      'POST /v1/routes/transfers/rtx_1/source-transactions': [
        { body: { id: 'rtx_1', status: 'processing' } },
      ],
      'GET /v1/routes/transfers/rtx_1': [
        { body: { id: 'rtx_1', status: 'completed', destinationAmount: usd('0.9991') } },
      ],
    })
    await openDemo(page)
    await quoteBaseTransfer(page)
    await button(page, 'Create').click()
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText(
      'Your wallet could not send call 2 of 2, and nothing was broadcast. Call 1 is confirmed, so Sign and send resumes from call 2. If it fails again, try another browser wallet. (Unexpected error · -32603)',
    )
    expect(api.to('POST', '/v1/routes/transfers/rtx_1/source-transactions')).toHaveLength(0)

    await expect(button(page, 'Sign and send')).toBeEnabled()
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText('Delivered 0.9991 USDC.e.')
    const sends = await page.evaluate(() =>
      (
        window as unknown as { __walletCalls: { method: string; params?: { to: string }[] }[] }
      ).__walletCalls.filter((call) => call.method === 'eth_sendTransaction'),
    )
    // The approve went once; only the failed second call was sent again.
    expect(sends).toHaveLength(3)
    expect(sends[1].params?.[0].to).toBe(sends[2].params?.[0].to)
    expect(api.to('POST', '/v1/routes/transfers/rtx_1/source-transactions')[0].body).toEqual({
      transactionHashes: [`0x${'1'.padStart(64, '0')}`, `0x${'2'.padStart(64, '0')}`],
    })
  })

  test('blocks a Tempo transfer the sender cannot fund', async ({ page }) => {
    await mockTempoBalance(page, 0n)
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [
        { body: { ...transferQuote, destinationAmount: usd('0.99') } },
      ],
    })
    await openDemo(page)
    await chooseRoute(page, ['Tempo', 'USDT0'], ['Tron', 'USDT'])
    await page.getByLabel('Amount (USDT0)').fill('1')
    await page.getByLabel('Sender on Tempo').fill(sender)
    await page.getByLabel('Recipient on Tron').fill(tronRecipient)
    await expect(lifecycle(page)).toContainText('Balance: 0 USDT0 (not enough for this amount).')

    await button(page, 'Get quote').click()
    await expect(lifecycle(page)).toContainText(
      'The sender holds 0 USDT0, and this transfer sends 1. Add USDT0 to the sender, then recheck.',
    )
    // A shortfall is a caution (a status line), not an error in the red error box.
    await expect(
      lifecycle(page).getByRole('status').filter({ hasText: 'The sender holds 0 USDT0' }),
    ).toBeVisible()
    await expect(button(page, 'Recheck balance')).toBeVisible()
    await expect(button(page, 'Create')).toHaveCount(0)
    expect(api.to('POST', '/v1/routes/transfers')).toHaveLength(0)
  })

  test('pauses deposit polling on an API error until checked again', async ({ page }) => {
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [{ body: subsidizedDepositQuote }],
      'POST /v1/routes/deposit-addresses': [{ status: 201, body: createdDepositAddress }],
      'GET /v1/routes/deposits': [
        apiError(500, 'internal_error', 'Something went wrong.', 'req_poll'),
        { body: { data: [deposit], nextCursor: null } },
      ],
      'GET /v1/routes/deposits/rdp_1': [
        { body: { ...deposit, status: 'completed', destinationAmount: usd('1') } },
      ],
    })
    await openDemo(page)
    await createBaseDepositAddress(page)
    await expect(lifecycle(page)).toContainText(
      'Something went wrong. (internal_error · request req_poll)',
    )
    // Paused: no further background checks after the failure.
    await page.waitForTimeout(7_000)
    expect(api.to('GET', '/v1/routes/deposits')).toHaveLength(1)

    await button(page, 'Check now').click()
    await expect(lifecycle(page)).toContainText('Delivered 1 USDC.e.')
  })

  test('does not watch or fund an inactive deposit address', async ({ page }) => {
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [{ body: subsidizedDepositQuote }],
      'POST /v1/routes/deposit-addresses': [
        { status: 201, body: { ...createdDepositAddress, status: 'inactive' } },
      ],
    })
    await openDemo(page)
    await createBaseDepositAddress(page)
    await expect(lifecycle(page)).toContainText('This address is not active. Do not fund it.')
    await expect(button(page, 'Check now')).toBeDisabled()
    await page.waitForTimeout(1_500)
    expect(api.to('GET', '/v1/routes/deposits')).toHaveLength(0)
  })

  test('offers a retry when the route directory cannot load', async ({ page }) => {
    await mockRoutesApi(page, {
      'GET /v1/routes': [
        apiError(500, 'internal_error', 'Directory unavailable.', 'req_dir'),
        directory,
      ],
    })
    await page.goto(demo)
    // The first directory load happens on hydration, which can be slow on a cold server.
    await expect(page.locator('.routes-tester')).toContainText(
      'Directory unavailable. (internal_error · request req_dir)',
      { timeout: 30_000 },
    )
    await button(page, 'Retry').click()
    await expect(fromSelect(page, 'Network')).toBeEnabled()
    await expect(fromSelect(page, 'Network').locator('option')).toHaveCount(4)
  })

  test('explains the live Tron failures, and quotes without 1:1 when inventory runs out', async ({
    page,
  }) => {
    await mockTempoBalance(page, 10_000_000n)
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [
        {
          body: {
            data: [{ ...tempoToTron, subsidies: { transfer: true } }, tronToTempo],
            nextCursor: null,
          },
        },
      ],
      'GET /v1/routes/deposit-addresses/quote': [
        apiError(404, 'quote_not_available', 'A quote is currently unavailable.', 'req_tron_dep'),
      ],
      'GET /v1/routes/transfers/quote': [
        apiError(503, 'subsidy_inventory_unavailable', 'Tempo lacks inventory.', 'req_inv'),
        { body: transferQuote },
      ],
    })
    await openDemo(page)
    await chooseRoute(page, ['Tron', 'USDT'], ['Tempo', 'USDT0'])
    await expect(button(page, 'Transfer')).toBeDisabled()
    await page.getByLabel('Amount (USDT)').fill('1')
    await button(page, 'Get quote').click()
    await expect(lifecycle(page)).toContainText(
      'No quote is available for this route right now. Try another amount, or try again later. (quote_not_available · request req_tron_dep)',
    )

    await chooseRoute(page, ['Tempo', 'USDT0'], ['Tron', 'USDT'])
    await page.getByLabel('Amount (USDT0)').fill('1')
    await page.getByLabel('Sender on Tempo').fill(sender)
    await page.getByLabel('Recipient on Tron').fill(tronRecipient)
    // Without subsidy inventory, the demo quotes the route without 1:1 delivery.
    await button(page, 'Get quote').click()
    await expect(lifecycle(page)).toContainText('0.9991 USDT')
    expect(
      api.to('GET', '/v1/routes/transfers/quote').map((q) => q.query.get('subsidize')),
    ).toEqual(['true', 'false'])
  })

  test('keeps registering until the API sees the source transaction', async ({ page }) => {
    await mockBrowserWallet(page)
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [{ status: 201, body: createdTransfer }],
      'POST /v1/routes/transfers/rtx_1/source-transactions': [
        apiError(409, 'source_transaction_pending', 'Not confirmed yet.', 'req_pending'),
        { body: { id: 'rtx_1', status: 'processing' } },
      ],
      'GET /v1/routes/transfers/rtx_1': [
        { body: { id: 'rtx_1', status: 'completed', destinationAmount: usd('0.9991') } },
      ],
    })
    await openDemo(page)
    await quoteBaseTransfer(page)
    await button(page, 'Create').click()
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText('Delivered 0.9991 USDC.e.', { timeout: 20_000 })
    expect(api.to('POST', '/v1/routes/transfers/rtx_1/source-transactions')).toHaveLength(2)
  })

  test('explains a rejected API key without loading routes', async ({ page }) => {
    await mockRoutesApi(page, {
      'GET /v1/routes': [
        directory,
        apiError(401, 'api_key_invalid', 'Invalid API key.', 'req_key'),
      ],
    })
    await page.goto(demo)
    await expect(fromSelect(page, 'Network')).toBeEnabled({ timeout: 30_000 })
    await addKey(page, 'not-a-real-key')
    await expect(page.locator('.routes-tester')).toContainText(
      'The API key was rejected. Check your project API key. (api_key_invalid · request req_key)',
    )
    await expect(button(page, 'Retry')).toBeVisible()
  })
})

test.describe('Routes demo wallets', () => {
  test('fills each address from a wallet on its network', async ({ page }) => {
    const tronTransfer = {
      ...tronToTempo,
      id: 'tron-usdt-tempo-usdt0-transfer',
      capabilities: { depositAddress: true, transfer: { modes: ['exactSource'] } },
    }
    await mockBrowserWallet(page)
    await mockTronWallet(page, tronRecipient)
    await mockSolanaWallet(page)
    await mockRoutesApi(page, {
      'GET /v1/routes': [
        { body: { data: [baseToTempo, tronTransfer, solanaToTempo], nextCursor: null } },
      ],
      'GET /v1/routes/deposit-addresses/quote': [{ body: subsidizedDepositQuote }],
    })
    await openDemo(page)
    const connectFor = (label: string) =>
      page
        .locator('div')
        .filter({ has: page.getByLabel(label) })
        .last()
        .getByRole('button', { name: '(Connect)' })

    // Base: a wagmi browser wallet, without switching its network.
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await connectFor('Sender on Base').click()
    await expect(page.getByLabel('Sender on Base')).toHaveValue(sender)
    await expect(lifecycle(page)).toContainText('Sender on Base (Connected)')
    // An explicit Connect opens the wallet's account picker, even for a site it already knows.
    const requested = await page.evaluate(() =>
      (window as unknown as { __walletCalls: { method: string }[] }).__walletCalls.map(
        (call) => call.method,
      ),
    )
    expect(requested).toContain('wallet_requestPermissions')

    // Tron: a TIP-6963 wallet.
    await chooseRoute(page, ['Tron', 'USDT'], ['Tempo', 'USDT0'])
    await connectFor('Sender on Tron').click()
    await expect(page.getByLabel('Sender on Tron')).toHaveValue(tronRecipient)

    // Solana: a Wallet Standard wallet, for the deposit address's refunds.
    await chooseRoute(page, ['Solana', 'USDC'], ['Tempo', 'USDC.e'])
    await page.getByLabel('Amount (USDC)').fill('1')
    await button(page, 'Get quote').click()
    await connectFor('Refund address on Solana').click()
    await expect(page.getByLabel('Refund address on Solana')).toHaveValue(solanaAccount)
  })

  test('funds a deposit address from a browser wallet', async ({ page }) => {
    await mockBrowserWallet(page)
    await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [{ body: subsidizedDepositQuote }],
      'POST /v1/routes/deposit-addresses': [{ status: 201, body: createdDepositAddress }],
      'GET /v1/routes/deposits': [{ body: { data: [], nextCursor: null } }],
    })
    await openDemo(page)
    await createBaseDepositAddress(page)
    await button(page, 'Send with Browser wallet').click()
    await expect(button(page, 'Sent')).toBeVisible()

    const [transfer] = await page.evaluate(() =>
      (
        window as unknown as {
          __walletCalls: { method: string; params?: { to: string; data: string }[] }[]
        }
      ).__walletCalls.filter((call) => call.method === 'eth_sendTransaction'),
    )
    // An ERC-20 transfer of the quoted 1 USDC to the deposit address.
    expect(transfer.params?.[0].to).toBe(baseToTempo.sourceToken.tokenKey.split(':').at(-1))
    expect(transfer.params?.[0].data).toBe(
      `0xa9059cbb${depositAddress.slice(2).padStart(64, '0')}${(1_000_000).toString(16).padStart(64, '0')}`,
    )
  })

  test('signs a Tron transfer with a TIP-6963 wallet, one call at a time', async ({ page }) => {
    const tronTransfer = {
      ...tronToTempo,
      id: 'tron-usdt-tempo-usdt0-transfer',
      capabilities: { depositAddress: true, transfer: { modes: ['exactSource'] } },
    }
    const usdt = tronToTempo.sourceToken.tokenKey.split(':').at(-1) as string
    await mockTronWallet(page, tronRecipient)
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [{ body: { data: [baseToTempo, tronTransfer], nextCursor: null } }],
      'GET /v1/routes/transfers/quote': [{ body: transferQuote }],
      'POST /v1/routes/transfers': [
        {
          status: 201,
          body: {
            ...createdTransfer,
            action: {
              type: 'tron:calls',
              calls: [
                { to: usdt, data: '0x095ea7b3', value: '0x0' },
                { to: tronRecipient, data: '0x12345678', value: '0x0' },
              ],
            },
          },
        },
      ],
      'POST /v1/routes/transfers/rtx_1/source-transactions': [
        { body: { id: 'rtx_1', status: 'processing' } },
      ],
      'GET /v1/routes/transfers/rtx_1': [
        { body: { id: 'rtx_1', status: 'completed', destinationAmount: usd('0.9991') } },
      ],
    })
    await openDemo(page)
    await chooseRoute(page, ['Tron', 'USDT'], ['Tempo', 'USDT0'])
    await expect(button(page, 'Transfer')).toHaveAttribute('aria-pressed', 'true')
    await page.getByLabel('Amount (USDT)').fill('1')
    await page.getByLabel('Sender on Tron').fill(tronRecipient)
    await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)
    await button(page, 'Get quote').click()
    await button(page, 'Create').click()
    await button(page, 'Sign and send').click()
    await expect(lifecycle(page)).toContainText('Delivered 0.9991 USDT0.', { timeout: 20_000 })

    expect(
      await page.evaluate(() => (window as unknown as { __tronSigned: string[] }).__tronSigned),
    ).toEqual(['095ea7b3', '12345678'])
    // Tron transaction IDs register without a 0x prefix.
    expect(api.to('POST', '/v1/routes/transfers/rtx_1/source-transactions')[0].body).toEqual({
      transactionHashes: ['1'.repeat(64), '2'.repeat(64)],
    })
  })

  test('funds a Solana deposit address with a Wallet Standard wallet', async ({ page }) => {
    const solanaDeposit = 'So11111111111111111111111111111111111111112'
    await mockSolanaWallet(page)
    await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [{ body: subsidizedDepositQuote }],
      'POST /v1/routes/deposit-addresses': [
        { status: 201, body: { ...createdDepositAddress, address: solanaDeposit } },
      ],
      'GET /v1/routes/deposits': [{ body: { data: [], nextCursor: null } }],
    })
    await openDemo(page)
    await chooseRoute(page, ['Solana', 'USDC'], ['Tempo', 'USDC.e'])
    await page.getByLabel('Amount (USDC)').fill('1')
    await button(page, 'Get quote').click()
    await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)
    await page.getByLabel('Refund address on Solana').fill(solanaAccount)
    await button(page, 'Create').click()
    await button(page, 'Send with Phantom').click()
    await expect(button(page, 'Sent')).toBeVisible()
    await expect(lifecycle(page).locator('a[href^="https://solscan.io/tx/"]')).toHaveCount(1)

    const [sent] = await page.evaluate(
      () =>
        (window as unknown as { __solanaSent: { chain: string; transaction: number[] }[] })
          .__solanaSent,
    )
    expect(sent.chain).toBe('solana:mainnet')
    // A legacy transaction: one empty signature, the header, then the accounts it touches.
    const bytes = Uint8Array.from(sent.transaction)
    expect(bytes[0]).toBe(1)
    const message = bytes.slice(65)
    const accounts = Array.from({ length: message[3] }, (_, i) =>
      base58Encode(message.slice(4 + i * 32, 36 + i * 32)),
    )
    expect(accounts[0]).toBe(solanaAccount)
    // Create the deposit address's token account if needed, then transfer to it.
    expect(accounts).toContain('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(accounts).toContain('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    expect(accounts).toContain(solanaDeposit)
  })
})

const keyMissing = apiError(401, 'api_key_missing', 'An API key is required.', 'req_missing')
const organizationQuote = { ...subsidizedDepositQuote, destinationAmount: usd('0.9991') }

test.describe('Routes demo without a key', () => {
  test('quotes at public pricing, then prices for the organization once a key is added', async ({
    page,
  }) => {
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [
        { body: { ...subsidizedDepositQuote, subsidize: false, fees: [] } },
        { body: organizationQuote },
      ],
    })
    const proxied = await mockQuoteProxy(page, [{ body: subsidizedDepositQuote }])
    await page.goto(demo)
    await expect(fromSelect(page, 'Network')).toBeEnabled({ timeout: 30_000 })
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await button(page, 'Deposit address').click()
    await page.getByLabel('Amount (USDC)').fill('1')
    await button(page, 'Get quote').click()

    // The API prices the route publicly, with no key, no docs proxy, and no 1:1 delivery.
    await expect(lifecycle(page)).toContainText(
      'Add your Tempo API key here to create routes with configured pricing. Get yours in the Tempo API console.',
    )
    const [anonymous] = api.to('GET', '/v1/routes/deposit-addresses/quote')
    expect(anonymous.headers['tempo-api-key']).toBeUndefined()
    expect(anonymous.query.get('subsidize')).toBe('false')
    expect(proxied).toHaveLength(0)
    await page.getByRole('button', { name: 'Request' }).click()
    await expect(page.locator('pre')).not.toContainText('tempo-api-key')

    // Adding a key prices the open quote again, for the organization.
    // "here" opens the key panel; the console link is where keys are made.
    await expect(lifecycle(page).getByRole('link', { name: 'Tempo API console' })).toHaveAttribute(
      'href',
      'https://console.tempo.xyz/?to=/:org/api-keys',
    )
    await lifecycle(page).getByRole('button', { name: 'here', exact: true }).click()
    await expect(page.getByLabel('Project API key')).toBeFocused()
    await page.getByLabel('Project API key').fill(key)
    await button(page, 'Use key').click()
    await expect(lifecycle(page)).toContainText('Recipient gets1 USDC.e')
    const keyed = api.to('GET', '/v1/routes/deposit-addresses/quote').at(-1)
    expect(keyed?.headers['tempo-api-key']).toBe(key)
    expect(keyed?.query.get('subsidize')).toBe('true')
  })

  test('quotes through the docs proxy while the API requires a key, then asks for one to create', async ({
    page,
  }) => {
    const api = await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [keyMissing, { body: subsidizedDepositQuote }],
      'POST /v1/routes/deposit-addresses': [{ status: 201, body: createdDepositAddress }],
      'GET /v1/routes/deposits': [{ body: { data: [], nextCursor: null } }],
    })
    const proxied = await mockQuoteProxy(page, [{ body: subsidizedDepositQuote }])
    await page.goto(demo)
    await expect(fromSelect(page, 'Network')).toBeEnabled({ timeout: 30_000 })
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await button(page, 'Deposit address').click()
    await page.getByLabel('Amount (USDC)').fill('1')
    await button(page, 'Get quote').click()

    await expect(lifecycle(page)).toContainText('Recipient gets1 USDC.e')
    expect(Object.fromEntries(proxied[0])).toMatchObject({
      kind: 'deposit-addresses',
      amount: '1000000',
      sourceChain: chains.base.id,
    })
    // The API refused the anonymous quote, so the docs proxy priced it.
    expect(api.to('GET', '/v1/routes/deposit-addresses/quote')).toHaveLength(1)
    await expect(lifecycle(page)).toContainText(
      'Add your Tempo API key here to create routes with configured pricing. Get yours in the Tempo API console.',
    )

    // The key panel opens from step 2, and the route and quote survive the keyed reload.
    await page.getByLabel('Recipient on Tempo').fill(tempoRecipient)
    await page.getByLabel('Refund address on Base').fill(sender)
    const keyed = page.waitForResponse(
      (response) =>
        response.url().startsWith('https://api.tempo.xyz/v1/routes?') &&
        response.request().headers()['tempo-api-key'] === key,
    )
    await button(page, 'Add API key').click()
    await expect(page.getByLabel('Project API key')).toBeFocused()
    await page.getByLabel('Project API key').fill(key)
    await button(page, 'Use key').click()
    await keyed
    await expect(lifecycle(page)).toContainText('Recipient gets1 USDC.e')
    await expect(page.getByLabel('Recipient on Tempo')).toHaveValue(tempoRecipient)
    await button(page, 'Create').click()
    await expect(lifecycle(page)).toContainText(depositAddress)
    expect(api.to('POST', '/v1/routes/deposit-addresses')[0].headers['tempo-api-key']).toBe(key)

    // The key that created the address stays for the rest of the test.
    await page.getByRole('button', { name: /API key/ }).click()
    await expect(page.getByLabel('Project API key')).toBeDisabled()
  })

  test('explains when the docs key cannot quote a route', async ({ page }) => {
    await mockRoutesApi(page, {
      'GET /v1/routes': [directory],
      'GET /v1/routes/deposit-addresses/quote': [keyMissing],
    })
    await mockQuoteProxy(page, [
      apiError(403, 'routes_not_allowed', 'Route not allowed.', 'req_docs'),
    ])
    await page.goto(demo)
    await expect(fromSelect(page, 'Network')).toBeEnabled({ timeout: 30_000 })
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await button(page, 'Deposit address').click()
    await page.getByLabel('Amount (USDC)').fill('1')
    await button(page, 'Get quote').click()
    await expect(lifecycle(page)).toContainText(
      'The docs demo key cannot quote this route. Add your project API key to quote this route. (routes_not_allowed · request req_docs)',
    )
  })

  test('drops a chosen route that the added key cannot use', async ({ page }) => {
    await mockRoutesApi(page, {
      'GET /v1/routes': [
        directory,
        { body: { data: [tempoToTron, solanaToTempo], nextCursor: null } },
      ],
    })
    await page.goto(demo)
    await expect(fromSelect(page, 'Network')).toBeEnabled({ timeout: 30_000 })
    await chooseRoute(page, ['Base', 'USDC'], ['Tempo', 'USDC.e'])
    await addKey(page, key)
    await expect(page.locator('.routes-tester')).toContainText(
      'This key cannot use USDC on Base to USDC.e on Tempo. Choose another route.',
    )
    await expect(fromSelect(page, 'Network')).toBeEnabled()
    await expect(fromSelect(page, 'Network')).toHaveValue('')
  })
})

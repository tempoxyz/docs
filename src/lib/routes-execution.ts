import { formatUnits } from 'viem'
import { z } from 'zod'
import { developersPath } from '../marketing/app/_lib/developersPaths'
import { directorySchema, routeQuoteRequest, type TestRoute } from './routes-test'

export const routesApi = 'https://api.tempo.xyz/v1/routes'
export type ApiRequest = {
  method: 'GET' | 'POST'
  path: string
  body?: Record<string, unknown>
  query?: Record<string, unknown>
  idempotencyKey?: string
}
export type ApiResult = { status: number; data: Record<string, unknown> }
const subsidyHints: Record<string, string> = {
  routes_subsidy_not_allowed: 'This organization is not approved for 1:1 delivery on this route.',
  routes_subsidy_not_enabled: 'Subsidies are not enabled for this organization.',
  routes_subsidy_limit_exceeded: 'This amount exceeds the organization’s subsidy limit.',
  routes_subsidy_pending_limit_exceeded:
    'Too many subsidized payments are pending. Wait for them to complete.',
  subsidy_inventory_unavailable: 'Subsidized delivery is temporarily unavailable.',
  subsidy_balance_unavailable: 'Subsidized delivery is temporarily unavailable.',
  subsidy_signer_unavailable: 'Subsidized delivery is temporarily unavailable.',
  subsidy_failed: 'The subsidy could not be applied.',
}
const addKey = 'Add your project API key to quote this route.'
/** Quotes without a reader key use the docs key, whose policy and limits are not the reader's. */
const docsKeyGuides: Record<string, string> = {
  quote_proxy_unavailable: 'Add your project API key to quote.',
  routes_not_allowed: `The docs demo key cannot quote this route. ${addKey}`,
  routes_subsidy_not_allowed: `The docs demo key cannot quote 1:1 delivery here. ${addKey}`,
  routes_subsidy_not_enabled: `The docs demo key cannot quote 1:1 delivery here. ${addKey}`,
  rate_limited: `The docs demo key is busy. ${addKey}`,
  api_key_forbidden: 'Add your project API key to quote.',
  api_key_invalid: 'Add your project API key to quote.',
  unauthorized: 'Add your project API key to quote.',
}
const reloadToRestart = 'Reload the page to start a new test.'
const notFound = 'Not found for this key’s project. Use the key that created it.'
/** Demo guidance for Routes error codes whose API message does not say what to do next. */
const errorGuides: Record<string, string> = {
  api_key_missing: 'Add your project API key to continue.',
  api_key_invalid: 'The API key was rejected. Check your project API key.',
  unauthorized: 'The API key was rejected. Check your project API key.',
  api_key_malformed: 'That does not look like a Tempo API key. Check your project API key.',
  api_key_forbidden:
    'This key cannot make this request. Quotes and reads need routes:read; creating and registering need routes:write.',
  api_key_ip_forbidden:
    'This key only accepts requests from approved IP addresses, and this browser is not one of them.',
  billing_required: 'Billing for this organization needs attention in the API console.',
  billing_past_due: 'Billing for this organization needs attention in the API console.',
  routes_suspended: 'Routes is suspended for this organization. Contact Tempo.',
  routes_not_allowed:
    'Your organization’s access policy does not allow this route or funding method. Choose another route.',
  quote_not_available:
    'No quote is available for this route right now. Try another amount, or try again later.',
  deposit_address_not_available:
    'A deposit address is not available for this route right now. Try again later or choose another route.',
  routes_deposit_address_limit_exceeded: 'This organization has reached its deposit address limit.',
  route_policy_changed: `Your access policy changed after this quote. ${reloadToRestart}`,
  route_policy_identity_conflict: `Your access policy changed after this quote. ${reloadToRestart}`,
  idempotency_conflict: `This retry does not match the original request. ${reloadToRestart}`,
  idempotency_in_progress: 'The original request is still being processed. Retrying shortly.',
  routes_transfer_not_awaiting_source:
    'This transfer is no longer waiting for source transactions.',
  source_transaction_pending:
    'The API has not seen the source transaction confirm yet. Retrying registration shortly.',
  source_transaction_conflict:
    'This transaction is already registered to another transfer. Do not send again.',
  source_transaction_invalid:
    'The API could not match this transaction to the transfer. Check it was sent by the sender on the source network.',
  routes_deposit_address_not_active: 'This deposit address is not active. Do not fund it.',
  routes_transfer_not_found: notFound,
  routes_deposit_not_found: notFound,
  routes_deposit_address_not_found: notFound,
  not_implemented: 'This operation is not available yet.',
  rate_limited: 'Too many requests. Wait a moment, then try again.',
}
type ApiErrorBody = {
  code?: string
  message?: string
  details?: { message?: string }[]
}
export class RoutesApiError extends Error {
  readonly code: string | undefined
  constructor(
    public result: ApiResult,
    { docsKey = false } = {},
  ) {
    const error = result.data.error as ApiErrorBody | undefined
    const code = error?.code ?? (result.status === 429 ? 'rate_limited' : undefined)
    const requestId = typeof result.data.requestId === 'string' ? result.data.requestId : ''
    // The code and request ID are what support needs to trace a failure.
    const reference = [code, requestId && `request ${requestId}`].filter(Boolean).join(' · ')
    const subsidy = code ? subsidyHints[code] : undefined
    const details = error?.details
      ?.map((detail) => detail.message)
      .filter(Boolean)
      .join('; ')
    const text =
      (docsKey && code && docsKeyGuides[code]) ||
      subsidy ||
      (code && errorGuides[code]) ||
      (error?.message ? `${error.message}${details ? ` ${details}.` : ''}` : undefined) ||
      (result.status >= 500
        ? 'The Routes API could not complete this request. Try again shortly.'
        : `The request failed with HTTP ${result.status}.`)
    super(reference ? `${text} (${reference})` : text)
    this.code = code
  }
}
/** The API refused the 1:1 subsidy, so the same request without it may still go through. */
export const isSubsidyRefusal = (e: unknown) =>
  e instanceof RoutesApiError && !!e.code && Object.hasOwn(subsidyHints, e.code)
/** Retry `run` while it fails with one of `codes`, waiting `intervalMs` between attempts. */
export async function retryOn<T>(
  codes: readonly string[],
  run: () => Promise<T>,
  { attempts = 10, intervalMs = 3_000 } = {},
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run()
    } catch (e) {
      if (!(e instanceof RoutesApiError) || !codes.includes(e.code ?? '') || attempt >= attempts)
        throw e
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }
}
/** A source transaction that was mined and reverted: stop rather than send again. */
export class SourceRevertedError extends Error {
  constructor() {
    super('Source transaction reverted. Stop and reconcile this transfer.')
  }
}
export function requestUrl(request: ApiRequest) {
  // Callers cannot send credentials to an arbitrary host or follow redirects.
  if (!/^\/(?:transfers|deposit-addresses|deposits)(?:\/[A-Za-z0-9_-]+)*$/.test(request.path))
    throw new Error('Invalid Routes API path.')
  const url = new URL(routesApi + request.path)
  for (const [key, value] of Object.entries(request.query ?? {}))
    url.searchParams.set(key, String(value))
  return url.toString()
}
const quotePath = /^\/(transfers|deposit-addresses)\/quote$/
/** Quotes are public: without a key, the API prices a route at public rates. */
export const isQuote = (request: ApiRequest) =>
  request.method === 'GET' && quotePath.test(request.path)

async function send(
  url: string,
  request: ApiRequest,
  headers: Record<string, string>,
  { docsKey = false } = {},
): Promise<ApiResult> {
  let response: Response
  try {
    response = await fetch(url, {
      method: request.method,
      headers: {
        ...headers,
        ...(request.body ? { 'content-type': 'application/json' } : {}),
        ...(request.idempotencyKey ? { 'idempotency-key': request.idempotencyKey } : {}),
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    })
  } catch (e) {
    // The request may still have reached the API; creation retries reuse the same idempotency key.
    throw new Error(
      (e as Error).name === 'TimeoutError'
        ? 'api.tempo.xyz did not respond in time. Try again.'
        : 'Could not reach api.tempo.xyz. Check your connection and try again.',
    )
  }
  const text = await response.text()
  let data: Record<string, unknown>
  try {
    data = JSON.parse(text)
  } catch {
    data = { message: text }
  }
  const result = { status: response.status, data }
  if (!response.ok) throw new RoutesApiError(result, { docsKey })
  return result
}
/**
 * Send a Routes API request. With the reader's key, quotes carry their organization's pricing and
 * policy; without one, only quotes can run, at public pricing.
 */
export async function executeRoutesRequest(
  request: ApiRequest,
  apiKey: string,
): Promise<ApiResult> {
  const key = apiKey.trim()
  if (key) return send(requestUrl(request), request, { 'tempo-api-key': key })
  if (!isQuote(request)) throw new Error('Add your project API key to continue.')
  try {
    return await send(requestUrl(request), request, {})
  } catch (e) {
    // Until the API serves public quotes, the docs quote proxy prices them instead.
    if (!(e instanceof RoutesApiError && e.code === 'api_key_missing')) throw e
    const kind = request.path.match(quotePath)?.[1] ?? ''
    const params = new URLSearchParams({ kind })
    for (const [name, value] of Object.entries(request.query ?? {})) params.set(name, String(value))
    return send(`${developersPath('/api/routes-quote')}?${params}`, request, {}, { docsKey: true })
  }
}
export function quoteRequest(
  route: TestRoute,
  input: Parameters<typeof routeQuoteRequest>[1],
): ApiRequest {
  return {
    method: 'GET',
    path: `/${input.method === 'transfer' ? 'transfers' : 'deposit-addresses'}/quote`,
    query: { ...routeQuoteRequest(route, input) },
  }
}
/**
 * Read the whole route directory. With an API key the API applies the caller's access policy, so
 * only routes (and subsidies) that key can use are listed; without one it lists every route.
 */
export async function loadRoutes(signal: AbortSignal, apiKey = '') {
  const data: TestRoute[] = []
  const seen = new Set<string>()
  let cursor: string | null = null
  for (let page = 0; page < 20; page++) {
    const url = new URL(routesApi)
    url.searchParams.set('limit', '50')
    if (cursor) url.searchParams.set('cursor', cursor)
    const response = await fetch(url, {
      signal,
      credentials: 'omit',
      redirect: 'error',
      headers: apiKey.trim() ? { 'tempo-api-key': apiKey.trim() } : undefined,
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new RoutesApiError({ status: response.status, data: body })
    }
    const parsed = directorySchema.parse(await response.json())
    data.push(...parsed.data)
    cursor = parsed.nextCursor
    if (!cursor) return data
    if (seen.has(cursor)) break
    seen.add(cursor)
  }
  throw new Error('Could not load the complete route directory.')
}
export const evmActionSchema = z.object({
  type: z.literal('evm:calls'),
  calls: z
    .array(
      z.object({
        to: z.string().regex(/^0x[\da-fA-F]{40}$/),
        data: z.string().regex(/^0x(?:[\da-fA-F]{2})*$/),
        value: z.string().regex(/^0x[\da-fA-F]+$/),
      }),
    )
    .min(1)
    .max(10),
})
export const tronActionSchema = z.object({
  type: z.literal('tron:calls'),
  calls: z
    .array(
      z.object({
        to: z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/),
        data: z.string().regex(/^0x(?:[\da-fA-F]{2})*$/),
        value: z.string().regex(/^0x[\da-fA-F]+$/),
      }),
    )
    .min(1)
    .max(10),
})
/** The action a created transfer returns: calls to sign on an EVM network or on Tron. */
export const sourceActionSchema = z.discriminatedUnion('type', [evmActionSchema, tronActionSchema])
export function assertUnexpired(expiresAt: unknown) {
  if (
    typeof expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(expiresAt)) ||
    Date.parse(expiresAt) <= Date.now()
  )
    throw new Error(
      'The action has expired. Preserve submitted hashes and reconcile this transfer before starting another.',
    )
}
/** The ERC-20 address in a directory token key such as `eip155:4217/erc20:0x…`. */
export function erc20Address(tokenKey: string) {
  return /\/erc20:(0x[\da-fA-F]{40})$/.exec(tokenKey)?.[1] as `0x${string}` | undefined
}
/** State a shortfall in the sender's own units, before a wallet swap or revert obscures it. */
export function assertSufficientBalance(options: {
  balance: bigint
  required: bigint
  symbol: string
  decimals: number
}) {
  const { balance, required, symbol, decimals } = options
  if (balance >= required) return
  throw new Error(
    `Not enough ${symbol}: the sender holds ${formatUnits(balance, decimals)} ${symbol} and this transfer sends ${formatUnits(required, decimals)} ${symbol}. Add ${symbol} to the sender, then try again. Nothing was sent.`,
  )
}
export type TempoCall = { to: `0x${string}`; data: `0x${string}`; value: bigint }
export type TempoSendCalls = (parameters: {
  calls: TempoCall[]
  chainId: number
  capabilities: { feePayer: false }
}) => Promise<{ status?: string; receipts?: readonly { transactionHash: string }[] }>
/** Tempo executes every call atomically in one transaction, so the wallet signs once. */
export async function submitTempoCalls(
  sendCalls: TempoSendCalls,
  options: {
    chainId: number
    sender: string
    connected: string | undefined
    calls: z.infer<typeof evmActionSchema>['calls']
    expiresAt: unknown
    /** The source amount the batch sends, checked against a fresh balance read. */
    required: { amount: bigint; symbol: string; decimals: number }
    readBalance: () => Promise<bigint>
    /** Rejects when the batch would revert, before the wallet opens. */
    simulate: (calls: TempoCall[]) => Promise<unknown>
    onHash: (hash: string) => void
    onBroadcast?: () => void
  },
) {
  assertUnexpired(options.expiresAt)
  if (options.connected?.toLowerCase() !== options.sender.toLowerCase())
    throw new Error('Sign in to Tempo Wallet as the sender entered in step 1.')
  const { amount: required, ...token } = options.required
  assertSufficientBalance({ balance: await options.readBalance(), required, ...token })
  const calls = options.calls.map(({ to, data, value }) => ({
    to: to as `0x${string}`,
    data: data as `0x${string}`,
    value: BigInt(value),
  }))
  await options.simulate(calls)
  options.onBroadcast?.()
  const result = await sendCalls({
    calls,
    chainId: options.chainId,
    // The docs wallet config sponsors testnet fees; the sender pays fees on a Routes source.
    capabilities: { feePayer: false },
  })
  const hash = result.receipts?.[0]?.transactionHash
  if (!hash || !/^0x[\da-fA-F]{64}$/.test(hash))
    throw new Error(
      'Tempo Wallet returned no transaction hash. Check wallet history before submitting again.',
    )
  options.onHash(hash)
  if (result.status !== 'success') throw new SourceRevertedError()
  return hash
}

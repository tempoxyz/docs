import { z } from 'zod'

const chain = z.object({
  id: z.string().min(1),
  name: z.string(),
  addressFormat: z.string(),
})
const token = z.object({
  tokenKey: z.string().min(1),
  symbol: z.string(),
  decimals: z.number().int().min(0).max(36),
})
export const routeSchema = z.object({
  id: z.string().min(1),
  sourceChain: chain,
  destinationChain: chain,
  sourceToken: token,
  destinationToken: token,
  capabilities: z.object({
    depositAddress: z.boolean().optional(),
    transfer: z.object({ modes: z.array(z.enum(['exactSource', 'exactDestination'])) }).nullish(),
  }),
  subsidies: z
    .object({ depositAddress: z.boolean().optional(), transfer: z.boolean().optional() })
    .nullish(),
})
export const directorySchema = z.object({
  data: z.array(routeSchema),
  nextCursor: z.string().nullable(),
})
export type TestRoute = z.infer<typeof routeSchema>
export type TestMethod = 'transfer' | 'depositAddress'
export type TestMode = 'exactSource' | 'exactDestination'

export type RoutePick = {
  sourceChain: string
  sourceToken: string
  destinationChain: string
  destinationToken: string
}
type Option = { value: string; label: string }
const unique = (options: Option[]) => [...new Map(options.map((o) => [o.value, o])).values()]
const only = (options: Option[]) => (options.length === 1 ? options[0].value : '')

/** Cascade source network → asset → destination network → asset, filling single-option steps. */
export function routeChoices(routes: TestRoute[], pick: RoutePick) {
  const sourceChains = unique(
    routes.map((r) => ({ value: r.sourceChain.id, label: r.sourceChain.name })),
  )
  const sourceChain = pick.sourceChain || only(sourceChains)
  const fromChain = routes.filter((r) => r.sourceChain.id === sourceChain)
  const sourceTokens = unique(
    fromChain.map((r) => ({ value: r.sourceToken.tokenKey, label: r.sourceToken.symbol })),
  )
  const sourceToken = pick.sourceToken || only(sourceTokens)
  const fromToken = fromChain.filter((r) => r.sourceToken.tokenKey === sourceToken)
  const destinationChains = unique(
    fromToken.map((r) => ({ value: r.destinationChain.id, label: r.destinationChain.name })),
  )
  const destinationChain = pick.destinationChain || only(destinationChains)
  const toChain = fromToken.filter((r) => r.destinationChain.id === destinationChain)
  const destinationTokens = unique(
    toChain.map((r) => ({ value: r.destinationToken.tokenKey, label: r.destinationToken.symbol })),
  )
  const destinationToken = pick.destinationToken || only(destinationTokens)
  return {
    options: { sourceChains, sourceTokens, destinationChains, destinationTokens },
    pick: { sourceChain, sourceToken, destinationChain, destinationToken },
    route: toChain.find((r) => r.destinationToken.tokenKey === destinationToken),
  }
}

type Quantity = { baseUnits?: string; decimals?: number }
const inDecimals = (value: unknown, decimals: number) => {
  const { baseUnits, decimals: from = decimals } = (value ?? {}) as Quantity
  if (!baseUnits) return undefined
  const units = BigInt(baseUnits)
  return from >= decimals
    ? units / 10n ** BigInt(from - decimals)
    : units * 10n ** BigInt(decimals - from)
}
/**
 * The amount a subsidized quote guarantees, in destination base units. Transfer quotes state it as
 * `destinationAmountRequired`; deposit quotes do not, and normalized 1:1 means the source amount.
 */
export function subsidizedDelivery(data: Record<string, unknown>, decimals: number) {
  const guaranteed =
    inDecimals(data.destinationAmountRequired, decimals) ?? inDecimals(data.sourceAmount, decimals)
  if (guaranteed === undefined) return undefined
  const routed = inDecimals(data.destinationAmount, decimals)
  return {
    guaranteed,
    covered: routed !== undefined && guaranteed > routed ? guaranteed - routed : 0n,
  }
}

type Amount = Quantity & { currency?: string }
const usdUnits = (value: unknown, decimals: number) =>
  (value as Amount | undefined)?.currency === 'USD' ? inDecimals(value, decimals) : undefined
/**
 * What a quote costs the sender, in destination base units, so the summary adds up. Both amounts
 * must be USD-denominated (stablecoins); otherwise no cost is claimed. `total` is what is sent
 * (or, for a subsidized quote, the guaranteed amount) minus what the route delivers. `priceImpact`
 * is the part of it that the listed fees do not explain, and is left out when the fees are not all
 * USD-denominated or when they already cover the whole difference.
 */
export function quoteCosts(data: Record<string, unknown>, decimals: number) {
  const sent =
    data.subsidize === true
      ? subsidizedDelivery(data, decimals)?.guaranteed
      : usdUnits(data.sourceAmount, decimals)
  const routed = usdUnits(data.destinationAmount, decimals)
  if (sent === undefined || routed === undefined || routed > sent) return undefined
  const total = sent - routed
  const fees = Array.isArray(data.fees) ? (data.fees as { amount?: Amount }[]) : []
  const listed = fees.map((fee) => usdUnits(fee.amount, decimals))
  if (listed.some((fee) => fee === undefined)) return { total }
  const impact = total - listed.reduce<bigint>((sum, fee) => sum + (fee ?? 0n), 0n)
  return { total, priceImpact: impact > 0n ? impact : undefined }
}

export function toBaseUnits(amount: string, decimals: number): string {
  if (!/^\d+(\.\d+)?$/.test(amount)) throw new Error('Enter a positive decimal amount.')
  const [whole, fraction = ''] = amount.split('.')
  if (fraction.length > decimals)
    throw new Error(`This token supports at most ${decimals} decimals.`)
  const units = BigInt(whole + fraction.padEnd(decimals, '0'))
  if (units <= 0n) throw new Error('The amount must be greater than zero.')
  return units.toString()
}

function address(value: string, format: string, label: string) {
  const trimmed = value.trim()
  // biome-ignore lint/suspicious/noControlCharactersInRegex: reject control bytes in generated requests.
  if (!trimmed || /[\s\x00-\x1f]/.test(trimmed)) throw new Error(`Enter a ${label} address.`)
  if (format === 'hex' && !/^0x[\da-fA-F]{40}$/.test(trimmed)) {
    throw new Error(`${label} must be a 0x-prefixed, 20-byte address.`)
  }
  if (format === 'base58check' && !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    throw new Error(`${label} must be a Tron Base58Check address.`)
  }
  if (format === 'base58' && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    throw new Error(`${label} must be a source-network Base58 address.`)
  }
  return trimmed
}

/** Funding methods the demo can run: wallet transfers need an EVM source to sign here. */
export function demoMethods(route: TestRoute): TestMethod[] {
  const methods: TestMethod[] = []
  // The demo signs transfers on EVM networks and Tron; Solana funds through deposit addresses.
  if (route.capabilities.transfer?.modes.length && /^(eip155|tron):/.test(route.sourceChain.id))
    methods.push('transfer')
  if (route.capabilities.depositAddress) methods.push('depositAddress')
  return methods
}

/**
 * Routes the demo offers as one-click picks, most common first. Only those the loaded directory
 * lists are shown, so a key's access policy or a retired route never leaves a dead chip.
 */
const popularRouteIds = [
  'eip155:8453/usdc-eip155:4217/ousd',
  'eip155:1/usdc-eip155:4217/usdce',
  'eip155:4217/ousd-eip155:8453/usdc',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/usdc-eip155:4217/usdce',
]
export function popularRoutes(routes: TestRoute[]) {
  return popularRouteIds.flatMap((id) => routes.find((route) => route.id === id) ?? [])
}
export const routeLabel = (route: TestRoute) =>
  `${route.sourceChain.name} ${route.sourceToken.symbol} → ${route.destinationChain.name} ${route.destinationToken.symbol}`

/** A link that opens the demo with this route selected. Only the route ID goes in the URL. */
export function routeDemoHref(route: TestRoute) {
  return `/docs/routes/test?${new URLSearchParams({ route: route.id })}`
}

/** The route a demo link selects, if the directory still lists it. */
export function linkedRoute(routes: TestRoute[], search: string) {
  const id = new URLSearchParams(search).get('route')
  return id ? routes.find((route) => route.id === id) : undefined
}

/** Subsidized 1:1 delivery applies to deposit addresses and exact-source transfers only. */
export function canSubsidize(route: TestRoute, method: TestMethod, mode: TestMode) {
  return method === 'transfer'
    ? mode === 'exactSource' && !!route.subsidies?.transfer
    : !!route.subsidies?.depositAddress
}

type RouteInput = {
  method: TestMethod
  mode: TestMode
  amount: string
  sender: string
  recipient: string
  refundAddress: string
  subsidize?: boolean
}

/** Fields every quote and creation shares, after checking the route supports the request. */
function pricing(route: TestRoute, input: RouteInput) {
  const { method, mode } = input
  if (input.subsidize && !canSubsidize(route, method, mode)) {
    throw new Error('This route does not offer 1:1 delivery for that funding method.')
  }
  if (method === 'depositAddress' && !route.capabilities.depositAddress) {
    throw new Error('This route does not support deposit addresses.')
  }
  if (method === 'transfer' && !route.capabilities.transfer?.modes.includes(mode)) {
    throw new Error('This route does not advertise that transfer mode.')
  }
  const fixedToken =
    method === 'transfer' && mode === 'exactDestination'
      ? route.destinationToken
      : route.sourceToken
  return {
    amount: toBaseUnits(input.amount, fixedToken.decimals),
    sourceChain: route.sourceChain.id,
    sourceToken: route.sourceToken.tokenKey,
    destinationToken: route.destinationToken.tokenKey,
    subsidize: !!input.subsidize,
  }
}

/**
 * Quote parameters. Transfer quotes need the sender and recipient; deposit-address quotes price
 * the route alone, so their recipient and refund address are only asked for at creation.
 */
/**
 * Quotes use the creation inputs. The API lists a deposit quote's recipient and refund address as
 * optional, but several deposit routes (Ethereum, Polygon, BNB, Tron) only quote with them.
 */
export function routeQuoteRequest(route: TestRoute, input: RouteInput) {
  return routeTestRequest(route, input)
}

/** The creation request body. */
export function routeTestRequest(route: TestRoute, input: RouteInput) {
  const common = {
    ...pricing(route, input),
    recipient: address(input.recipient, route.destinationChain.addressFormat, 'recipient'),
  }
  return input.method === 'transfer'
    ? {
        ...common,
        destinationChain: route.destinationChain.id,
        mode: input.mode,
        sender: address(input.sender, route.sourceChain.addressFormat, 'sender'),
      }
    : {
        ...common,
        refundAddress: address(input.refundAddress, route.sourceChain.addressFormat, 'refund'),
      }
}

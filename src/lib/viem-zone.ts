import { SignatureEnvelope, TokenId, ZoneRpcAuthentication } from 'ox/tempo'
import {
  type Account,
  type Chain,
  createClient,
  defineChain,
  erc20Abi,
  type Hex,
  http,
  publicActions,
  walletActions,
} from 'viem'
import { Actions } from 'viem/tempo'

const authorizationTokenTtl = 1_800
const authorizationTokenRefreshBuffer = 30
// Private sequencers currently only accept the raw transaction param on eth_sendRawTransactionSync.
export const zoneRpcSyncTimeout = 0
type AuthorizationToken = { expiresAt: number; token: string }
type AuthorizationTokenCacheState = {
  cachedToken?: AuthorizationToken | undefined
  inflight?: Promise<AuthorizationToken> | undefined
}

const authorizationTokenCache = new Map<string, AuthorizationTokenCacheState>()

const p256Order = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n
const p256HalfOrder = 0x7fffffff800000007fffffffffffffffde737d56d38bcf4279dce5617e3192a8n

type ZoneParameters = {
  feeToken?: `0x${string}` | undefined
  zone: number
}

type ZoneConfigLike = {
  blockExplorers?: Chain['blockExplorers']
  chainId: number
  name?: string | undefined
  portalAddress: `0x${string}`
  rpcUrls?: {
    default?: {
      http?: string[]
    }
  }
}

type ZoneClientRoot = {
  account: Account & {
    address: `0x${string}`
    sign: (parameters: { hash: Hex }) => Promise<Hex>
  }
  chain: Chain & {
    id: number
    name: string
    zones?: Record<number, ZoneConfigLike>
    [key: string]: unknown
  }
}

function normalizeSignatureEnvelope<T>(envelope: T): T {
  const candidate = envelope as {
    inner?: T
    signature?: { s?: bigint }
    type?: string
  }

  if (candidate.type === 'keychain') {
    return {
      ...candidate,
      inner: normalizeSignatureEnvelope(candidate.inner),
    } as T
  }

  if (
    (candidate.type === 'p256' || candidate.type === 'webAuthn') &&
    candidate.signature?.s !== undefined &&
    candidate.signature.s > p256HalfOrder
  ) {
    return {
      ...candidate,
      signature: {
        ...candidate.signature,
        s: p256Order - candidate.signature.s,
      },
    } as T
  }

  return candidate as T
}

function normalizeSignature(signature: `0x${string}`) {
  const envelope = SignatureEnvelope.deserialize(signature)
  return SignatureEnvelope.serialize(normalizeSignatureEnvelope(envelope) as never)
}

function encodeBase64(value: string) {
  if (typeof globalThis.btoa === 'function') return globalThis.btoa(value)

  return Buffer.from(value).toString('base64')
}

function getAuthorizationTokenCacheKey(
  account: ZoneClientRoot['account'],
  zoneId: number,
  zone: ZoneConfigLike,
) {
  return [
    account.address.toLowerCase(),
    zone.chainId,
    zoneId,
    zone.portalAddress.toLowerCase(),
  ].join(':')
}

function getAuthorizationTokenCacheState(cacheKey: string) {
  const cached = authorizationTokenCache.get(cacheKey)
  if (cached) return cached

  const state: AuthorizationTokenCacheState = {}
  authorizationTokenCache.set(cacheKey, state)
  return state
}

function getFreshAuthorizationToken(
  cachedToken: AuthorizationToken | undefined,
  now = Math.floor(Date.now() / 1_000),
) {
  if (!cachedToken) return undefined
  if (cachedToken.expiresAt - now <= authorizationTokenRefreshBuffer) return undefined
  return cachedToken
}

function createAuthorizationTokenGetter(
  account: ZoneClientRoot['account'],
  zoneId: number,
  zone: ZoneConfigLike,
) {
  const state = getAuthorizationTokenCacheState(
    getAuthorizationTokenCacheKey(account, zoneId, zone),
  )

  return async ({ allowPrompt = true }: { allowPrompt?: boolean } = {}) => {
    const cachedToken = getFreshAuthorizationToken(state.cachedToken)

    if (cachedToken) return cachedToken

    if (state.inflight) return state.inflight

    if (!allowPrompt) {
      throw new Error('Prepare authenticated access before reading zone data.')
    }

    state.inflight = (async () => {
      try {
        const issuedAt = Math.floor(Date.now() / 1_000)
        const expiresAt = issuedAt + authorizationTokenTtl
        const authentication = ZoneRpcAuthentication.from({
          chainId: zone.chainId,
          expiresAt,
          issuedAt,
          zoneId,
          zonePortal: zone.portalAddress,
        })

        const signature = normalizeSignature(
          await account.sign({
            hash: ZoneRpcAuthentication.getSignPayload(authentication),
          }),
        )

        const token = ZoneRpcAuthentication.serialize(authentication, { signature }).slice(2)
        const nextToken = { expiresAt, token }

        state.cachedToken = nextToken
        return nextToken
      } finally {
        state.inflight = undefined
      }
    })()

    return state.inflight
  }
}

export function getZoneClient(client: ZoneClientRoot, parameters: ZoneParameters) {
  const zone = client.chain.zones?.[parameters.zone]
  if (!zone) throw new Error(`Zone ${parameters.zone} is not configured on the current chain.`)

  const rpcUrl = zone.rpcUrls?.default?.http?.[0]
  if (!rpcUrl) throw new Error(`Zone ${parameters.zone} is missing an HTTP RPC URL.`)

  const parsedUrl = new URL(rpcUrl)
  const username = decodeURIComponent(parsedUrl.username)
  const password = decodeURIComponent(parsedUrl.password)
  const basicAuthHeader =
    username || password ? `Basic ${encodeBase64(`${username}:${password}`)}` : undefined

  parsedUrl.username = ''
  parsedUrl.password = ''

  const { extend: _extend, ...baseChain } = client.chain
  const zoneRpcUrls = zone.rpcUrls ?? { default: {} }
  const zoneChain = defineChain({
    ...baseChain,
    blockExplorers: zone.blockExplorers,
    feeToken:
      parameters.feeToken ?? (baseChain as { feeToken?: `0x${string}` }).feeToken ?? undefined,
    id: zone.chainId,
    name: zone.name ?? `${client.chain.name} Zone ${parameters.zone}`,
    rpcUrls: {
      ...zoneRpcUrls,
      default: {
        ...(zoneRpcUrls.default ?? {}),
        http: [parsedUrl.toString()],
      },
    },
    sourceId: client.chain.id,
    zones: undefined,
  })

  const getAuthorizationToken = createAuthorizationTokenGetter(
    client.account,
    parameters.zone,
    zone,
  )
  const zoneClient = createClient({
    account: client.account as never,
    chain: zoneChain,
    transport: http(parsedUrl.toString(), {
      batch: false,
      async onFetchRequest(_request, init) {
        const headers = new Headers(init?.headers)

        if (basicAuthHeader) headers.set('authorization', basicAuthHeader)
        headers.set(
          ZoneRpcAuthentication.headerName,
          (await getAuthorizationToken({ allowPrompt: false })).token,
        )

        return {
          ...init,
          headers,
        }
      },
    }),
  })
    .extend(publicActions)
    .extend(walletActions)

  return {
    ...zoneClient,
    token: {
      approveSync: (parameters: Parameters<typeof Actions.token.approveSync>[1]) =>
        Actions.token.approveSync(zoneClient as never, parameters as never),
      getAllowance: (parameters: Parameters<typeof Actions.token.getAllowance>[1]) =>
        Actions.token.getAllowance(zoneClient as never, parameters as never),
      getBalance: ({ account, token }: { account: `0x${string}`; token: `0x${string}` }) =>
        zoneClient.readContract({
          account,
          address: TokenId.toAddress(token),
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account],
        }),
    },
    zone: {
      getAuthorizationTokenInfo: () => Actions.zone.getAuthorizationTokenInfo(zoneClient as never),
      getDepositStatus: (parameters: Parameters<typeof Actions.zone.getDepositStatus>[1]) =>
        Actions.zone.getDepositStatus(zoneClient as never, parameters as never),
      getWithdrawalFee: (parameters?: Parameters<typeof Actions.zone.getWithdrawalFee>[1]) =>
        Actions.zone.getWithdrawalFee(zoneClient as never, parameters as never),
      getZoneInfo: () => Actions.zone.getZoneInfo(zoneClient as never),
      prepareAuthorizationToken: async () => {
        const { expiresAt } = await getAuthorizationToken({ allowPrompt: true })

        return {
          account: client.account.address,
          expiresAt: BigInt(expiresAt),
        }
      },
      requestWithdrawalSync: (
        parameters: Parameters<typeof Actions.zone.requestWithdrawalSync>[1],
      ) =>
        Actions.zone.requestWithdrawalSync(zoneClient as never, parameters as never),
    },
  }
}

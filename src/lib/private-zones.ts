import { type Hex, walletActions } from 'viem'
import { type GetZoneClientParameters, tempoActions, type ZoneTransportConfig } from 'viem/tempo'

export const feeToken = '0x20c0000000000000000000000000000000000001' as const
export const stablecoinDex = '0xDEc0000000000000000000000000000000000000' as const
export const moderatoZoneFactory = '0x7Cc496Dc634b718289c192b59CF90262C5228545' as const
export const zoneOutbox = '0x1c00000000000000000000000000000000000002' as const
export const swapAndDepositRouter = '0xf9b794e0dca9bc12ac90067df792d7aad33436e4' as const
// Private sequencers currently only accept the raw transaction param on eth_sendRawTransactionSync.
export const zoneRpcSyncTimeout = 0
export const routerCallbackGasLimit = 2_000_000n
export const zeroBytes32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

const ZONE_A_RPC_URL =
  'https://eng:bold-raman-silly-torvalds@rpc-zone-005-private.tempoxyz.dev' as const
const ZONE_B_RPC_URL =
  'https://eng:bold-raman-silly-torvalds@rpc-zone-006-private.tempoxyz.dev' as const

export const ZONE_A = {
  chainId: 4217000006,
  id: 6,
  label: 'Zone A',
  portalAddress: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
  rpcUrl: ZONE_A_RPC_URL,
  rpcUrls: {
    default: {
      http: [stripRpcBasicAuth(ZONE_A_RPC_URL)],
      webSocket: [],
    },
  },
} as const

export const ZONE_B = {
  chainId: 4217000007,
  id: 7,
  label: 'Zone B',
  portalAddress: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  rpcUrl: ZONE_B_RPC_URL,
  rpcUrls: {
    default: {
      http: [stripRpcBasicAuth(ZONE_B_RPC_URL)],
      webSocket: [],
    },
  },
} as const

export const moderatoZoneRpcUrls = {
  [ZONE_A.id]: ZONE_A.rpcUrl,
  [ZONE_B.id]: ZONE_B.rpcUrl,
} as const

export const moderatoZones = {
  [ZONE_A.id]: {
    chainId: ZONE_A.chainId,
    name: ZONE_A.label,
    portalAddress: ZONE_A.portalAddress,
    rpcUrls: ZONE_A.rpcUrls,
  },
  [ZONE_B.id]: {
    chainId: ZONE_B.chainId,
    name: ZONE_B.label,
    portalAddress: ZONE_B.portalAddress,
    rpcUrls: ZONE_B.rpcUrls,
  },
} as const

export function stripRpcBasicAuth(url: string) {
  const parsedUrl = new URL(url)
  parsedUrl.username = ''
  parsedUrl.password = ''
  return parsedUrl.toString()
}

export function getZoneTransportConfig(rpcUrl: string): ZoneTransportConfig | undefined {
  const parsedUrl = new URL(rpcUrl)
  const username = decodeURIComponent(parsedUrl.username)
  const password = decodeURIComponent(parsedUrl.password)

  if (!username && !password) return undefined

  const authorization = `Basic ${encodeBase64(`${username}:${password}`)}`

  return {
    async onFetchRequest(_request, init) {
      const headers = new Headers(init?.headers)
      headers.set('authorization', authorization)

      return {
        ...init,
        headers,
      }
    },
  }
}

export function getZoneClientParameters(zone: number, rpcUrl: string) {
  const transport = getZoneTransportConfig(rpcUrl)

  return transport ? { transport, zone } : { zone }
}

type ClientWithExtend = {
  extend: (decorator: unknown) => ClientWithExtend
}

type AuthorizationTokenInfo = {
  account: Hex
  expiresAt: bigint
}

type DepositStatus = {
  deposits: readonly unknown[]
  processed: boolean
}

type ZoneInfo = {
  chainId: number
  zoneId: number
  zoneTokens: readonly unknown[]
}

export type TempoZoneClient = {
  getBlockNumber: () => Promise<bigint>
  token: {
    getAllowance: (parameters: { account: Hex; spender: Hex; token: Hex }) => Promise<bigint>
    getBalance: (parameters: { account: Hex; token: Hex }) => Promise<bigint>
  }
  zone: {
    getAuthorizationTokenInfo: () => Promise<AuthorizationTokenInfo>
    getDepositStatus: (parameters: { tempoBlockNumber: bigint }) => Promise<DepositStatus>
    getWithdrawalFee: (parameters?: { gasLimit?: bigint | undefined }) => Promise<bigint>
    getZoneInfo: () => Promise<ZoneInfo>
    prepareAuthorizationToken: () => Promise<AuthorizationTokenInfo>
  }
}

// `viem/tempo` exposes zone client creation through the public tempo decorator.
export function getTempoZoneClient(client: ClientWithExtend, parameters: GetZoneClientParameters) {
  const zoneCapableClient = client
    .extend(walletActions)
    .extend(tempoActions()) as ClientWithExtend & {
    getZoneClient: (parameters: GetZoneClientParameters) => TempoZoneClient
  }

  return zoneCapableClient.getZoneClient(parameters)
}

function encodeBase64(value: string) {
  if (typeof globalThis.btoa === 'function') return globalThis.btoa(value)

  return Buffer.from(value).toString('base64')
}

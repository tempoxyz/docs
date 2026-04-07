export const feeToken = '0x20c0000000000000000000000000000000000001' as const
export const stablecoinDex = '0xDEc0000000000000000000000000000000000000' as const
export const moderatoZoneFactory = '0x7Cc496Dc634b718289c192b59CF90262C5228545' as const
export const zoneOutbox = '0x1c00000000000000000000000000000000000002' as const
export const swapAndDepositRouter = '0xf9b794e0dca9bc12ac90067df792d7aad33436e4' as const
export const routerCallbackGasLimit = 2_000_000n
export const zeroBytes32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

export const ZONE_A = {
  chainId: 4217000006,
  id: 6,
  label: 'Zone A',
  portalAddress: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
  rpcUrls: {
    default: {
      http: ['https://eng:bold-raman-silly-torvalds@rpc-zone-005-private.tempoxyz.dev'],
      webSocket: [],
    },
  },
} as const

export const ZONE_B = {
  chainId: 4217000007,
  id: 7,
  label: 'Zone B',
  portalAddress: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  rpcUrls: {
    default: {
      http: ['https://eng:bold-raman-silly-torvalds@rpc-zone-006-private.tempoxyz.dev'],
      webSocket: [],
    },
  },
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

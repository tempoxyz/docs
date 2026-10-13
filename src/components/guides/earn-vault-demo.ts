import { formatUnits } from 'viem'
import { z } from 'zod'
import { earnDemoVault } from './earn-deposit-demo'

export type EarnNetwork = 'mainnet' | 'testnet'

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/)
const decimalAmount = z.string().regex(/^\d+(\.\d+)?$/)
const vaultSchema = z.object({
  id: address,
  verified: z.boolean(),
  label: z.string(),
  assetToken: z.object({
    address,
    symbol: z.string(),
    decimals: z.number().int().min(0).max(255),
  }),
  state: z.object({ depositsPaused: z.boolean() }),
  access: z.object({ status: z.enum(['open', 'allowlisted']) }).optional(),
  capabilities: z
    .object({ deposit: z.boolean(), redeem: z.boolean(), asyncRedeem: z.boolean() })
    .optional(),
  instantLiquidity: z.string().regex(/^\d+$/).nullable(),
  apy: z
    .object({
      vault: z.string().regex(/^-?\d+(\.\d+)?$/),
      window: z.enum(['1h', '1d', '7d', '30d']),
      asOf: z.iso.datetime(),
    })
    .nullable()
    .optional(),
  tvl: z.object({ formatted: decimalAmount, currency: z.string() }).nullable().optional(),
})

export type EarnVault = z.infer<typeof vaultSchema>

const vaultPageSchema = z.object({
  data: z.array(vaultSchema),
  nextCursor: z.string().nullable(),
})

export function parseEarnVaultPage(value: unknown): {
  data: EarnVault[]
  nextCursor: string | null
} {
  const result = vaultPageSchema.safeParse(value)
  if (!result.success)
    throw new Error(
      'The Earn API returned an unexpected vault response. Try loading the vaults again.',
    )
  return { ...result.data, data: result.data.data.filter((vault) => vault.verified) }
}

export type EarnVaultDirectory = {
  vaults: EarnVault[]
  selectedId: string
  nextCursor: string | null
  loaded: boolean
}

export function updateEarnVaultDirectory(
  previous: EarnVaultDirectory,
  page: { data: EarnVault[]; nextCursor: string | null },
  network: EarnNetwork,
  more = false,
): EarnVaultDirectory {
  const items = (more ? [...previous.vaults, ...page.data] : page.data).filter(
    (vault) => vault.verified,
  )
  const vaults = [...new Map(items.map((vault) => [vault.id.toLowerCase(), vault])).values()]
  const selected =
    vaults.find((vault) => vault.id.toLowerCase() === previous.selectedId.toLowerCase()) ??
    (network === 'testnet'
      ? vaults.find((vault) => vault.id.toLowerCase() === earnDemoVault)
      : undefined) ??
    vaults[0]
  return { vaults, selectedId: selected?.id ?? '', nextCursor: page.nextCursor, loaded: true }
}

export function parseEarnVaultDetail(value: unknown, expectedId: string): EarnVault | null {
  const result = vaultSchema.safeParse(value)
  if (!result.success || result.data.id.toLowerCase() !== expectedId.toLowerCase())
    throw new Error(
      'The Earn API returned an unexpected vault response. Try loading the vaults again.',
    )
  return result.data.verified ? result.data : null
}

export function earnVaultDetailRequestUrl(network: EarnNetwork, vaultId: string): string {
  address.parse(vaultId)
  const url = new URL(earnVaultRequestUrl(network))
  url.pathname = `/v1/earn/vaults/${vaultId}`
  url.searchParams.delete('limit')
  return url.toString()
}

export function earnVaultRequestUrl(network: EarnNetwork, cursor?: string): string {
  const url = new URL('https://api.tempo.xyz/v1/earn/vaults/verified')
  url.searchParams.set('chainId', network)
  url.searchParams.set('include', 'access,capabilities,apy,tvl')
  url.searchParams.set('limit', '10')
  if (cursor) url.searchParams.set('cursor', cursor)
  return url.toString()
}

export function formatVaultLiquidity(vault: EarnVault): string {
  const { instantLiquidity, assetToken } = vault
  if (
    instantLiquidity === null ||
    !/^\d+$/.test(instantLiquidity) ||
    !Number.isInteger(assetToken.decimals) ||
    assetToken.decimals < 0 ||
    assetToken.decimals > 255
  )
    return 'Not reported'
  return `${formatUnits(BigInt(instantLiquidity), assetToken.decimals)} ${assetToken.symbol}`
}

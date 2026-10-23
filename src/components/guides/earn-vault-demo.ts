import { formatUnits } from 'viem'
import { z } from 'zod'

// Only this explicitly approved mainnet vault is displayed in the docs.
export const sentoraPathUsdVault = '0xb20ba39ccf522d69b7a21e3f369be5de73a2c694'

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

export function parseEarnVaultDetail(value: unknown): EarnVault {
  const result = vaultSchema.safeParse(value)
  if (
    !result.success ||
    result.data.id.toLowerCase() !== sentoraPathUsdVault ||
    !result.data.verified
  )
    throw new Error('The Sentora pathUSD vault is currently unavailable. Try again later.')
  return result.data
}

export function earnVaultRequestUrl(): string {
  const url = new URL(`https://api.tempo.xyz/v1/earn/vaults/${sentoraPathUsdVault}`)
  url.searchParams.set('chainId', 'mainnet')
  url.searchParams.set('include', 'access,capabilities')
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

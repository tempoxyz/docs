import { describe, expect, it } from 'vitest'
import {
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultDetail,
  sentoraPathUsdVault,
} from './earn-vault-demo'

const vault = {
  id: sentoraPathUsdVault,
  verified: true,
  label: 'Sentora pathUSD (Earn)',
  assetToken: {
    address: '0x20c0000000000000000000000000000000000000',
    symbol: 'pathUSD',
    decimals: 6,
  },
  state: { depositsPaused: false },
  instantLiquidity: '1000000',
}

describe('Sentora-only vault inspector', () => {
  it('requests the approved mainnet vault directly without enumerating a directory', () => {
    const url = new URL(earnVaultRequestUrl())
    expect(url.origin).toBe('https://api.tempo.xyz')
    expect(url.pathname).toBe(`/v1/earn/vaults/${sentoraPathUsdVault}`)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      chainId: 'mainnet',
      include: 'access,capabilities',
    })
  })

  it('accepts only the approved verified vault, including checksummed addresses', () => {
    expect(parseEarnVaultDetail(vault)).toEqual(vault)
    const checksummed = { ...vault, id: `0x${sentoraPathUsdVault.slice(2).toUpperCase()}` }
    expect(parseEarnVaultDetail(checksummed)).toEqual(checksummed)
  })

  it.each([
    null,
    {},
    { ...vault, verified: false },
    { ...vault, id: '0x1234567890123456789012345678901234567890' },
    { data: [vault], nextCursor: null },
    { ...vault, state: { depositsPaused: 'false' } },
    { ...vault, assetToken: { ...vault.assetToken, decimals: 256 } },
  ])('fails closed for an unexpected response', (value) => {
    expect(() => parseEarnVaultDetail(value)).toThrow(
      'Sentora pathUSD vault is currently unavailable',
    )
  })

  it('distinguishes missing liquidity from zero and preserves integer precision', () => {
    expect(formatVaultLiquidity(parseEarnVaultDetail({ ...vault, instantLiquidity: null }))).toBe(
      'Not reported',
    )
    expect(formatVaultLiquidity(parseEarnVaultDetail({ ...vault, instantLiquidity: '0' }))).toBe(
      '0 pathUSD',
    )
    expect(
      formatVaultLiquidity(
        parseEarnVaultDetail({ ...vault, instantLiquidity: '9007199254740993123456' }),
      ),
    ).toBe('9007199254740993.123456 pathUSD')
  })
})

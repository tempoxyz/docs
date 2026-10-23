import { describe, expect, it } from 'vitest'
import {
  earnVaultForNetwork,
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultDetail,
  sentoraPathUsdVault,
} from './earn-vault-demo'

const vault = {
  id: sentoraPathUsdVault,
  verified: true,
  assetToken: {
    address: '0x20c0000000000000000000000000000000000000',
    symbol: 'pathUSD',
    decimals: 6,
  },
  state: { depositsPaused: false },
  instantLiquidity: '1000000',
}

describe('Approved vault inspector', () => {
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
    // The API sends no label, so the reviewed display label is added.
    const shown = { ...vault, ...earnVaultForNetwork('mainnet') }
    expect(parseEarnVaultDetail(vault)).toEqual(shown)
    const checksummed = { ...vault, id: `0x${sentoraPathUsdVault.slice(2).toUpperCase()}` }
    expect(parseEarnVaultDetail(checksummed)).toEqual(shown)
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
    expect(() => parseEarnVaultDetail(value)).toThrow('approved vault is currently unavailable')
  })

  it('uses only the reviewed testnet demo and a safe display label', () => {
    const approved = earnVaultForNetwork('testnet')
    const url = new URL(earnVaultRequestUrl('testnet'))
    expect(url.pathname).toBe(`/v1/earn/vaults/${approved.id}`)
    expect(url.searchParams.get('chainId')).toBe('testnet')
    expect(
      parseEarnVaultDetail({ ...vault, id: approved.id, label: 'Unreviewed label' }, 'testnet'),
    ).toEqual({ ...vault, ...approved })
  })

  it('rejects a vault from the wrong network', () => {
    expect(() => parseEarnVaultDetail(vault, 'testnet')).toThrow(
      'approved vault is currently unavailable',
    )
    expect(() =>
      parseEarnVaultDetail({ ...vault, id: earnVaultForNetwork('testnet').id }, 'mainnet'),
    ).toThrow('approved vault is currently unavailable')
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

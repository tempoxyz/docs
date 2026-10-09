import { describe, expect, it } from 'vitest'
import { earnDemoVault } from './earn-deposit-demo'
import {
  type EarnVault,
  earnVaultDetailRequestUrl,
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultDetail,
  parseEarnVaultPage,
  updateEarnVaultDirectory,
} from './earn-vault-demo'

const vault: EarnVault = {
  id: '0x1234567890123456789012345678901234567890',
  verified: true,
  label: 'Test vault',
  assetToken: {
    address: '0x20c0000000000000000000000000000000000000',
    symbol: 'pathUSD',
    decimals: 6,
  },
  state: { depositsPaused: false },
  instantLiquidity: '1000000',
}

describe('Earn vault directory responses', () => {
  it('accepts omitted enrichments without inventing access or capabilities', () => {
    const page = parseEarnVaultPage({ data: [vault], nextCursor: null })
    expect(page).toEqual({ data: [vault], nextCursor: null })
    expect(page.data[0].access).toBeUndefined()
    expect(page.data[0].capabilities).toBeUndefined()
    expect(page.data[0].apy).toBeUndefined()
    expect(page.data[0].tvl).toBeUndefined()
  })

  it('preserves unavailable values separately from reported zeroes', () => {
    const unavailable = { ...vault, instantLiquidity: null, apy: null, tvl: null }
    const zero = {
      ...vault,
      instantLiquidity: '0',
      apy: { vault: '0.000000', window: '7d', asOf: '2026-10-08T11:00:00.000Z' },
      tvl: { formatted: '0', currency: 'USD' },
      access: { status: 'allowlisted' },
      capabilities: { deposit: false, redeem: false, asyncRedeem: true },
    }
    const page = parseEarnVaultPage({ data: [unavailable, zero], nextCursor: 'next-page' })
    expect(page).toEqual({ data: [unavailable, zero], nextCursor: 'next-page' })
    expect(formatVaultLiquidity(page.data[0])).toBe('Not reported')
    expect(formatVaultLiquidity(page.data[1])).toBe('0 pathUSD')
  })

  it('accepts an empty directory', () => {
    expect(parseEarnVaultPage({ data: [], nextCursor: null })).toEqual({
      data: [],
      nextCursor: null,
    })
  })

  it.each([
    null,
    {},
    { data: [], nextCursor: 1 },
    { data: [vault] },
    { data: [{ ...vault, id: 'not-an-address' }], nextCursor: null },
    { data: [{ ...vault, state: null }], nextCursor: null },
    { data: [{ ...vault, state: { depositsPaused: 'false' } }], nextCursor: null },
    { data: [{ ...vault, access: { status: 'unknown' } }], nextCursor: null },
    { data: [{ ...vault, capabilities: { deposit: true } }], nextCursor: null },
    { data: [{ ...vault, instantLiquidity: -1 }], nextCursor: null },
  ])('rejects malformed data with an actionable error', (value) => {
    expect(() => parseEarnVaultPage(value)).toThrow('unexpected vault response')
  })
})

describe('Earn vault liquidity display', () => {
  it('converts base units without losing integer precision', () => {
    expect(formatVaultLiquidity(vault)).toBe('1 pathUSD')
    expect(formatVaultLiquidity({ ...vault, instantLiquidity: '1' })).toBe('0.000001 pathUSD')
    expect(formatVaultLiquidity({ ...vault, instantLiquidity: '9007199254740993123456' })).toBe(
      '9007199254740993.123456 pathUSD',
    )
  })

  it.each([
    -1,
    1.5,
    256,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('guards unsupported decimal precision %s', (decimals) => {
    const invalid = { ...vault, assetToken: { ...vault.assetToken, decimals } }
    expect(formatVaultLiquidity(invalid)).toBe('Not reported')
    expect(() => parseEarnVaultPage({ data: [invalid], nextCursor: null })).toThrow(
      'unexpected vault response',
    )
  })
})

describe('Earn vault requests', () => {
  it('uses the public verified directory with the requested network and enrichments', () => {
    const url = new URL(earnVaultRequestUrl('testnet'))
    expect(url.origin).toBe('https://api.tempo.xyz')
    expect(url.pathname).toBe('/v1/earn/vaults/verified')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      chainId: 'testnet',
      include: 'access,capabilities,apy,tvl',
      limit: '10',
    })
  })

  it('encodes an opaque cursor without turning it into request parameters', () => {
    const cursor = 'page+/=&chainId=testnet#part'
    const url = new URL(earnVaultRequestUrl('mainnet', cursor))
    expect(url.searchParams.get('cursor')).toBe(cursor)
    expect(url.searchParams.getAll('chainId')).toEqual(['mainnet'])
    expect(url.hash).toBe('')
  })
})

describe('Earn vault discovery defaults', () => {
  const empty = { vaults: [], selectedId: '', nextCursor: null, loaded: false }
  const preferred = { ...vault, id: earnDemoVault, label: 'Verified test deployment' }
  const page = { data: [vault, preferred], nextCursor: 'next' }

  it('selects the real testnet deployment if listed and otherwise the first verified vault', () => {
    expect(updateEarnVaultDirectory(empty, page, 'testnet').selectedId).toBe(earnDemoVault)
    expect(updateEarnVaultDirectory(empty, page, 'mainnet').selectedId).toBe(vault.id)
    expect(updateEarnVaultDirectory(empty, { ...page, data: [vault] }, 'testnet').selectedId).toBe(
      vault.id,
    )
  })

  it('does not invent a vault or select an unverified result', () => {
    const unverified = { ...preferred, verified: false }
    expect(
      updateEarnVaultDirectory(empty, { data: [unverified], nextCursor: null }, 'testnet')
        .selectedId,
    ).toBe('')
    expect(parseEarnVaultPage({ data: [unverified, vault], nextCursor: null }).data).toEqual([
      vault,
    ])
  })

  it('preserves a deliberate selection on refresh and pagination', () => {
    const chosen = { ...empty, vaults: [vault], selectedId: vault.id, loaded: true }
    expect(updateEarnVaultDirectory(chosen, page, 'testnet').selectedId).toBe(vault.id)
    const next = updateEarnVaultDirectory(
      chosen,
      { data: [preferred, vault], nextCursor: null },
      'testnet',
      true,
    )
    expect(next.selectedId).toBe(vault.id)
    expect(next.vaults).toEqual([vault, preferred])
  })

  it('replaces a removed selection using verified current data', () => {
    const chosen = { ...empty, vaults: [vault], selectedId: vault.id, loaded: true }
    expect(
      updateEarnVaultDirectory(chosen, { data: [preferred], nextCursor: null }, 'testnet')
        .selectedId,
    ).toBe(earnDemoVault)
    expect(updateEarnVaultDirectory(chosen, { data: [], nextCursor: null }, 'testnet')).toEqual({
      ...empty,
      loaded: true,
    })
  })

  it('uses a matching verified detail response to refresh a selection outside the first page', () => {
    expect(parseEarnVaultDetail(vault, vault.id)).toEqual(vault)
    expect(parseEarnVaultDetail({ ...vault, verified: false }, vault.id)).toBeNull()
    expect(() => parseEarnVaultDetail(preferred, vault.id)).toThrow('unexpected vault response')
    const url = new URL(earnVaultDetailRequestUrl('testnet', vault.id))
    expect(url.pathname).toBe(`/v1/earn/vaults/${vault.id}`)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      chainId: 'testnet',
      include: 'access,capabilities,apy,tvl',
    })
  })
})

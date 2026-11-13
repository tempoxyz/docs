import { getAddress } from 'viem'
import { tempo, tempoDevnet, tempoModerato } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { alphaUsd, ousd, pathUsd, usdce } from '../../tokens'
import {
  feeTokenChoices,
  feeTokenLabel,
  feeTokenNetwork,
  feeTokenParam,
  feeTokenSlug,
  findFeeTokenChoice,
  parseFeeTokenNetwork,
  resolveFeeTokenPreset,
} from './fee-token-options'

describe('fee token options', () => {
  it('maps Tempo chains to their network', () => {
    expect(feeTokenNetwork(tempo.id)).toBe('mainnet')
    expect(feeTokenNetwork(tempoModerato.id)).toBe('testnet')
    expect(feeTokenNetwork(tempoDevnet.id)).toBe('testnet')
    expect(feeTokenNetwork(1)).toBeUndefined()
    expect(feeTokenNetwork(undefined)).toBeUndefined()
  })

  it('offers OUSD first on mainnet, then USDC.e and pathUSD', () => {
    const choices = feeTokenChoices('mainnet')
    expect(choices.map((choice) => choice.address)).toEqual([ousd, usdce, pathUsd])
    expect(choices[0]?.recommended).toBe(true)
  })

  it('keeps AlphaUSD as the testnet default and adds OUSD and pathUSD', () => {
    const choices = feeTokenChoices('testnet')
    expect(choices[0]?.address).toBe(alphaUsd)
    expect(choices.map((choice) => choice.label)).toEqual([
      'AlphaUSD',
      'BetaUSD',
      'ThetaUSD',
      'OUSD',
      'pathUSD',
    ])
  })

  it('does not offer test stablecoins on mainnet', () => {
    expect(findFeeTokenChoice('mainnet', alphaUsd)).toBeUndefined()
    expect(findFeeTokenChoice('mainnet', usdce.toUpperCase().replace('0X', '0x'))?.label).toBe(
      'USDC.e',
    )
  })

  it('labels unlisted tokens by their shortened address', () => {
    expect(feeTokenLabel('mainnet', ousd)).toBe('OUSD')
    expect(feeTokenLabel('mainnet', '0x20c0000000000000000000000000000000001234')).toBe(
      '0x20c0…1234',
    )
  })
})

describe('fee token links', () => {
  it('reads the network by name or chain ID', () => {
    expect(parseFeeTokenNetwork('Mainnet')).toBe('mainnet')
    expect(parseFeeTokenNetwork('testnet')).toBe('testnet')
    expect(parseFeeTokenNetwork(String(tempo.id))).toBe('mainnet')
    expect(parseFeeTokenNetwork(String(tempoModerato.id))).toBe('testnet')
    expect(parseFeeTokenNetwork('1')).toBeUndefined()
    expect(parseFeeTokenNetwork('base')).toBeUndefined()
    expect(parseFeeTokenNetwork(null)).toBeUndefined()
  })

  it('resolves a listed stablecoin by symbol on its network only', () => {
    expect(resolveFeeTokenPreset('mainnet', 'usdce')).toBe(usdce)
    expect(resolveFeeTokenPreset('mainnet', 'USDC.e')).toBe(usdce)
    expect(resolveFeeTokenPreset('mainnet', 'OUSD')).toBe(ousd)
    expect(resolveFeeTokenPreset('testnet', 'usdce')).toBeUndefined()
    expect(resolveFeeTokenPreset('testnet', 'alphausd')).toBe(alphaUsd)
    expect(resolveFeeTokenPreset('mainnet', '')).toBeUndefined()
  })

  it('accepts an address in any letter case and checksums it', () => {
    const upper = `0x${usdce.slice(2).toUpperCase()}`
    expect(resolveFeeTokenPreset('mainnet', upper)).toBe(getAddress(usdce))
    expect(resolveFeeTokenPreset('mainnet', '0x1234')).toBeUndefined()
  })

  it('writes a symbol for listed stablecoins and the address otherwise', () => {
    expect(feeTokenParam('mainnet', usdce)).toBe('usdce')
    expect(feeTokenParam('mainnet', pathUsd)).toBe('pathusd')
    const other = '0x20C0000000000000000000000000000000001234'
    expect(feeTokenParam('mainnet', other)).toBe(other)
    expect(feeTokenSlug('USDC.e')).toBe('usdce')
  })
})

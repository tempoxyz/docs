import { tempo, tempoDevnet, tempoModerato } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { alphaUsd, ousd, pathUsd, usdce } from '../../tokens'
import {
  feeTokenChoices,
  feeTokenLabel,
  feeTokenNetwork,
  findFeeTokenChoice,
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

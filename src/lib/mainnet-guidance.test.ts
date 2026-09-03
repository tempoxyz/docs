import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(path, 'utf8')

describe('mainnet guidance', () => {
  it('keeps the published docs skill on current mainnet facts', () => {
    const docsSkill = read('SKILL.md')

    expect(docsSkill).toContain('Tempo Mainnet')
    expect(docsSkill).toContain('pathUSD')
    expect(docsSkill).toContain('Moderato is Tempo Testnet')
  })

  it('distinguishes production pathUSD from testnet faucet tokens', () => {
    const pathUsd = read('src/pages/docs/protocol/exchange/quote-tokens.mdx')
    const faucet = read('src/pages/docs/quickstart/faucet.mdx')

    expect(pathUsd).toContain('`pathUSD` is live on Tempo Mainnet.')
    expect(pathUsd).toContain('Testnet balances have no relationship to production pathUSD')
    expect(faucet).toContain('https://explore.testnet.tempo.xyz/address/')
    expect(faucet).not.toContain('https://explore.tempo.xyz/address/')
  })
})

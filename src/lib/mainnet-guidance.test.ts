import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(path, 'utf8')

describe('mainnet guidance', () => {
  it('defaults agent wallet and production workflows to mainnet', () => {
    const docsSkill = read('SKILL.md')
    const developerSkill = read('ai/plugins/tempo-docs/skills/tempo-docs/SKILL.md')
    const walletSkill = read('ai/plugins/tempo-wallet/skills/tempo-wallet/SKILL.md')

    for (const skill of [docsSkill, developerSkill, walletSkill]) {
      expect(skill).toContain('Tempo Mainnet')
      expect(skill).toContain('pathUSD')
    }

    expect(developerSkill).toContain(
      'For production examples, use the current Tempo Mainnet details from the docs.',
    )
    expect(developerSkill).not.toContain(
      'Use Tempo Testnet examples unless the user explicitly asks for mainnet.',
    )
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

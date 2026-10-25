import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  parseNetworkIdentity,
  renderNetworkIdentitySnippets,
} from '../../scripts/network-identities'
import identities from '../snippets/network-identities.json'

const read = (path: string) => readFileSync(path, 'utf8')

const snippetPath = 'src/snippets/network-identities.txt'
const networkUpgradesPath = 'src/pages/docs/guide/node/network-upgrades.mdx'
const troubleshootingPath = 'src/pages/docs/guide/node/validator-troubleshooting.mdx'

const networks = [
  { name: 'mainnet', tab: 'Mainnet' },
  { name: 'testnet', tab: 'Testnet' },
] as const

function region(source: string, name: string) {
  const match = source.match(
    new RegExp(`// \\[!region ${name}\\]\\n([\\s\\S]*?)\\n// \\[!endregion ${name}\\]`),
  )
  expect(match, `missing region ${name}`).toBeTruthy()
  return match?.[1] ?? ''
}

describe('network identities', () => {
  const snippet = read(snippetPath)
  const networkUpgrades = read(networkUpgradesPath)
  const troubleshooting = read(troubleshootingPath)

  for (const { name, tab } of networks) {
    it(`keeps the ${name} identity, override command, and page epoch in sync`, () => {
      const identity = region(snippet, `${name}-identity`)
      const override = region(snippet, `${name}-override`)

      expect(identity).toMatch(/^0x[0-9a-f]{192}$/)
      expect(override).toContain(`--consensus.network-identity ${identity} \\`)

      const epoch = override.match(/--consensus\.network-identity-from-epoch (\d+)$/)?.[1]
      expect(epoch).toBe(String(identities[name].fromEpoch))
      expect(identity).toBe(identities[name].identity)

      const tabSource = networkUpgrades.match(
        new RegExp(`<Tab title="${tab}">([\\s\\S]*?)</Tab>`),
      )?.[1]
      expect(tabSource, `missing ${tab} tab`).toBeTruthy()
      expect(tabSource).toContain(
        `**Network identity, from epoch {networkIdentities.${name}.fromEpoch}:**`,
      )
      expect(tabSource).toContain(
        `// [!include ~/snippets/network-identities.txt:${name}-identity]`,
      )
      expect(troubleshooting).toContain(
        `// [!include ~/snippets/network-identities.txt:${name}-override]`,
      )
    })
  }

  it('does not hard-code identities outside the shared snippet', () => {
    for (const source of [networkUpgrades, troubleshooting]) {
      expect(source).not.toMatch(/0x[0-9a-f]{192}/)
    }
  })
})

describe('Tempo identity JSON', () => {
  it('reads the published key and epoch together', () => {
    expect(parseNetworkIdentity({ from_epoch: 3000, identity: `0x${'ab'.repeat(96)}` })).toEqual({
      fromEpoch: 3000,
      identity: `0x${'ab'.repeat(96)}`,
    })
  })

  it('generates keys and commands from the same data', () => {
    const rotated = {
      ...identities,
      mainnet: { fromEpoch: 3000, identity: `0x${'ef'.repeat(96)}` },
    }
    const snippet = renderNetworkIdentitySnippets(rotated)
    expect(region(snippet, 'mainnet-identity')).toBe(rotated.mainnet.identity)
    expect(region(snippet, 'mainnet-override')).toBe(
      [
        'tempo node \\',
        `  --consensus.network-identity ${rotated.mainnet.identity} \\`,
        '  --consensus.network-identity-from-epoch 3000',
      ].join('\n'),
    )
    expect(region(snippet, 'testnet-identity')).toBe(identities.testnet.identity)
    expect(renderNetworkIdentitySnippets(identities)).toBe(read(snippetPath))
  })

  it('rejects missing fields, malformed keys, and invalid epochs', () => {
    for (const invalid of [
      null,
      {},
      { identity: identities.mainnet.identity },
      { from_epoch: 1, identity: '0xab' },
      { from_epoch: -1, identity: identities.mainnet.identity },
      { from_epoch: 1.5, identity: identities.mainnet.identity },
      { from_epoch: 9007199254740992, identity: identities.mainnet.identity },
    ]) {
      expect(() => parseNetworkIdentity(invalid)).toThrow('Invalid network identity')
    }
  })
})

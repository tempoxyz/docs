import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
      expect(epoch, `missing ${name} from-epoch`).toBeTruthy()

      const tabSource = networkUpgrades.match(
        new RegExp(`<Tab title="${tab}">([\\s\\S]*?)</Tab>`),
      )?.[1]
      expect(tabSource, `missing ${tab} tab`).toBeTruthy()
      expect(tabSource).toContain(`**Network identity, from epoch ${epoch}:**`)
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

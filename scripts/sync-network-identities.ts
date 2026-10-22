import { writeFile } from 'node:fs/promises'
import {
  networkIdentitySource,
  parseNetworkIdentity,
  renderNetworkIdentitySnippets,
} from './network-identities.ts'

// Fetch and validate both networks before replacing either generated file.
// Fail rather than publish an unchecked, potentially outdated trust anchor.
async function load(network: 'mainnet' | 'testnet') {
  const response = await fetch(`${networkIdentitySource}/${network}-network-identity.json`, {
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`Fetching ${network} identity failed: HTTP ${response.status}`)
  return parseNetworkIdentity(await response.json())
}
const [mainnet, testnet] = await Promise.all([load('mainnet'), load('testnet')])
const identities = { mainnet, testnet }

await writeFile(
  new URL('../src/snippets/network-identities.json', import.meta.url),
  `${JSON.stringify(identities, null, 2)}\n`,
)
await writeFile(
  new URL('../src/snippets/network-identities.txt', import.meta.url),
  renderNetworkIdentitySnippets(identities),
)

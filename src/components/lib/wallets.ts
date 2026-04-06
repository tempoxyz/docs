import type { Connector } from 'wagmi'

const UNSUPPORTED_WALLET_IDS = new Set(['app.phantom'])
const UNSUPPORTED_WALLET_NAMES = new Set(['Phantom'])

export function filterSupportedInjectedConnectors(connectors: readonly Connector[]) {
  const seen = new Set<string>()
  return connectors.filter((connector) => {
    if (connector.id === 'webAuthn') return false
    if (UNSUPPORTED_WALLET_IDS.has(connector.id)) return false
    if (UNSUPPORTED_WALLET_NAMES.has(connector.name)) return false
    if (seen.has(connector.id)) return false
    seen.add(connector.id)
    return true
  })
}

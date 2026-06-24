import type { Connector } from 'wagmi'

const UNSUPPORTED_WALLET_IDS = new Set(['app.phantom'])
const UNSUPPORTED_WALLET_NAMES = new Set(['Phantom'])

export function filterSupportedInjectedConnectors(
  connectors: readonly Connector[],
  options: { includeWebAuthn?: boolean } = {},
) {
  const seen = new Set<string>()
  return connectors.filter((connector) => {
    if (connector.id === 'webAuthn' && !options.includeWebAuthn) return false
    if (UNSUPPORTED_WALLET_IDS.has(connector.id)) return false
    if (UNSUPPORTED_WALLET_NAMES.has(connector.name)) return false
    if (seen.has(connector.id)) return false
    seen.add(connector.id)
    return true
  })
}

export function isFundableWalletConnector(
  connector: Pick<Connector, 'id'>,
  options: { includeWebAuthn?: boolean } = {},
) {
  return connector.id !== 'webAuthn' || options.includeWebAuthn === true
}

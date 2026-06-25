import type { Connector } from 'wagmi'

const UNSUPPORTED_WALLET_IDS = new Set(['app.phantom'])
const UNSUPPORTED_WALLET_NAMES = new Set(['Phantom'])
const TEMPO_MANAGED_WALLET_IDS = new Set(['webAuthn', 'xyz.tempo'])

export function isBrowserWalletConnectorId(connectorId: string) {
  return !TEMPO_MANAGED_WALLET_IDS.has(connectorId)
}

function filterSupportedConnectors(
  connectors: readonly Connector[],
  isSupported: (connector: Connector) => boolean,
) {
  const seen = new Set<string>()
  return connectors.filter((connector) => {
    if (!isSupported(connector)) return false
    if (UNSUPPORTED_WALLET_IDS.has(connector.id)) return false
    if (UNSUPPORTED_WALLET_NAMES.has(connector.name)) return false
    if (seen.has(connector.id)) return false
    seen.add(connector.id)
    return true
  })
}

export function filterSupportedInjectedConnectors(
  connectors: readonly Connector[],
  options: { includeWebAuthn?: boolean } = {},
) {
  return filterSupportedConnectors(connectors, (connector) => {
    if (connector.id === 'webAuthn') return options.includeWebAuthn === true
    return isBrowserWalletConnectorId(connector.id)
  })
}

export function filterSupportedFundableWalletConnectors(
  connectors: readonly Connector[],
  options: { includeWebAuthn?: boolean } = {},
) {
  return filterSupportedConnectors(connectors, (connector) =>
    isFundableWalletConnector(connector, options),
  )
}

export function isFundableWalletConnector(
  connector: Pick<Connector, 'id'>,
  options: { includeWebAuthn?: boolean } = {},
) {
  if (connector.id === 'webAuthn') return options.includeWebAuthn === true
  return true
}

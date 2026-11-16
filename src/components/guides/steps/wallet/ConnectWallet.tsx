'use client'

import * as React from 'react'
import {
  type Connector,
  useChains,
  useConnect,
  useConnections,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import LucideCheck from '~icons/lucide/check'
import LucideWalletCards from '~icons/lucide/wallet-cards'
import {
  filterSupportedFundableWalletConnectors,
  filterSupportedInjectedConnectors,
  isFundableWalletConnector,
  isInstalledBrowserWalletConnectorId,
  withoutGenericInjected,
} from '../../../lib/wallets'
import { Button, Step, StringFormatter, useCopyToClipboard, useHydrated } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'
import * as ui from './ConnectWallet.recipes'

export type ConnectWalletProps = DemoStepProps & {
  /** Require this chain, such as Tempo Mainnet. Defaults to the docs' testnet. */
  chainId?: number | undefined
  /** Offer only browser wallets, such as MetaMask or Rabby, and not Tempo Wallet. */
  browserWalletsOnly?: boolean | undefined
}

export function ConnectWallet(props: ConnectWalletProps) {
  const { stepNumber = 1, chainId: requiredChainId, browserWalletsOnly = false } = props
  const isE2E = import.meta.env.VITE_E2E === 'true'
  const connections = useConnections()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connectors = useConnectors()
  const [connectError, setConnectError] = React.useState<Error | null>(null)
  const fundableConnectors = React.useMemo(
    () =>
      browserWalletsOnly
        ? withoutGenericInjected(filterSupportedInjectedConnectors(connectors))
        : filterSupportedFundableWalletConnectors(connectors, { includeWebAuthn: isE2E }),
    [connectors, browserWalletsOnly],
  )
  const switchChain = useSwitchChain()
  const chains = useChains()
  const [copied, copyToClipboard] = useCopyToClipboard()
  // Browser wallets announce themselves only in the browser, so wait for hydration before listing them.
  const hydrated = useHydrated()

  const walletConnection = connections.find((c) =>
    browserWalletsOnly
      ? isInstalledBrowserWalletConnectorId(c.connector.id)
      : isFundableWalletConnector(c.connector, { includeWebAuthn: isE2E }),
  )
  const walletAddress = walletConnection?.accounts[0]
  const walletConnector = walletConnection?.connector
  const requiredChain = chains.find((c) => c.id === requiredChainId)
  const targetChain = requiredChain ?? chains[0]
  const isSupported = requiredChain
    ? walletConnection?.chainId === requiredChain.id
    : chains.some((c) => c.id === walletConnection?.chainId)
  const walletName = walletConnector?.name ?? 'Wallet'
  const hasNonWebAuthnWallet = Boolean(walletAddress)
  const active = !hasNonWebAuthnWallet || !isSupported
  const completed = hasNonWebAuthnWallet && isSupported

  const handleConnect = React.useCallback(
    async (connector: Connector) => {
      setConnectError(null)
      try {
        await disconnect.disconnectAsync().catch(() => {})
        await connect.connectAsync({
          connector,
          ...(isE2E && connector.id === 'webAuthn'
            ? { capabilities: { method: 'register' as const, name: 'Tempo Docs' } }
            : {}),
        })
      } catch (error) {
        setConnectError(error instanceof Error ? error : new Error('Failed to connect wallet.'))
      }
    },
    [connect.connectAsync, disconnect.disconnectAsync],
  )

  const actions = React.useMemo(() => {
    if (!hydrated) return null

    if (!fundableConnectors.length) {
      return (
        <div {...ui.connectWalletLayout()}>
          {browserWalletsOnly
            ? 'No browser wallet found. Install one, such as MetaMask or Rabby.'
            : 'No wallets found.'}
        </div>
      )
    }

    if (!hasNonWebAuthnWallet) {
      return (
        <div {...ui.connectWalletLayout2()}>
          {fundableConnectors.map((conn) => (
            <Button
              variant="default"
              className={ui.connectWalletButton().className}
              key={conn.id}
              disabled={connect.isPending}
              onClick={() => void handleConnect(conn)}
              type="button"
            >
              {conn.icon ? <img {...ui.img()} src={conn.icon} alt={conn.name} /> : <div />}
              {conn.name}
            </Button>
          ))}
        </div>
      )
    }

    return (
      <div {...ui.connectWalletLayout3()}>
        <div {...ui.connectWalletLayout4()}>
          <Button onClick={() => walletAddress && copyToClipboard(walletAddress)} variant="default">
            {copied ? (
              <LucideCheck className={ui.lucideCheck().className} />
            ) : (
              <LucideWalletCards className={ui.lucideCheck().className} />
            )}
            {walletAddress &&
              StringFormatter.truncate(walletAddress, {
                start: 6,
                end: 4,
                separator: '⋅⋅⋅',
              })}
          </Button>
          <Button
            variant="destructive"
            className={form.actionButton().className}
            onClick={() => disconnect.disconnect({ connector: walletConnector })}
            type="button"
          >
            Disconnect
          </Button>
        </div>
        {!isSupported && (
          <Button
            className={ui.connectWalletButton3().className}
            variant="accent"
            onClick={() =>
              switchChain.switchChain({
                chainId: targetChain.id,
                addEthereumChainParameter: {
                  nativeCurrency: {
                    name: 'USD',
                    decimals: 18,
                    symbol: 'USD',
                  },
                  blockExplorerUrls: [
                    requiredChain?.blockExplorers?.default.url ?? 'https://explore.tempo.xyz',
                  ],
                },
              })
            }
          >
            {requiredChain ? `Switch to ${requiredChain.name}` : `Add Tempo to ${walletName}`}
          </Button>
        )}
        {switchChain.isSuccess && isSupported && (
          <div {...ui.connectWalletLayout5()}>
            {requiredChain
              ? `${walletName} is on ${requiredChain.name}.`
              : `Added Tempo to ${walletName}!`}
          </div>
        )}
      </div>
    )
  }, [
    hydrated,
    fundableConnectors,
    hasNonWebAuthnWallet,
    walletAddress,
    walletConnector,
    copied,
    copyToClipboard,
    disconnect,
    connect.isPending,
    handleConnect,
    isSupported,
    switchChain,
    targetChain,
    requiredChain,
    walletName,
    browserWalletsOnly,
  ])

  const stackConnectors = fundableConnectors.length > 2

  return (
    <Step
      active={active}
      completed={completed}
      error={connectError ?? connect.error}
      number={stepNumber}
      title={
        requiredChain ? `Connect your wallet on ${requiredChain.name}.` : 'Connect your wallet.'
      }
      actions={!stackConnectors && actions}
    >
      {stackConnectors && actions}
    </Step>
  )
}

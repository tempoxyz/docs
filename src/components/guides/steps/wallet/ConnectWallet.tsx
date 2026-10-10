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
  isFundableWalletConnector,
} from '../../../lib/wallets'
import { Button, Step, StringFormatter, useCopyToClipboard } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'
import * as ui from './ConnectWallet.recipes'

export function ConnectWallet(props: DemoStepProps) {
  const { stepNumber = 1 } = props
  const isE2E = import.meta.env.VITE_E2E === 'true'
  const connections = useConnections()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connectors = useConnectors()
  const [connectError, setConnectError] = React.useState<Error | null>(null)
  const fundableConnectors = React.useMemo(
    () => filterSupportedFundableWalletConnectors(connectors, { includeWebAuthn: isE2E }),
    [connectors],
  )
  const switchChain = useSwitchChain()
  const chains = useChains()
  const [copied, copyToClipboard] = useCopyToClipboard()

  const walletConnection = connections.find((c) =>
    isFundableWalletConnector(c.connector, { includeWebAuthn: isE2E }),
  )
  const walletAddress = walletConnection?.accounts[0]
  const walletConnector = walletConnection?.connector
  const isSupported = chains.some((c) => c.id === walletConnection?.chainId)
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
    if (!fundableConnectors.length) {
      return <div {...ui.connectWalletLayout()}>No wallets found.</div>
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
                chainId: chains[0].id,
                addEthereumChainParameter: {
                  nativeCurrency: {
                    name: 'USD',
                    decimals: 18,
                    symbol: 'USD',
                  },
                  blockExplorerUrls: ['https://explore.tempo.xyz'],
                },
              })
            }
          >
            Add Tempo to {walletConnector?.name ?? 'Wallet'}
          </Button>
        )}
        {switchChain.isSuccess && (
          <div {...ui.connectWalletLayout5()}>
            Added Tempo to {walletConnector?.name ?? 'Wallet'}!
          </div>
        )}
      </div>
    )
  }, [
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
    chains,
  ])

  const stackConnectors = fundableConnectors.length > 2

  return (
    <Step
      active={active}
      completed={completed}
      error={connectError ?? connect.error}
      number={stepNumber}
      title="Connect your wallet."
      actions={!stackConnectors && actions}
    >
      {stackConnectors && actions}
    </Step>
  )
}

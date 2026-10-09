'use client'
import * as React from 'react'
import { tempo } from 'viem/chains'
import { useChains, useConnect, useConnection, useConnectors, useSwitchChain } from 'wagmi'
import * as ui from './ConnectWallet.recipes'
import { Button, Logout } from './guides/Demo'
import { filterSupportedInjectedConnectors } from './lib/wallets'

const mainnetParams = {
  chainId: tempo.id,
  addEthereumChainParameter: {
    chainName: tempo.name,
    nativeCurrency: { name: 'USD', decimals: 18, symbol: 'USD' },
    rpcUrls: [tempo.rpcUrls.default.http[0]],
    blockExplorerUrls: ['https://explore.tempo.xyz'],
  },
}

export function ConnectWallet({
  showAddChain = true,
  network = 'testnet',
}: {
  showAddChain?: boolean
  network?: 'mainnet' | 'testnet'
}) {
  const { address, chain, connector } = useConnection()
  const connect = useConnect()
  const connectors = useConnectors()
  const injectedConnectors = React.useMemo(
    () => filterSupportedInjectedConnectors(connectors),
    [connectors],
  )
  const switchChain = useSwitchChain()
  const chains = useChains()
  const targetChainId = network === 'mainnet' ? tempo.id : chains[0].id
  const isSupported =
    network === 'mainnet' ? chain?.id === targetChainId : chains.some((c) => c.id === chain?.id)
  if (!injectedConnectors.length)
    return <div {...ui.connectWalletLayout()}>No browser wallets found.</div>
  if (!address || connector?.id === 'webAuthn')
    return (
      <div {...ui.connectWalletLayout2()}>
        {injectedConnectors.map((connector) => (
          <Button
            variant="default"
            className={ui.connectWalletButton().className}
            key={connector.id}
            onClick={() => connect.connect({ connector })}
          >
            {connector.icon ? (
              <img {...ui.img()} src={connector.icon} alt={connector.name} />
            ) : (
              <div />
            )}
            {connector.name}
          </Button>
        ))}
      </div>
    )

  const switchParams =
    network === 'mainnet'
      ? mainnetParams
      : {
          chainId: chains[0].id,
          addEthereumChainParameter: {
            nativeCurrency: { name: 'USD', decimals: 18, symbol: 'USD' },
            blockExplorerUrls: ['https://explore.testnet.tempo.xyz'],
          },
        }

  return (
    <div {...ui.connectWalletLayout3()}>
      <Logout />
      {showAddChain && !isSupported && (
        <Button
          className={ui.connectWalletButton2().className}
          variant="accent"
          onClick={() => switchChain.switchChain(switchParams)}
        >
          Add Tempo to {connector?.name ?? 'Wallet'}
        </Button>
      )}
      {switchChain.isSuccess && (
        <div {...ui.connectWalletLayout4()}>Added Tempo to {connector?.name ?? 'Wallet'}!</div>
      )}
    </div>
  )
}

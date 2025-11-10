import * as React from 'react'
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { Button } from './guides/Demo'

export function AddTempoToWallet() {
  const { address, connector } = useAccount()
  const connect = useConnect()
  const connectors = useConnectors()
  const injectedConnectors = React.useMemo(
    () => connectors.filter((connector) => connector.id !== 'webAuthn'),
    [connectors],
  )
  const disconnect = useDisconnect({
    mutation: {
      onSuccess() {
        switchChain.reset()
      },
    },
  })
  const switchChain = useSwitchChain()
  const chainId = useChainId()
  if (!injectedConnectors.length) return null
  if (!address)
    return (
      <div className="flex gap-2">
        {injectedConnectors.map((connector) => (
          <Button
            variant="default"
            className="flex gap-1.5 items-center"
            key={connector.id}
            onClick={() => connect.connect({ connector })}
          >
            {connector.icon ? (
              <img
                className="size-5"
                src={connector.icon}
                alt={connector.name}
              />
            ) : (
              <div />
            )}
            {connector.name}
          </Button>
        ))}
      </div>
    )
  return (
    <div className="flex gap-2">
      {switchChain.isSuccess ? (
        <div className="text-[14px] -tracking-[2%] h-[34px] font-[510] flex items-center">
          Added Tempo to {connector?.name ?? 'Wallet'}!
        </div>
      ) : (
        <Button
          variant="accent"
          onClick={() =>
            switchChain.switchChain({
              chainId,
              addEthereumChainParameter: {
                nativeCurrency: {
                  name: 'USD',
                  decimals: 18,
                  symbol: 'USD',
                },
              },
            })
          }
        >
          Add Tempo to {connector?.name ?? 'Wallet'}
        </Button>
      )}
      <Button variant="default" onClick={() => disconnect.disconnect()}>
        Disconnect
      </Button>
    </div>
  )
}

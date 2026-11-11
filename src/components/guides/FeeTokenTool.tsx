'use client'

import * as React from 'react'
import type { Address } from 'viem'
import { useChains } from 'wagmi'
import LucideCheck from '~icons/lucide/check'
import LucideLink from '~icons/lucide/link'
import { SegmentedControl } from '../SegmentedControl'
import * as Demo from './Demo'
import * as ui from './FeeTokenTool.recipes'
import { ConnectWallet } from './steps/wallet/ConnectWallet'
import {
  type FeeTokenNetwork,
  feeTokenNetwork,
  feeTokenParam,
  NETWORK_CHAIN_IDS,
  NETWORK_NAMES,
  parseFeeTokenNetwork,
  resolveFeeTokenPreset,
} from './steps/wallet/fee-token-options'
import { SetFeeToken } from './steps/wallet/SetFeeToken'

const NETWORK_ITEMS = [
  { label: 'Mainnet', value: 'mainnet' },
  { label: 'Testnet', value: 'testnet' },
] as const satisfies readonly { label: string; value: FeeTokenNetwork }[]

type Preset = { network: FeeTokenNetwork; token: Address | undefined }

/** The network and token a link names, such as `?network=mainnet&token=usdce`. */
function readPreset(search: string): Preset {
  const params = new URLSearchParams(search)
  const network = parseFeeTokenNetwork(params.get('network')) ?? 'mainnet'
  return { network, token: resolveFeeTokenPreset(network, params.get('token')) }
}

/** Keeps the address bar on the reader's choices, so copying it shares them. */
function writePreset(network: FeeTokenNetwork, token: Address | undefined) {
  const url = new URL(window.location.href)
  url.searchParams.set('network', network)
  if (token) url.searchParams.set('token', feeTokenParam(network, token))
  else url.searchParams.delete('token')
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url)
}

/** Sets an account's default fee token from a browser wallet, on mainnet or testnet. */
export function FeeTokenTool() {
  const hydrated = Demo.useHydrated()
  // The link's choices exist only in the browser, so the widget mounts after hydration.
  const [preset, setPreset] = React.useState<Preset | undefined>()
  const [copied, copyToClipboard] = Demo.useCopyToClipboard()

  React.useEffect(() => {
    if (hydrated) setPreset(readPreset(window.location.search))
  }, [hydrated])

  const network = preset?.network ?? 'mainnet'
  // Use the testnet the build configures, such as a devnet in devnet builds.
  const chains = useChains()
  const chainId =
    chains.find((chain) => feeTokenNetwork(chain.id) === network)?.id ?? NETWORK_CHAIN_IDS[network]

  const changeNetwork = React.useCallback(
    (value: FeeTokenNetwork) => {
      if (value === preset?.network) return
      // A token belongs to one network, so switching starts the new network without one.
      setPreset({ network: value, token: undefined })
      writePreset(value, undefined)
    },
    [preset?.network],
  )

  const changeToken = React.useCallback(
    (token: Address | undefined) => writePreset(network, token),
    [network],
  )

  return (
    <div {...ui.feeTokenTool()}>
      <div {...ui.feeTokenToolBar()}>
        <SegmentedControl
          aria-label="Choose a network"
          disabled={!preset}
          items={NETWORK_ITEMS}
          value={network}
          onValueChange={changeNetwork}
        />
        <Demo.Button
          type="button"
          variant="default"
          disabled={!preset}
          onClick={() => copyToClipboard(window.location.href)}
        >
          {copied ? (
            <LucideCheck aria-hidden="true" {...ui.feeTokenToolIcon()} />
          ) : (
            <LucideLink aria-hidden="true" {...ui.feeTokenToolIcon()} />
          )}
          {copied ? 'Link copied' : 'Copy link'}
        </Demo.Button>
      </div>
      <p {...ui.feeTokenToolNote()}>
        {network === 'mainnet' ? (
          <>
            Uses <strong>{NETWORK_NAMES.mainnet}</strong> and real funds. The transaction costs a
            fraction of a cent, paid in the stablecoin you choose.
          </>
        ) : (
          <>
            Uses <strong>{NETWORK_NAMES.testnet}</strong>. Get test stablecoins from the{' '}
            <a href="/docs/quickstart/faucet">faucet</a>.
          </>
        )}
      </p>
      <Demo.Container
        key={preset ? `${preset.network}:${preset.token ?? ''}` : 'loading'}
        name={`Set a Fee Token on ${NETWORK_NAMES[network]}`}
        showBadge={false}
        footerVariant={undefined}
      >
        <ConnectWallet stepNumber={1} chainId={chainId} browserWalletsOnly />
        <SetFeeToken
          stepNumber={2}
          chainId={chainId}
          browserWalletsOnly
          initialToken={preset?.token}
          onTokenChange={preset ? changeToken : undefined}
          last
        />
      </Demo.Container>
    </div>
  )
}

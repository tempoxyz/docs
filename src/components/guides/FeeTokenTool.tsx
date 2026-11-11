'use client'

import { useQueries } from '@tanstack/react-query'
import { Button, Field, Select } from '@tempoxyz/ds'
import * as React from 'react'
import { type Address, encodeFunctionData, getAddress, isAddress, isAddressEqual } from 'viem'
import { Abis, Addresses } from 'viem/tempo'
import {
  type Connector,
  type CreateConnectorFn,
  useChains,
  useConfig,
  useConnect,
  useConnection,
  useConnections,
  useConnectors,
  useDisconnect,
  useSendCallsSync,
  useSwitchChain,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Actions, Hooks } from 'wagmi/tempo'
import LucideCheck from '~icons/lucide/check'
import LucideLink from '~icons/lucide/link'
import LucideWalletCards from '~icons/lucide/wallet-cards'
import { sendEvmCall, waitForEvmCall } from '../../lib/evm-wallets'
import { style, vars as tokens } from '../../styles/theme'
import { Container } from '../Container'
import {
  filterSupportedInjectedConnectors,
  isInstalledBrowserWalletConnectorId,
  withoutGenericInjected,
} from '../lib/wallets'
import { TokenLogo } from '../RouteIcons'
import { TextField } from '../RoutesControls'
import { popup } from '../RoutesControls.styles'
import { SegmentedControl } from '../SegmentedControl'
import * as Demo from './Demo'
import {
  type FeeTokenNetwork,
  feeTokenChoices,
  feeTokenLabel,
  feeTokenNetwork,
  feeTokenParam,
  findFeeTokenChoice,
  NETWORK_CHAIN_IDS,
  NETWORK_NAMES,
  parseFeeTokenNetwork,
  resolveFeeTokenPreset,
} from './steps/wallet/fee-token-options'

const CUSTOM = 'custom'
const TEMPO_WALLET_ID = 'xyz.tempo'
const EXPLORERS = {
  mainnet: 'https://explore.tempo.xyz',
  testnet: 'https://explore.testnet.tempo.xyz',
} as const satisfies Record<FeeTokenNetwork, string>
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

/** A wallet the tool can set a fee token with: Tempo Wallet or one the reader installed. */
function isSupportedWallet(connector: Pick<Connector, 'id'>) {
  return connector.id === TEMPO_WALLET_ID || isInstalledBrowserWalletConnectorId(connector.id)
}

type Wallet = {
  key: string
  name: string
  icon: string | undefined
  connector: Connector | CreateConnectorFn
}

/**
 * Tempo Wallet first, then every browser wallet that announces itself through EIP-6963. A wallet
 * that only sets window.ethereum gets wagmi's injected() connector, which connect sets up.
 */
function useWallets(): readonly Wallet[] {
  const connectors = useConnectors()
  const tempoWallet = connectors.find((c) => c.id === TEMPO_WALLET_ID)
  const browser = React.useMemo(
    () =>
      withoutGenericInjected(filterSupportedInjectedConnectors(connectors)).filter((c) =>
        isInstalledBrowserWalletConnectorId(c.id),
      ),
    [connectors],
  )
  // EIP-6963 wallets announce right after load, so wait a moment before offering the fallback.
  const [legacy, setLegacy] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const ethereum = (window as { ethereum?: { isPhantom?: boolean } }).ethereum
      setLegacy(Boolean(ethereum && !ethereum.isPhantom))
    }, 500)
    return () => clearTimeout(timer)
  }, [])
  // Any wallet that announced itself, even one the docs exclude such as Phantom, owns
  // window.ethereum, so the fallback is only for wallets that never announce.
  const announced = connectors.some(
    (c) =>
      c.type === 'injected' && c.id !== 'injected' && isInstalledBrowserWalletConnectorId(c.id),
  )
  // Load each wallet's provider ahead of the click. Tempo Wallet opens a popup, and browsers block
  // popups that open after slow work in the click handler.
  React.useEffect(() => {
    for (const connector of [tempoWallet, ...browser]) void connector?.getProvider().catch(() => {})
  }, [tempoWallet, browser])
  return React.useMemo(() => {
    const list: Wallet[] = [...(tempoWallet ? [tempoWallet] : []), ...browser].map((c) => ({
      key: c.uid,
      name: c.name,
      icon: c.icon,
      connector: c,
    }))
    if (legacy && !announced)
      list.push({
        key: 'injected',
        name: 'Browser wallet',
        icon: undefined,
        connector: injected({ shimDisconnect: true }),
      })
    return list
  }, [tempoWallet, browser, legacy, announced])
}

/** The wallet's own message under wagmi's and viem's wrapping. */
function errorMessage(error: unknown) {
  let inner = error as { shortMessage?: string; message?: string; cause?: unknown; code?: number }
  if (inner?.code === 4001) return undefined
  while (inner?.cause && typeof inner.cause === 'object') {
    inner = inner.cause as typeof inner
    if (inner.code === 4001) return undefined
  }
  return (error as { shortMessage?: string }).shortMessage ?? (error as Error).message
}

/** Sets an account's default fee token from any wallet, on mainnet or testnet. */
export function FeeTokenTool() {
  const hydrated = Demo.useHydrated()
  // A link's choices exist only in the browser, so the tool reads them after hydration.
  const [preset, setPreset] = React.useState<Preset | undefined>()
  React.useEffect(() => {
    if (hydrated) setPreset(readPreset(window.location.search))
  }, [hydrated])
  const network = preset?.network ?? 'mainnet'
  const [copied, copy] = Demo.useCopyToClipboard()
  return (
    <Container
      headerLeft={<span {...title()}>Set a fee token</span>}
      headerRight={
        <div {...headerActions()}>
          <SegmentedControl
            aria-label="Network"
            disabled={!preset}
            items={NETWORK_ITEMS}
            value={network}
            onValueChange={(next) => {
              if (next === network) return
              setPreset({ network: next, token: undefined })
              writePreset(next, undefined)
            }}
          />
          <Button
            type="button"
            size="xsmall"
            variant="secondary"
            disabled={!preset}
            onClick={() => copy(window.location.href)}
          >
            {copied ? <LucideCheck aria-hidden="true" /> : <LucideLink aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      }
    >
      <FeeTokenSteps
        key={preset ? network : 'loading'}
        loaded={Boolean(preset)}
        network={network}
        initialToken={preset?.token}
      />
    </Container>
  )
}

function FeeTokenSteps(props: {
  loaded: boolean
  network: FeeTokenNetwork
  initialToken: Address | undefined
}) {
  const { loaded, network, initialToken } = props
  const config = useConfig()
  const chains = useChains()
  // The testnet the build configures, such as a devnet in devnet builds.
  const chain =
    chains.find((c) => feeTokenNetwork(c.id) === network) ??
    chains.find((c) => c.id === NETWORK_CHAIN_IDS[network])
  const chainId = chain?.id ?? NETWORK_CHAIN_IDS[network]
  const chainKey = `eip155:${chainId}`
  const networkName = NETWORK_NAMES[network]
  const choices = feeTokenChoices(network)

  // Wallet: the current connection when the tool supports it, else any supported one.
  const wallets = useWallets()
  const current = useConnection()
  const connections = useConnections()
  const connection =
    connections.find(
      (c) => c.connector.uid === current.connector?.uid && isSupportedWallet(c.connector),
    ) ?? connections.find((c) => isSupportedWallet(c.connector))
  const connector = connection?.connector
  const isTempoWallet = connector?.id === TEMPO_WALLET_ID
  const address = connection?.accounts[0]
  const onChain = connection?.chainId === chainId
  const disconnect = useDisconnect()
  const switchChain = useSwitchChain()
  const [walletError, setWalletError] = React.useState('')
  const connect = useConnect({
    mutation: {
      onError(error) {
        const message = errorMessage(error)
        setWalletError(message ? `The wallet didn't connect: ${message}` : 'Connection cancelled.')
      },
    },
  })
  const connecting = connect.isPending ? connect.variables?.connector : undefined
  // Called straight from the click, so a wallet popup opens inside the reader's gesture.
  const connectTo = (wallet: Wallet) => {
    setWalletError('')
    // Browser wallets connect first and switch through switchNetwork, which adds the network with
    // the parameters wallets accept. Tempo Wallet signs in on the chosen network.
    const isTempo = 'id' in wallet.connector && wallet.connector.id === TEMPO_WALLET_ID
    connect.connect({ connector: wallet.connector, ...(isTempo ? { chainId } : {}) })
  }
  const switchNetwork = () => {
    if (!connector) return
    setWalletError('')
    switchChain.switchChain(
      {
        chainId,
        connector,
        addEthereumChainParameter: {
          nativeCurrency: { name: 'USD', decimals: 18, symbol: 'USD' },
          blockExplorerUrls: [EXPLORERS[network]],
        },
      },
      { onError: () => setWalletError(`Switch your wallet to ${networkName}, then try again.`) },
    )
  }

  // Token choice
  const initialChoice = findFeeTokenChoice(network, initialToken)
  const [selection, setSelection] = React.useState<string>(() =>
    initialToken ? (initialChoice?.address ?? CUSTOM) : '',
  )
  const [custom, setCustom] = React.useState(() =>
    initialToken && !initialChoice ? initialToken : '',
  )
  const isCustom = selection === CUSTOM
  const customAddress = isAddress(custom.trim(), { strict: false })
    ? getAddress(custom.trim().toLowerCase())
    : undefined
  const pickedToken = isCustom ? customAddress : (selection as Address) || undefined

  // Reads: balances and the fee token come from the network, whatever chain the wallet is on.
  const ready = Boolean(address)
  const balanceTokens = React.useMemo(() => {
    const list: Address[] = choices.map((choice) => choice.address)
    if (customAddress && !findFeeTokenChoice(network, customAddress)) list.push(customAddress)
    return list
  }, [choices, customAddress, network])
  const balances = useQueries({
    queries: balanceTokens.map((token) =>
      Actions.token.getBalance.queryOptions(config, {
        account: address,
        chainId,
        token,
        query: { enabled: ready },
      } as never),
    ),
  })
  const balanceOf = (token: Address | undefined) => {
    if (!token) return undefined
    const index = balanceTokens.findIndex((candidate) => isAddressEqual(candidate, token))
    return balances[index]?.data as { amount: bigint; formatted: string } | null | undefined
  }
  const balancesRead = ready && balances.every((query) => query.isSuccess)
  const userToken = Hooks.fee.useUserToken({
    account: address,
    chainId: chainId as never,
    query: { enabled: ready },
  })
  const feeToken = userToken.data?.address ?? undefined

  // Without a pick, start on the current fee token, else the first stablecoin the account holds.
  const held = balancesRead
    ? choices.find((choice) => (balanceOf(choice.address)?.amount ?? 0n) > 0n)
    : undefined
  const fallback =
    (feeToken && findFeeTokenChoice(network, feeToken)?.address) ??
    held?.address ??
    choices[0].address
  const token = selection ? pickedToken : fallback
  const tokenBalance = balanceOf(token)
  const isCurrent = Boolean(token && feeToken && isAddressEqual(token, feeToken))

  React.useEffect(() => {
    if (loaded) writePreset(network, selection ? pickedToken : undefined)
  }, [loaded, network, selection, pickedToken])

  // Write
  const sendCalls = useSendCallsSync()
  const [pending, setPending] = React.useState(false)
  const [hash, setHash] = React.useState<string>()
  const [sendError, setSendError] = React.useState('')
  React.useEffect(() => {
    setHash(undefined)
    setSendError('')
  }, [address, chainId])
  const submit = async () => {
    if (!token || !address || !connector) return
    setHash(undefined)
    setSendError('')
    setPending(true)
    const call = {
      to: Addresses.feeManager,
      data: encodeFunctionData({
        abi: Abis.feeManager,
        functionName: 'setUserToken',
        args: [token],
      }),
    }
    try {
      if (isTempoWallet) {
        // The docs' wallet config sponsors testnet fees. On mainnet the account pays its own.
        const result = await sendCalls.mutateAsync({
          calls: [call],
          chainId,
          connector,
          ...(network === 'mainnet' ? { capabilities: { feePayer: false } } : {}),
        } as never)
        const sent = result.receipts?.[0]?.transactionHash
        if (result.status !== 'success' || !sent) throw new Error('reverted')
        setHash(sent)
      } else {
        // A standard transaction whose top-level call is `setUserToken` pays its own fee in the
        // token it sets, so the account needs no other stablecoin.
        const sent = await sendEvmCall(config, {
          connector,
          chainId,
          sender: address,
          call: { ...call, value: '0x0' },
          expiresAt: null,
          onHash: setHash,
        })
        await waitForEvmCall(config, chainId, sent)
        setHash(sent)
      }
      void userToken.refetch()
    } catch (e) {
      const code = (e as { code?: number }).code
      setHash(undefined)
      setSendError(code === 4001 ? 'Transaction cancelled.' : 'The transaction failed. Try again.')
    } finally {
      setPending(false)
    }
  }

  const tokenName = token ? feeTokenLabel(network, token) : undefined
  const status = (() => {
    if (sendError) return sendError
    if (!address || !onChain) return undefined
    if (pending) return 'Approve the transaction in your wallet.'
    if (hash || !balancesRead) return undefined
    if (isCustom && !customAddress) return 'Enter a USD stablecoin address.'
    if (isCurrent) return `${tokenName} is already your fee token.`
    if (!tokenBalance || tokenBalance.amount === 0n)
      return `Add ${tokenName ?? 'funds'} to this account first.`
    return undefined
  })()
  const canSubmit = Boolean(
    onChain && token && tokenBalance && tokenBalance.amount > 0n && !isCurrent && !pending,
  )

  const walletActions = (() => {
    if (!loaded) return null
    if (address)
      return (
        <div {...row()}>
          <Demo.Button type="button" variant="default" static>
            <LucideWalletCards aria-hidden="true" {...icon()} />
            {Demo.StringFormatter.truncate(address, { start: 6, end: 4, separator: '⋅⋅⋅' })}
          </Demo.Button>
          <Demo.Button
            type="button"
            variant="destructive"
            onClick={() => connector && disconnect.disconnect({ connector })}
          >
            Disconnect
          </Demo.Button>
        </div>
      )
    return null
  })()

  return (
    <div {...steps()}>
      <Demo.Step
        number={1}
        title={address && onChain ? `Connected to ${networkName}.` : 'Connect a wallet.'}
        active={!address || !onChain}
        completed={Boolean(address && onChain)}
        actions={walletActions}
      >
        {loaded && !address && (
          <div {...stepBody()}>
            {wallets.length === 0 ? (
              <p {...note()}>Install a browser wallet, such as MetaMask or Rabby.</p>
            ) : (
              <div {...walletGrid()}>
                {wallets.map((wallet) => (
                  <Demo.Button
                    key={wallet.key}
                    type="button"
                    variant="default"
                    disabled={connect.isPending}
                    onClick={() => connectTo(wallet)}
                  >
                    {wallet.icon ? (
                      <img src={wallet.icon} alt="" {...walletIcon()} />
                    ) : (
                      <LucideWalletCards aria-hidden="true" {...icon()} />
                    )}
                    {connecting === wallet.connector ? 'Check your wallet…' : wallet.name}
                  </Demo.Button>
                ))}
              </div>
            )}
          </div>
        )}
        {address && !onChain && (
          <div {...stepBody()}>
            <Demo.Button
              type="button"
              variant="accent"
              disabled={switchChain.isPending}
              onClick={switchNetwork}
            >
              Switch to {networkName}
            </Demo.Button>
          </div>
        )}
        {walletError && <p {...cxNote()}>{walletError}</p>}
      </Demo.Step>
      <Demo.Step
        number={2}
        title={hash ? `Fee token set to ${tokenName}.` : 'Choose a stablecoin.'}
        active={Boolean(address && onChain && !hash)}
        completed={Boolean(hash) && !pending}
        actions={
          <Demo.Button
            type="button"
            variant="accent"
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            {pending ? 'Setting…' : 'Set fee token'}
          </Demo.Button>
        }
      >
        <div {...stepBody()}>
          <div {...fields()}>
            <Picker
              id="fee-token-token"
              label="Stablecoin"
              value={isCustom ? CUSTOM : (token ?? '')}
              disabled={!loaded || pending}
              options={[
                ...choices.map((choice) => ({ value: choice.address, label: choice.label })),
                { value: CUSTOM, label: 'Custom address' },
              ]}
              onValueChange={(value) => {
                setSelection(value)
                setHash(undefined)
                setSendError('')
              }}
              logo={(option) =>
                option.value === CUSTOM ? null : (
                  <TokenLogo
                    key={option.value}
                    chainId={chainKey}
                    tokenKey={`${chainKey}/erc20:${option.value}`}
                    symbol={option.label}
                    size={20}
                  />
                )
              }
              suffix={(option) => {
                if (!ready || option.value === CUSTOM) return null
                return balanceOf(option.value as Address)?.formatted ?? null
              }}
            />
            {isCustom && (
              <TextField
                id="fee-token-custom"
                label="Token address"
                placeholder="0x20c0…"
                value={custom}
                disabled={pending}
                onValueChange={setCustom}
              />
            )}
          </div>
          {ready && (
            <dl {...summary()}>
              <div {...summaryRow()}>
                <dt>Current fee token</dt>
                <dd {...summaryValue()}>
                  {userToken.isSuccess
                    ? feeToken
                      ? feeTokenLabel(network, feeToken)
                      : 'Not set'
                    : '…'}
                </dd>
              </div>
              {token && tokenBalance && (
                <div {...summaryRow()}>
                  <dt>Balance</dt>
                  <dd {...summaryValue()}>
                    {tokenBalance.formatted} {tokenName}
                  </dd>
                </div>
              )}
            </dl>
          )}
          {hash && <Demo.ExplorerLink hash={hash} explorerUrl={EXPLORERS[network]} />}
          {status && (
            <p role="status" {...note()}>
              {status}
            </p>
          )}
        </div>
      </Demo.Step>
    </div>
  )
}

type Option = { value: string; label: string }

function Picker(props: {
  id: string
  label: string
  value: string
  disabled: boolean
  options: readonly Option[]
  onValueChange: (value: string) => void
  logo: (option: Option) => React.ReactNode
  suffix?: ((option: Option) => React.ReactNode) | undefined
}) {
  const { id, label, value, disabled, options, onValueChange, logo, suffix } = props
  const items = Object.fromEntries(options.map((option) => [option.value, option.label]))
  const selected = options.find((option) => option.value === value)
  const selectedLogo = selected ? logo(selected) : null
  return (
    <Field.Root {...field()}>
      <Field.Label>{label}</Field.Label>
      <Select.Root
        items={items}
        value={value || null}
        onValueChange={(next) => {
          if (typeof next === 'string' && next !== value) onValueChange(next)
        }}
      >
        <Select.Trigger id={id} disabled={disabled} {...trigger()}>
          {selectedLogo && <span {...logoBox()}>{selectedLogo}</span>}
          <Select.Value placeholder="Choose" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup aria-label={label} {...popup()}>
          {options.map((option) => {
            const optionLogo = logo(option)
            const optionSuffix = suffix?.(option)
            return (
              <Select.Item key={option.value} label={option.label} value={option.value}>
                {optionLogo && <Select.ItemPrefix>{optionLogo}</Select.ItemPrefix>}
                <Select.ItemText>{option.label}</Select.ItemText>
                {optionSuffix && <Select.ItemSuffix>{optionSuffix}</Select.ItemSuffix>}
              </Select.Item>
            )
          })}
        </Select.Popup>
      </Select.Root>
    </Field.Root>
  )
}

const title = style({ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.medium })
const headerActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
const steps = style({ display: 'grid', gap: tokens.spacing['6'] })
const stepBody = style({ marginBlockStart: tokens.spacing['3'] })
const row = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
const walletGrid = style({
  display: 'grid',
  gap: tokens.spacing['2'],
  gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
})
const walletIcon = style({ width: '18px', height: '18px', borderRadius: tokens.radius.sm })
const icon = style({ width: '16px', height: '16px' })
const fields = style({ display: 'grid', gap: tokens.spacing['3'], maxWidth: '24rem' })
const field = style({ display: 'grid', minWidth: 0, gap: tokens.spacing['1_5'] })
const trigger = style({ width: '100%' })
const logoBox = style({ display: 'inline-flex', flexShrink: 0 })
const summary = style({
  display: 'grid',
  gap: tokens.spacing['1_5'],
  maxWidth: '24rem',
  marginBlock: tokens.spacing['4'],
  marginInline: tokens.spacing['0'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
const summaryRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
})
const summaryValue = style({
  margin: tokens.spacing['0'],
  textAlign: 'end',
  color: tokens.color.gray12,
})
const note = style({
  marginBlock: tokens.spacing['2'],
  marginInline: tokens.spacing['0'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
const cxNote = note

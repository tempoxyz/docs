'use client'

import { useQueries } from '@tanstack/react-query'
import { Button, Field, Select, Surface } from '@tempoxyz/ds'
import * as React from 'react'
import { type Address, getAddress, isAddress, isAddressEqual } from 'viem'
import {
  type Connector,
  useChains,
  useConfig,
  useConnect,
  useConnections,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { Actions, Hooks } from 'wagmi/tempo'
import LucideCheck from '~icons/lucide/check'
import LucideLink from '~icons/lucide/link'
import { inherited } from '../../styles/inherited'
import { style, vars as tokens } from '../../styles/theme'
import { Container } from '../Container'
import {
  filterSupportedInjectedConnectors,
  isInstalledBrowserWalletConnectorId,
  withoutGenericInjected,
} from '../lib/wallets'
import { ChainLogo, TokenLogo } from '../RouteIcons'
import { TextField } from '../RoutesControls'
import { popup } from '../RoutesControls.styles'
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
const EXPLORERS = {
  mainnet: 'https://explore.tempo.xyz',
  testnet: 'https://explore.testnet.tempo.xyz',
} as const satisfies Record<FeeTokenNetwork, string>

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
  // A link's choices exist only in the browser, so the tool reads them after hydration.
  const [preset, setPreset] = React.useState<Preset | undefined>()
  React.useEffect(() => {
    if (hydrated) setPreset(readPreset(window.location.search))
  }, [hydrated])
  const network = preset?.network ?? 'mainnet'
  return (
    <FeeTokenForm
      key={preset ? network : 'loading'}
      ready={Boolean(preset)}
      network={network}
      initialToken={preset?.token}
      onNetwork={(next) => {
        if (next === network) return
        setPreset({ network: next, token: undefined })
        writePreset(next, undefined)
      }}
    />
  )
}

function FeeTokenForm(props: {
  ready: boolean
  network: FeeTokenNetwork
  initialToken: Address | undefined
  onNetwork: (network: FeeTokenNetwork) => void
}) {
  const { ready: loaded, network, initialToken, onNetwork } = props
  const config = useConfig()
  const chains = useChains()
  // The testnet the build configures, such as a devnet in devnet builds.
  const chainId =
    chains.find((chain) => feeTokenNetwork(chain.id) === network)?.id ?? NETWORK_CHAIN_IDS[network]
  const chainKey = `eip155:${chainId}`
  const choices = feeTokenChoices(network)

  // Wallet
  const connectors = useConnectors()
  const wallets = React.useMemo(
    () => withoutGenericInjected(filterSupportedInjectedConnectors(connectors)),
    [connectors],
  )
  const connections = useConnections()
  const connection = connections.find((c) => isInstalledBrowserWalletConnectorId(c.connector.id))
  const address = connection?.accounts[0]
  const onChain = connection?.chainId === chainId
  const connect = useConnect()
  const disconnect = useDisconnect()
  const switchChain = useSwitchChain()
  const [walletError, setWalletError] = React.useState('')
  const connectWallet = async (connector: Connector) => {
    setWalletError('')
    try {
      await disconnect.disconnectAsync().catch(() => {})
      await connect.connectAsync({ connector })
    } catch {
      setWalletError('The wallet did not connect. Try again.')
    }
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

  // Reads
  const ready = Boolean(address) && onChain
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
  const current = userToken.data?.address ?? undefined

  // Without a pick, start on the current fee token, else the first stablecoin the account holds.
  const held = balancesRead
    ? choices.find((choice) => (balanceOf(choice.address)?.amount ?? 0n) > 0n)
    : undefined
  const fallback =
    (current && findFeeTokenChoice(network, current)?.address) ??
    held?.address ??
    choices[0].address
  const token = selection ? pickedToken : fallback
  const tokenBalance = balanceOf(token)
  const isCurrent = Boolean(token && current && isAddressEqual(token, current))

  React.useEffect(() => {
    if (loaded) writePreset(network, selection ? pickedToken : undefined)
  }, [loaded, network, selection, pickedToken])

  // Write
  const setUserToken = Hooks.fee.useSetUserTokenSync()
  const [hash, setHash] = React.useState<string>()
  React.useEffect(() => {
    setHash(undefined)
    setUserToken.reset()
  }, [address, chainId])
  const submit = () => {
    if (!token || !address) return
    setHash(undefined)
    // Browser wallets send a standard transaction. Its top-level `setUserToken` call pays its own
    // fee in the token it sets, so the account needs no other stablecoin.
    setUserToken.mutate(
      { token, chainId: chainId as never, account: address },
      {
        onSuccess: (result) => {
          setHash(result.receipt.transactionHash)
          void userToken.refetch()
        },
      },
    )
  }

  const [copied, copy] = Demo.useCopyToClipboard()
  const networkName = NETWORK_NAMES[network]
  const status = (() => {
    if (walletError) return walletError
    if (setUserToken.error) return 'The transaction did not go through. Try again.'
    if (!address || !onChain) return undefined
    if (setUserToken.isPending) return 'Approve the transaction in your wallet.'
    if (hash) return undefined
    if (!balancesRead) return undefined
    if (isCustom && !customAddress) return 'Enter a USD stablecoin address.'
    if (isCurrent) return 'Already your fee token.'
    if (!tokenBalance || tokenBalance.amount === 0n)
      return `Add ${token ? feeTokenLabel(network, token) : 'funds'} to this account first.`
    return undefined
  })()

  const action = (() => {
    if (!loaded)
      return (
        <Demo.Button variant="accent" disabled {...wide()}>
          Set fee token
        </Demo.Button>
      )
    if (!address) {
      if (wallets.length === 0)
        return <p {...note()}>Install a browser wallet, such as MetaMask or Rabby.</p>
      return (
        <div {...walletList()}>
          {wallets.map((wallet) => (
            <Demo.Button
              key={wallet.id}
              type="button"
              variant="accent"
              disabled={connect.isPending}
              onClick={() => void connectWallet(wallet)}
              {...wide()}
            >
              {wallet.icon && <img src={wallet.icon} alt="" {...walletIcon()} />}
              {wallets.length > 1 ? `Connect ${wallet.name}` : 'Connect wallet'}
            </Demo.Button>
          ))}
        </div>
      )
    }
    if (!onChain)
      return (
        <Demo.Button
          type="button"
          variant="accent"
          disabled={switchChain.isPending}
          onClick={() => switchChain.switchChain({ chainId })}
          {...wide()}
        >
          Switch to {networkName}
        </Demo.Button>
      )
    const canSubmit = Boolean(
      token && tokenBalance && tokenBalance.amount > 0n && !isCurrent && !setUserToken.isPending,
    )
    return (
      <Demo.Button
        type="button"
        variant="accent"
        disabled={!canSubmit}
        onClick={submit}
        {...wide()}
      >
        {setUserToken.isPending ? 'Check your wallet…' : 'Set fee token'}
      </Demo.Button>
    )
  })()

  const tokenOptions = [
    ...choices.map((choice) => ({ value: choice.address, label: choice.label })),
    { value: CUSTOM, label: 'Custom address' },
  ]

  return (
    <Container
      headerLeft={<span {...title()}>Set a fee token</span>}
      headerRight={
        <Button
          type="button"
          size="xsmall"
          variant="secondary"
          disabled={!loaded}
          onClick={() => copy(window.location.href)}
        >
          {copied ? <LucideCheck aria-hidden="true" /> : <LucideLink aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      }
      footer={
        address ? (
          <div {...footerRow()}>
            <span {...mono()}>{Demo.StringFormatter.truncate(address, { start: 6, end: 4 })}</span>
            <Button
              type="button"
              size="xsmall"
              variant="secondary"
              onClick={() => disconnect.disconnect()}
            >
              Disconnect
            </Button>
          </div>
        ) : undefined
      }
    >
      <div {...canvas()}>
        <Surface {...card()}>
          <div {...stack()}>
            <Picker
              id="fee-token-network"
              label="Network"
              value={network}
              disabled={!loaded || setUserToken.isPending}
              options={[
                { value: 'mainnet', label: NETWORK_NAMES.mainnet },
                { value: 'testnet', label: NETWORK_NAMES.testnet },
              ]}
              onValueChange={(value) => onNetwork(value as FeeTokenNetwork)}
              logo={(option) => (
                <ChainLogo
                  chainId={`eip155:${option?.value === 'testnet' ? NETWORK_CHAIN_IDS.testnet : NETWORK_CHAIN_IDS.mainnet}`}
                  name={option?.label}
                  size={20}
                />
              )}
            />
            <Picker
              id="fee-token-token"
              label="Stablecoin"
              value={isCustom ? CUSTOM : (token ?? '')}
              disabled={!loaded || setUserToken.isPending}
              options={tokenOptions}
              onValueChange={(value) => {
                setSelection(value)
                setHash(undefined)
              }}
              logo={(option) =>
                option && option.value !== CUSTOM ? (
                  <TokenLogo
                    key={option.value}
                    chainId={chainKey}
                    tokenKey={`${chainKey}/erc20:${option.value}`}
                    symbol={option.label}
                    size={20}
                  />
                ) : null
              }
              suffix={(option) => {
                if (!ready || option.value === CUSTOM) return null
                const balance = balanceOf(option.value as Address)
                return balance ? balance.formatted : null
              }}
            />
            {isCustom && (
              <TextField
                id="fee-token-custom"
                label="Token address"
                placeholder="0x20c0…"
                value={custom}
                disabled={setUserToken.isPending}
                onValueChange={setCustom}
              />
            )}
            {ready && (
              <dl {...summary()}>
                <div {...summaryRow()}>
                  <dt>Current fee token</dt>
                  <dd {...summaryValue()}>
                    {userToken.isSuccess
                      ? current
                        ? feeTokenLabel(network, current)
                        : 'Not set'
                      : '…'}
                  </dd>
                </div>
                {token && tokenBalance && (
                  <div {...summaryRow()}>
                    <dt>Balance</dt>
                    <dd {...summaryValue()}>
                      {tokenBalance.formatted} {feeTokenLabel(network, token)}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {action}
            {hash ? (
              <p role="status" {...success()}>
                Fee token set.{' '}
                <a href={`${EXPLORERS[network]}/tx/${hash}`} target="_blank" rel="noreferrer">
                  View transaction ↗
                </a>
              </p>
            ) : (
              status && (
                <p role="status" {...note()}>
                  {status}
                </p>
              )
            )}
            {network === 'mainnet' ? (
              <p {...fine()}>Uses real funds. Costs a fraction of a cent.</p>
            ) : (
              <p {...fine()}>
                Need test stablecoins? Use the <a href="/docs/quickstart/faucet">faucet</a>.
              </p>
            )}
          </div>
        </Surface>
      </div>
    </Container>
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
  logo: (option: Option | undefined) => React.ReactNode
  suffix?: ((option: Option) => React.ReactNode) | undefined
}) {
  const { id, label, value, disabled, options, onValueChange, logo, suffix } = props
  const items = Object.fromEntries(options.map((option) => [option.value, option.label]))
  const selected = options.find((option) => option.value === value)
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
          {selected && logo(selected) && <span {...logoBox()}>{logo(selected)}</span>}
          <Select.Value placeholder="Choose" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup aria-label={label} {...popup()}>
          {options.map((option) => (
            <Select.Item key={option.value} label={option.label} value={option.value}>
              {logo(option) && <Select.ItemPrefix>{logo(option)}</Select.ItemPrefix>}
              <Select.ItemText>{option.label}</Select.ItemText>
              {suffix?.(option) && <Select.ItemSuffix>{suffix(option)}</Select.ItemSuffix>}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
    </Field.Root>
  )
}

const title = style({ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.medium })
const canvas = style({
  display: 'grid',
  placeItems: 'center',
  borderRadius: tokens.radius.xl,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.line,
  backgroundColor: inherited.color.surfacePanel,
  // design-exception: The dotted grid matches the Routes demo canvas.
  backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px) !custom',
  // design-exception: One grid dot every 14px, matching the Routes demo canvas.
  backgroundSize: '14px 14px !custom',
  paddingBlock: tokens.spacing['8'],
  paddingInline: tokens.spacing['3'],
})
const card = style({ width: '100%', maxWidth: '26rem' })
const stack = style({ display: 'grid', gap: tokens.spacing['5'] })
const field = style({ display: 'grid', minWidth: 0, gap: tokens.spacing['1_5'] })
const trigger = style({ width: '100%' })
const logoBox = style({ display: 'inline-flex', flexShrink: 0 })
const summary = style({
  display: 'grid',
  gap: tokens.spacing['2'],
  margin: tokens.spacing['0'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.line,
  paddingBlockStart: tokens.spacing['3'],
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
  color: inherited.color.textColorPrimary,
})
const wide = style({ width: '100%', justifyContent: 'center' })
const walletList = style({ display: 'grid', gap: tokens.spacing['2'] })
const walletIcon = style({ width: '18px', height: '18px', borderRadius: tokens.radius.sm })
const note = style({
  margin: tokens.spacing['0'],
  textAlign: 'center',
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
const success = style({
  margin: tokens.spacing['0'],
  textAlign: 'center',
  fontSize: tokens.fontSize.compact,
  color: tokens.color.green10,
})
const fine = style({
  margin: tokens.spacing['0'],
  textAlign: 'center',
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray9,
})
const footerRow = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
})
const mono = style({ fontFamily: tokens.fontFamily.code, fontSize: tokens.fontSize.xs })

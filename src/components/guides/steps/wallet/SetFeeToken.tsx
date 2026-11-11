'use client'

import { useQueries } from '@tanstack/react-query'
import * as React from 'react'
import { type Address, getAddress, isAddress, isAddressEqual } from 'viem'
import { tempo } from 'viem/chains'
import { useChainId, useConfig, useConnections } from 'wagmi'
import { Actions, Hooks } from 'wagmi/tempo'
import {
  isBrowserWalletConnectorId,
  isInstalledBrowserWalletConnectorId,
} from '../../../lib/wallets'
import { Button, ExplorerLink, Step } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'
import {
  FEE_TOKEN_FALLBACK_NOTE,
  type FeeTokenChoice,
  feeTokenChoices,
  feeTokenLabel,
  feeTokenNetwork,
  findFeeTokenChoice,
  NETWORK_NAMES,
} from './fee-token-options'
import * as ui from './SetFeeToken.recipes'

const CUSTOM = 'other'

type Selection = Address | typeof CUSTOM

export type SetFeeTokenProps = DemoStepProps & {
  /**
   * The chain the reader must be on, such as Tempo Mainnet on the Fee Tokens page. Without it, the
   * step follows the wallet's Tempo network, as on the testnet faucet.
   */
  chainId?: number | undefined
  /** Act only on a wallet the reader installed, matching \`ConnectWallet\`'s \`browserWalletsOnly\`. */
  browserWalletsOnly?: boolean | undefined
}

export function SetFeeToken(props: SetFeeTokenProps) {
  const { stepNumber = 1, chainId: requiredChainId, browserWalletsOnly = false } = props
  const connections = useConnections()
  // The same connection the connect step shows, so both steps act on one account.
  const walletConnection = connections.find((c) =>
    browserWalletsOnly
      ? isInstalledBrowserWalletConnectorId(c.connector.id)
      : isBrowserWalletConnectorId(c.connector.id),
  )
  const address = walletConnection?.accounts[0]
  const walletChainId = walletConnection?.chainId
  const config = useConfig()
  const configChainId = useChainId()

  const requiredNetwork = feeTokenNetwork(requiredChainId)
  const walletNetwork = feeTokenNetwork(walletChainId)
  const network = requiredNetwork ?? walletNetwork ?? 'testnet'
  // Read from the required chain, else the wallet's Tempo chain, else the docs' default chain.
  const readChainId =
    requiredChainId ?? (walletNetwork ? walletChainId : (configChainId ?? config.chains[0].id))
  // Without a required chain, the wallet must be on a Tempo network.
  const onRequiredNetwork =
    requiredChainId === undefined ? walletNetwork !== undefined : walletChainId === requiredChainId
  const ready = Boolean(address) && onRequiredNetwork
  const choices = feeTokenChoices(network)

  const [selection, setSelection] = React.useState<Selection>(choices[0].address)
  const [customFeeToken, setCustomFeeToken] = React.useState('')
  // Whether the reader picked a token, so the step stops choosing one for them.
  const [touched, setTouched] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState<{ hash: string } | undefined>()

  // A network change keeps a choice only when the new network lists it too.
  const selectedChoice =
    selection === CUSTOM ? undefined : (findFeeTokenChoice(network, selection) ?? choices[0])
  const isCustom = selection === CUSTOM
  const isCustomValid = isAddress(customFeeToken, { strict: false })
  // Accept any letter case, then use the checksummed address for reads and the transaction.
  const customAddress = isCustomValid ? getAddress(customFeeToken.toLowerCase()) : undefined
  const selectedToken: Address | undefined = isCustom ? customAddress : selectedChoice?.address

  const balanceTokens = React.useMemo(() => {
    const tokens: Address[] = choices.map((choice) => choice.address)
    if (isCustom && customAddress && !findFeeTokenChoice(network, customAddress))
      tokens.push(customAddress)
    return tokens
  }, [choices, isCustom, customAddress, network])

  // Same query keys as the demo footer's balances, so its transfer watcher refreshes these too.
  const balanceQueries = useQueries({
    queries: balanceTokens.map((token) =>
      Actions.token.getBalance.queryOptions(config, {
        account: address,
        chainId: readChainId,
        token,
        query: { enabled: ready },
      } as never),
    ),
  })
  const balanceOf = (token: Address | undefined) => {
    if (!token) return undefined
    const index = balanceTokens.findIndex((candidate) => isAddressEqual(candidate, token))
    return balanceQueries[index]?.data as { amount: bigint; formatted: string } | null | undefined
  }

  const userToken = Hooks.fee.useUserToken({
    account: address,
    chainId: readChainId as never,
    query: { enabled: ready },
  })
  const setUserToken = Hooks.fee.useSetUserTokenSync()
  const userTokenAddress = userToken.data?.address ?? undefined
  const hasUserToken = Boolean(userTokenAddress)

  const selectedBalance = balanceOf(selectedToken)
  const hasSelectedBalance = Boolean(selectedBalance && selectedBalance.amount > 0n)
  const hasAnyBalance = balanceTokens.some((token) => {
    const balance = balanceOf(token)
    return Boolean(balance && balance.amount > 0n)
  })
  const balancesLoaded = ready && balanceQueries.every((query) => !query.isPending)
  // A failed read says nothing about the account, so only successful reads drive its status.
  const balancesRead = ready && balanceQueries.every((query) => query.isSuccess)
  const isCurrent = Boolean(
    selectedToken && userTokenAddress && isAddressEqual(selectedToken, userTokenAddress),
  )

  const canSubmit = Boolean(
    ready && selectedToken && hasSelectedBalance && !isCurrent && !setUserToken.isPending,
  )

  // Select the account's current fee token once it loads.
  React.useEffect(() => {
    if (!userTokenAddress) return
    const match = findFeeTokenChoice(network, userTokenAddress)
    if (match) {
      setSelection(match.address)
      setCustomFeeToken('')
    } else {
      setSelection(CUSTOM)
      setCustomFeeToken(userTokenAddress)
    }
  }, [userTokenAddress, network])

  // Without a fee token, start on the first listed stablecoin the account holds.
  React.useEffect(() => {
    if (touched || userTokenAddress || !balancesLoaded || hasSelectedBalance || isCustom) return
    const held = choices.find((choice) => {
      const balance = balanceOf(choice.address)
      return Boolean(balance && balance.amount > 0n)
    })
    if (held) setSelection(held.address)
  })

  // A receipt belongs to the account and network that sent it.
  React.useEffect(() => {
    setConfirmed(undefined)
    setTouched(false)
    setUserToken.reset()
  }, [address, readChainId])

  const handleSetFeeToken = React.useCallback(() => {
    if (!selectedToken || !address || !readChainId) return
    setConfirmed(undefined)
    // Browser wallets send a standard transaction. Its top-level `setUserToken` call pays its own
    // fee in the token it sets, so the wallet needs no other stablecoin to pay for it.
    setUserToken.mutate(
      { token: selectedToken, chainId: readChainId as never, account: address },
      {
        onSuccess: (result) => {
          setConfirmed({ hash: result.receipt.transactionHash })
          userToken.refetch()
          for (const query of balanceQueries) query.refetch()
        },
      },
    )
  }, [address, balanceQueries, readChainId, selectedToken, setUserToken, userToken])

  const active = ready && hasAnyBalance && !hasUserToken
  const completed = ready && hasUserToken
  const networkName = NETWORK_NAMES[network]

  const hint = (() => {
    if (!address) return undefined
    if (!onRequiredNetwork) return `Switch your wallet to ${networkName} to set a fee token.`
    if (setUserToken.isPending) return 'Approve the transaction in your wallet.'
    if (!balancesRead || confirmed) return undefined
    if (!hasAnyBalance)
      return `This account holds none of these stablecoins on ${networkName}. Add funds, then set a fee token.`
    if (isCustom && !isCustomValid) return 'Enter the address of a USD TIP-20 token.'
    if (isCurrent) return 'This is already the account’s fee token.'
    if (!hasSelectedBalance)
      return `This account holds no ${selectedChoice?.label ?? 'balance of this token'}. Choose a stablecoin it holds.`
    return 'The transaction pays its own fee in the stablecoin you choose.'
  })()

  const actions = (
    <div {...ui.setFeeTokenLayout()}>
      <select
        aria-label="Fee token"
        {...ui.select()}
        value={isCustom ? CUSTOM : selectedChoice?.address}
        onChange={(event) => {
          const value = event.target.value as Selection
          setTouched(true)
          setSelection(value)
          if (value !== CUSTOM) setCustomFeeToken('')
        }}
        disabled={!ready || setUserToken.isPending}
      >
        {choices.map((choice) => (
          <option key={choice.address} value={choice.address}>
            {optionLabel(choice, ready ? balanceOf(choice.address) : undefined)}
          </option>
        ))}
        <option value={CUSTOM}>Custom address</option>
      </select>

      <Button
        variant={active ? 'accent' : 'default'}
        onClick={handleSetFeeToken}
        disabled={!canSubmit}
      >
        {setUserToken.isPending ? 'Setting…' : 'Set fee token'}
      </Button>
    </div>
  )

  const showBody = Boolean(address) && (ready || hint)

  return (
    <Step
      active={active}
      completed={completed}
      actions={actions}
      error={setUserToken.error}
      number={stepNumber}
      title="Set your fee token for EVM transactions."
    >
      {showBody && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            {ready && isCustom && (
              <div {...ui.setFeeTokenLayout4()}>
                <label {...form.label()} htmlFor="customFeeToken">
                  Custom fee token address
                </label>
                <input
                  {...ui.setFeeTokenInput()}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  id="customFeeToken"
                  name="customFeeToken"
                  placeholder="0x…"
                  value={customFeeToken}
                  onChange={(event) => setCustomFeeToken(event.target.value.trim())}
                  disabled={setUserToken.isPending}
                />
                {isCustomValid && selectedBalance && (
                  <div {...ui.setFeeTokenLayout5()}>
                    Balance: <span {...ui.setFeeTokenText()}>{selectedBalance.formatted}</span>
                  </div>
                )}
              </div>
            )}
            {ready && userToken.isSuccess && (
              <div {...ui.setFeeTokenLayout5()}>
                Current fee token:{' '}
                <span {...ui.setFeeTokenText()}>
                  {userTokenAddress
                    ? feeTokenLabel(network, userTokenAddress)
                    : FEE_TOKEN_FALLBACK_NOTE}
                </span>
              </div>
            )}
            {hint && <div {...ui.setFeeTokenLayout5()}>{hint}</div>}
            {confirmed && (
              <ExplorerLink
                hash={confirmed.hash}
                explorerUrl={network === 'mainnet' ? tempo.blockExplorers.default.url : undefined}
              />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

function optionLabel(
  choice: FeeTokenChoice,
  balance: { amount: bigint; formatted: string } | null | undefined,
) {
  const name = choice.recommended ? `${choice.label} (recommended)` : choice.label
  if (!balance) return name
  return `${name} · ${formatBalance(balance.formatted)}`
}

const balanceFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })

function formatBalance(formatted: string) {
  const value = Number(formatted)
  if (!Number.isFinite(value)) return formatted
  if (value > 0 && value < 0.0001) return '<0.0001'
  return balanceFormat.format(value)
}

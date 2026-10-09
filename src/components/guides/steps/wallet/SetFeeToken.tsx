'use client'
import * as React from 'react'
import { type Address, isAddress } from 'viem'
import { useChainId, useConfig, useConnections } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { isBrowserWalletConnectorId } from '../../../lib/wallets'
import { Button, ExplorerLink, Step, StringFormatter } from '../../Demo'
import { alphaUsd, betaUsd, thetaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './SetFeeToken.recipes'

type FeeTokenOption =
  | {
      value: 'alpha' | 'beta' | 'theta'
      label: string
      address: Address
    }
  | { value: 'other'; label: string }

const FEE_TOKEN_OPTIONS = [
  { value: 'alpha', label: 'AlphaUSD', address: alphaUsd },
  { value: 'beta', label: 'BetaUSD', address: betaUsd },
  { value: 'theta', label: 'ThetaUSD', address: thetaUsd },
  { value: 'other', label: 'Other (custom)' },
] as const satisfies readonly FeeTokenOption[]

const DEFAULT_FEE_TOKEN_OPTION = FEE_TOKEN_OPTIONS[0]

export function SetFeeToken(props: DemoStepProps) {
  const { stepNumber = 1 } = props
  const connections = useConnections()
  const walletConnection = connections.find((c) => isBrowserWalletConnectorId(c.connector.id))
  const address = walletConnection?.accounts[0]
  const hasNonWebAuthnWallet = Boolean(address)
  const chainId = useChainId()
  const config = useConfig()

  const [selectedFeeToken, setSelectedFeeToken] = React.useState<FeeTokenOption['value']>('alpha')
  const [customFeeToken, setCustomFeeToken] = React.useState('')
  const [txHash, setTxHash] = React.useState<string | undefined>(undefined)

  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })

  const userToken = Hooks.fee.useUserToken({
    account: address,
    query: {
      enabled: Boolean(address),
    },
  })
  const setUserToken = Hooks.fee.useSetUserTokenSync()

  const selectedOption = React.useMemo<FeeTokenOption>(() => {
    const option = FEE_TOKEN_OPTIONS.find((candidate) => candidate.value === selectedFeeToken)
    return option ?? DEFAULT_FEE_TOKEN_OPTION
  }, [selectedFeeToken])

  const resolvedFeeToken =
    selectedOption.value === 'other' ? customFeeToken : selectedOption.address
  const isFeeTokenValid = selectedOption.value !== 'other' || isAddress(customFeeToken)
  const defaultChainId = chainId ?? config?.chains?.[0]?.id

  const hasBalance = Boolean(balance && balance.amount > 0n)
  const hasUserToken = Boolean(userToken.data?.address)

  const canSubmit = Boolean(
    hasNonWebAuthnWallet &&
      hasBalance &&
      resolvedFeeToken &&
      isFeeTokenValid &&
      !setUserToken.isPending,
  )

  const currentFeeTokenLabel = React.useMemo(() => {
    const userTokenAddress = userToken.data?.address ?? undefined
    if (!userTokenAddress) return undefined
    const match = FEE_TOKEN_OPTIONS.find(
      (option) =>
        'address' in option && option.address.toLowerCase() === userTokenAddress.toLowerCase(),
    )
    return match && match.value !== 'other'
      ? match.label
      : StringFormatter.truncate(userTokenAddress, {
          start: 6,
          end: 4,
        })
  }, [userToken.data?.address])

  const handleSetFeeToken = React.useCallback(() => {
    if (!resolvedFeeToken || !isFeeTokenValid || !address) return
    if (!defaultChainId) return

    setTxHash(undefined)
    setUserToken.mutate(
      {
        token: resolvedFeeToken as Address,
        chainId: defaultChainId,
        account: address,
      },
      {
        onSuccess: (result) => {
          setTxHash(result?.receipt.transactionHash)
          userToken.refetch()
        },
        onSettled: (_data, error) => {
          if (error) setTxHash(undefined)
        },
      },
    )
  }, [
    address,
    isFeeTokenValid,
    resolvedFeeToken,
    setUserToken,
    defaultChainId,
    userToken.refetch,
    userToken,
  ])

  // Sync selected option with current user token
  React.useEffect(() => {
    const userTokenAddress = userToken.data?.address ?? undefined
    if (!userTokenAddress) return
    const match = FEE_TOKEN_OPTIONS.find(
      (option) =>
        'address' in option && option.address.toLowerCase() === userTokenAddress.toLowerCase(),
    )
    if (match && match.value !== 'other') {
      setSelectedFeeToken(match.value)
      setCustomFeeToken('')
    } else {
      setSelectedFeeToken('other')
      setCustomFeeToken(userTokenAddress)
    }
  }, [userToken.data?.address])

  const active = hasNonWebAuthnWallet && hasBalance && !hasUserToken
  const completed = hasNonWebAuthnWallet && hasBalance && hasUserToken

  const actions = React.useMemo(() => {
    return (
      <div {...ui.setFeeTokenLayout()}>
        <select
          {...ui.select()}
          value={selectedFeeToken}
          onChange={(event) => {
            const value = event.target.value as FeeTokenOption['value']
            setSelectedFeeToken(value)
            if (value !== 'other') setCustomFeeToken('')
          }}
          disabled={!hasBalance || setUserToken.isPending}
        >
          {FEE_TOKEN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button
          variant={active ? 'accent' : 'default'}
          onClick={handleSetFeeToken}
          disabled={!canSubmit}
        >
          {setUserToken.isPending ? 'Setting...' : 'Set fee token'}
        </Button>
      </div>
    )
  }, [selectedFeeToken, hasBalance, setUserToken.isPending, active, handleSetFeeToken, canSubmit])

  return (
    <Step
      active={active}
      completed={completed}
      actions={actions}
      error={setUserToken.error}
      number={stepNumber}
      title="Set your fee token for EVM transactions."
    >
      {(selectedOption.value === 'other' || currentFeeTokenLabel || txHash) && (
        <div {...ui.setFeeTokenLayout2()}>
          <div {...ui.setFeeTokenLayout3()}>
            {selectedOption.value === 'other' && (
              <div {...ui.setFeeTokenLayout4()}>
                <label {...ui.label()} htmlFor="customFeeToken">
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
                  placeholder="0x..."
                  value={customFeeToken}
                  onChange={(event) => setCustomFeeToken(event.target.value)}
                  disabled={setUserToken.isPending}
                />
              </div>
            )}
            {currentFeeTokenLabel && (
              <div {...ui.setFeeTokenLayout5()}>
                Current fee token: <span {...ui.setFeeTokenText()}>{currentFeeTokenLabel}</span>
              </div>
            )}
            {txHash && <ExplorerLink hash={txHash} />}
          </div>
        </div>
      )}
    </Step>
  )
}

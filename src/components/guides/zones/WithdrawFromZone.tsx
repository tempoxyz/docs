'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { type Hex, parseAbiItem, parseUnits } from 'viem'
import { useConnection, useConnectorClient, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import {
  getZoneRpcHttpUrl,
  getZoneRpcTransportConfig,
  moderatoZoneRpcUrls,
  ZONE_A,
  zoneRpcSyncTimeout,
} from '../../../lib/private-zones.ts'
import { useRootWebAuthnAccount } from '../../../lib/useRootWebAuthnAccount.ts'
import { useZoneAuthorization, type ZoneAuthClientLike } from '../../../lib/useZoneAuthorization.ts'
import { Actions, createClient, Zone, http as zoneHttp } from '../../../lib/zone-sandbox-sdk'
import { Button, ExplorerLink, Logout, Step } from '../Demo'
import { SignInButtons } from '../EmbedPasskeys'
import { ousd } from '../tokens'
import { useStickyStepCompletion } from './useStickyStepCompletion.ts'
import * as ui from './WithdrawFromZone.recipes'

const ZONE_LABEL = 'Zone A'
const ZONE_ID = 6 as const
const AUTHENTICATED_WITHDRAWAL_REVEAL_TO =
  '0x031dc147467e8f106eb22850fef549dc74b8f6634aeac554ebdd4ab896b67cdf68' as const
const WITHDRAWAL_AMOUNT = parseUnits('100', 6)
const ZONE_GAS_BUFFER = parseUnits('1', 6)

const tip20TransferEvent = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

type WithdrawalMode = 'standard' | 'authenticated'

type ZoneClientLike = {
  token: {
    getBalance: (parameters: {
      account: Hex
      token: Hex
    }) => Promise<{ amount: bigint; decimals: number; formatted: string }>
  }
  zone: {
    requestVerifiableWithdrawalSync: (parameters: {
      account: unknown
      amount: bigint
      feeToken: Hex
      revealTo: Hex
      timeout: number
      to: Hex
      token: Hex
    }) => Promise<{ receipt: { blockNumber: bigint; transactionHash: Hex } }>
    requestWithdrawalSync: (parameters: {
      account: unknown
      amount: bigint
      feeToken: Hex
      timeout: number
      to: Hex
      token: Hex
    }) => Promise<{ receipt: { blockNumber: bigint; transactionHash: Hex } }>
    getAuthorizationTokenInfo: ZoneAuthClientLike['zone']['getAuthorizationTokenInfo']
    signAuthorizationToken: ZoneAuthClientLike['zone']['signAuthorizationToken']
    getWithdrawalFee: () => Promise<bigint>
  }
}

export function WithdrawFromZone() {
  const { address } = useConnection()
  const [mode, setMode] = React.useState<WithdrawalMode>('standard')
  const connected = Boolean(address)

  return (
    <>
      <Step
        active={!connected}
        completed={connected}
        actions={connected ? <Logout /> : <SignInButtons />}
        error={undefined}
        number={1}
        title="Create or use a passkey account on the public chain."
      />

      <WithdrawalModeSelector mode={mode} onChange={setMode} />

      {address ? (
        <ConnectedZoneFlow key={address} address={address as Hex} mode={mode} />
      ) : (
        <DisconnectedZoneFlow mode={mode} />
      )}
    </>
  )
}

function ConnectedZoneFlow(props: { address: Hex; mode: WithdrawalMode }) {
  const { address, mode } = props
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { data: connectorClient } = useConnectorClient()
  const { data: rootWebAuthnAccount } = useRootWebAuthnAccount()
  const {
    data: rootBalance,
    isPending: rootBalanceIsPending,
    refetch: refetchRootBalance,
  } = Hooks.token.useGetBalance({
    account: address,
    token: ousd,
  })

  const zoneClient = React.useMemo(
    () =>
      rootWebAuthnAccount
        ? (createClient({
            account: rootWebAuthnAccount,
            chain: Zone.a,
            transport: zoneHttp(
              getZoneRpcHttpUrl(ZONE_ID, moderatoZoneRpcUrls[ZONE_ID]),
              getZoneRpcTransportConfig(ZONE_ID, moderatoZoneRpcUrls[ZONE_ID]),
            ),
          }) as unknown as ZoneClientLike)
        : undefined,
    [rootWebAuthnAccount],
  )

  const zoneAuthorization = useZoneAuthorization({
    address,
    chainId: Zone.a.id,
    zoneId: ZONE_ID,
    queryKey: ['guide-private-zones-withdraw-auth', address, ZONE_ID],
    zoneClient,
  })

  React.useEffect(() => {
    if (!zoneAuthorization.isAuthorized) return

    void queryClient.invalidateQueries({
      queryKey: ['demo-zone-balance', address, ZONE_ID],
    })
  }, [address, queryClient, zoneAuthorization.isAuthorized])

  const withdrawalFeeQuery = useQuery({
    enabled: Boolean(zoneClient && zoneAuthorization.isAuthorized),
    queryKey: ['guide-private-zones-withdraw-fee', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      return zoneClient.zone.getWithdrawalFee()
    },
    staleTime: 30_000,
  })

  const zoneBalanceQuery = useQuery({
    enabled: Boolean(zoneClient && zoneAuthorization.isAuthorized),
    queryKey: ['guide-private-zones-withdraw-zone-balance', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      const { amount } = await zoneClient.token.getBalance({
        account: address,
        token: ousd,
      })
      return amount
    },
    staleTime: 30_000,
  })

  const zoneTopUpTarget =
    withdrawalFeeQuery.data !== undefined
      ? WITHDRAWAL_AMOUNT + withdrawalFeeQuery.data + ZONE_GAS_BUFFER
      : undefined
  const zoneTopUpShortfall =
    zoneTopUpTarget !== undefined &&
    zoneBalanceQuery.data !== undefined &&
    zoneBalanceQuery.data < zoneTopUpTarget
      ? zoneTopUpTarget - zoneBalanceQuery.data
      : 0n
  const hasEnoughZoneBalance = Boolean(
    zoneTopUpTarget !== undefined &&
      zoneBalanceQuery.data !== undefined &&
      zoneBalanceQuery.data >= zoneTopUpTarget,
  )
  const zoneBalanceStepComplete = useStickyStepCompletion(hasEnoughZoneBalance)

  const fundMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')

      await Actions.faucet.fundSync(connectorClient, {
        account: address,
      })
    },
    onSuccess: async () => {
      await refetchRootBalance()
    },
  })

  const topUpMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (zoneTopUpShortfall <= 0n) throw new Error('zone top-up is not required')

      const { receipt } = await Actions.zone.depositSync(connectorClient as never, {
        account: connectorClient.account,
        amount: zoneTopUpShortfall,
        chain: connectorClient.chain as never,
        token: ousd,
        zoneId: ZONE_ID,
      })

      return { receipt }
    },
    onSuccess: async () => {
      await refetchRootBalance()
      await zoneBalanceQuery.refetch()
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!publicClient) throw new Error('public client not ready')
      if (!zoneClient) throw new Error('zone client not ready')
      if (!rootWebAuthnAccount) throw new Error('root account not ready')
      if (withdrawalFeeQuery.data === undefined) throw new Error('withdrawal fee not ready')

      const { amount: currentRootBalance } = await Actions.token.getBalance(
        connectorClient as never,
        {
          account: address,
          token: ousd,
        },
      )
      const { amount: currentZoneBalance } = await zoneClient.token.getBalance({
        account: address,
        token: ousd,
      })
      const anchorBlock = await publicClient.getBlockNumber()
      const receipt =
        mode === 'authenticated'
          ? (
              await zoneClient.zone.requestVerifiableWithdrawalSync({
                account: rootWebAuthnAccount,
                amount: WITHDRAWAL_AMOUNT,
                feeToken: ousd,
                revealTo: AUTHENTICATED_WITHDRAWAL_REVEAL_TO,
                timeout: zoneRpcSyncTimeout,
                to: address,
                token: ousd,
              })
            ).receipt
          : (
              await zoneClient.zone.requestWithdrawalSync({
                account: rootWebAuthnAccount,
                amount: WITHDRAWAL_AMOUNT,
                feeToken: ousd,
                timeout: zoneRpcSyncTimeout,
                to: address,
                token: ousd,
              })
            ).receipt

      return {
        anchorBlock,
        receipt,
        startingRootBalance: currentRootBalance,
        startingZoneBalance: currentZoneBalance,
      }
    },
    onSuccess: async () => {
      await refetchRootBalance()
      await zoneBalanceQuery.refetch()
      await withdrawalConfirmationQuery.refetch()
    },
  })

  React.useEffect(() => {
    withdrawMutation.reset()
  }, [mode])

  const withdrawalConfirmationQuery = useQuery({
    enabled: Boolean(
      publicClient &&
        zoneClient &&
        connectorClient &&
        zoneAuthorization.isAuthorized &&
        withdrawMutation.isSuccess,
    ),
    queryKey: [
      'guide-private-zones-withdraw-confirmation',
      address,
      ZONE_ID,
      withdrawMutation.data?.anchorBlock?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient) throw new Error('public client not ready')
      if (!zoneClient) throw new Error('zone client not ready')
      if (!connectorClient) throw new Error('connector client not ready')
      if (!withdrawMutation.data) throw new Error('withdrawal submission not ready')

      // The anchor is captured before submission; earlier deposits cannot settle this request.
      const fromBlock = withdrawMutation.data.anchorBlock + 1n

      const [currentRootBalance, currentZoneBalance, latest] = await Promise.all([
        Actions.token
          .getBalance(connectorClient as never, {
            account: address,
            token: ousd,
          })
          .then(({ amount }) => amount),
        zoneClient.token
          .getBalance({
            account: address,
            token: ousd,
          })
          .then(({ amount }) => amount),
        publicClient.getBlockNumber(),
      ])

      const logs =
        latest < fromBlock
          ? []
          : await publicClient.getLogs({
              address: ousd,
              args: { from: ZONE_A.portalAddress, to: address },
              event: tip20TransferEvent,
              fromBlock,
              toBlock: latest,
            })

      const settlement = logs.find((log) => log.args.value === WITHDRAWAL_AMOUNT)

      return {
        rootBalance: currentRootBalance,
        txHash: settlement?.transactionHash ?? null,
        zoneBalance: currentZoneBalance,
      }
    },
    refetchInterval: (query) => {
      if (query.state.error) return false

      const txHash = (query.state.data as { txHash: Hex | null } | undefined)?.txHash

      return txHash ? false : 1_500
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const hasRootBalance = Boolean(rootBalance && rootBalance.amount > 0n)
  const settlementTxHash = withdrawalConfirmationQuery.data?.txHash
  const withdrawalConfirmed = Boolean(settlementTxHash)
  const topUpReceipt = topUpMutation.data?.receipt
  const authIsPreparing =
    zoneAuthorization.isChecking || zoneAuthorization.authorizeMutation.isPending
  const stepTwoAction = zoneAuthorization.isAuthorized ? undefined : (
    <Button
      className={ui.connectedZoneFlowButton().className}
      disabled={authIsPreparing || !zoneClient}
      onClick={() => zoneAuthorization.authorizeMutation.mutate()}
      type="button"
      variant={zoneClient ? 'accent' : 'default'}
    >
      {authIsPreparing
        ? `Authorizing ${ZONE_LABEL} reads`
        : zoneAuthorization.authorizeMutation.isError
          ? 'Retry'
          : `Authorize ${ZONE_LABEL} reads`}
    </Button>
  )

  React.useEffect(() => {
    if (!topUpMutation.isSuccess || zoneBalanceStepComplete) return

    const interval = window.setInterval(() => {
      void zoneBalanceQuery.refetch()
    }, 1_500)

    return () => window.clearInterval(interval)
  }, [topUpMutation.isSuccess, zoneBalanceQuery, zoneBalanceStepComplete])

  let stepThreeAction: React.ReactNode
  if (zoneBalanceStepComplete) {
    stepThreeAction = undefined
  } else if (withdrawalFeeQuery.isPending || zoneBalanceQuery.isPending) {
    stepThreeAction = (
      <Button
        className={ui.connectedZoneFlowButton().className}
        disabled
        type="button"
        variant="default"
      >
        Checking balances
      </Button>
    )
  } else if (!hasEnoughZoneBalance && !hasRootBalance) {
    stepThreeAction = (
      <Button
        className={ui.connectedZoneFlowButton().className}
        disabled={fundMutation.isPending || !zoneAuthorization.isAuthorized || rootBalanceIsPending}
        onClick={() => fundMutation.mutate()}
        type="button"
        variant={zoneAuthorization.isAuthorized ? 'accent' : 'default'}
      >
        {fundMutation.isPending ? 'Getting OUSD' : 'Get testnet OUSD'}
      </Button>
    )
  } else if (!hasEnoughZoneBalance) {
    stepThreeAction = (
      <Button
        className={ui.connectedZoneFlowButton().className}
        disabled={topUpMutation.isPending || !zoneAuthorization.isAuthorized}
        onClick={() => topUpMutation.mutate()}
        type="button"
        variant={zoneAuthorization.isAuthorized ? 'accent' : 'default'}
      >
        {topUpMutation.isPending ? 'Approving + topping up Zone A' : 'Approve + top up Zone A'}
      </Button>
    )
  }

  let stepFourAction: React.ReactNode
  if (!zoneBalanceStepComplete) {
    stepFourAction = undefined
  } else {
    stepFourAction = (
      <Button
        className={ui.connectedZoneFlowButton().className}
        disabled={withdrawMutation.isPending || withdrawMutation.isSuccess}
        onClick={() => withdrawMutation.mutate()}
        type="button"
        variant={withdrawMutation.isSuccess ? 'default' : 'accent'}
      >
        {getWithdrawalActionLabel({
          isPending: withdrawMutation.isPending,
          isSuccess: withdrawMutation.isSuccess,
        })}
      </Button>
    )
  }

  return (
    <>
      <Step
        active={!zoneAuthorization.isAuthorized}
        completed={zoneAuthorization.isAuthorized}
        actions={stepTwoAction}
        error={zoneAuthorization.error}
        number={2}
        title={`Authorize private reads in ${ZONE_LABEL}.`}
      />

      <Step
        active={zoneAuthorization.isAuthorized && !zoneBalanceStepComplete}
        completed={zoneBalanceStepComplete}
        actions={stepThreeAction}
        error={
          topUpMutation.error ??
          withdrawalFeeQuery.error ??
          zoneBalanceQuery.error ??
          fundMutation.error
        }
        number={3}
        title={`Make sure ${ZONE_LABEL} has enough OUSD to cover the withdrawal and fee.`}
      >
        {topUpReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={topUpReceipt.blockNumber.toString()} />
            <ExplorerLink hash={topUpReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={zoneBalanceStepComplete && !withdrawMutation.isSuccess}
        completed={withdrawMutation.isSuccess}
        actions={stepFourAction}
        error={withdrawMutation.error}
        number={4}
        title={getWithdrawalSubmitStepTitle(mode)}
      />

      <Step
        active={withdrawMutation.isSuccess && !withdrawalConfirmed}
        completed={withdrawalConfirmed}
        actions={undefined}
        error={withdrawMutation.isSuccess ? withdrawalConfirmationQuery.error : undefined}
        number={5}
        title="Wait for OUSD to settle back to your public balance."
      >
        {settlementTxHash && (
          <StepBody>{settlementTxHash && <ExplorerLink hash={settlementTxHash} />}</StepBody>
        )}
      </Step>
    </>
  )
}

function DisconnectedZoneFlow(props: { mode: WithdrawalMode }) {
  const { mode } = props

  return (
    <>
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={2}
        title={`Authorize private reads in ${ZONE_LABEL}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={3}
        title={`Make sure ${ZONE_LABEL} has enough OUSD to cover the withdrawal and fee.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={4}
        title={getWithdrawalSubmitStepTitle(mode)}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={5}
        title="Wait for OUSD to settle back to your public balance."
      />
    </>
  )
}

function WithdrawalModeSelector(props: {
  mode: WithdrawalMode
  onChange: (mode: WithdrawalMode) => void
}) {
  const { mode, onChange } = props

  return (
    <div {...ui.withdrawalModeSelectorLayout()}>
      <div {...ui.withdrawalModeSelectorLayout2()}>
        <div {...ui.withdrawalModeSelectorLayout3()}>
          <p {...ui.withdrawalModeSelectorDescription()}>Withdrawal mode</p>
          <p {...ui.withdrawalModeSelectorDescription2()}>
            Authenticated withdrawals add sender details encrypted to the reveal key. The
            destination and amount are public in both modes.
          </p>
        </div>
        <div {...ui.withdrawalModeSelectorLayout4()}>
          {[
            ['standard', 'Standard'],
            ['authenticated', 'Authenticated'],
          ].map(([value, label]) => {
            const selected = mode === value

            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                className={[
                  ui.withdrawalModeSelectorButtonState().className,
                  selected
                    ? ui.withdrawalModeSelectorButtonState2().className
                    : ui.withdrawalModeSelectorButtonState3().className,
                ].join(' ')}
                onClick={() => onChange(value as WithdrawalMode)}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepBody(props: React.PropsWithChildren) {
  return (
    <div {...ui.stepBodyLayout()}>
      <div {...ui.stepBodyLayout2()}>
        <div {...ui.stepBodyLayout3()}>{props.children}</div>
      </div>
    </div>
  )
}

function getWithdrawalActionLabel(parameters: { isPending: boolean; isSuccess: boolean }) {
  const { isPending, isSuccess } = parameters

  if (isPending) return 'Withdrawing OUSD'

  if (isSuccess) return 'Withdrawal submitted'

  return 'Withdraw 100 OUSD'
}

function getWithdrawalSubmitStepTitle(mode: WithdrawalMode) {
  return mode === 'authenticated'
    ? `Submit the authenticated withdrawal back from ${ZONE_LABEL}.`
    : `Submit the withdrawal back from ${ZONE_LABEL}.`
}

function DetailLine(props: { label: string; value: string; dataTestId?: string | undefined }) {
  const { dataTestId, label, value } = props

  return (
    <div {...ui.detailLineLayout()}>
      <span {...ui.detailLineText()}>{label}</span>
      <span {...ui.detailLineText2()} data-testid={dataTestId}>
        {value}
      </span>
    </div>
  )
}

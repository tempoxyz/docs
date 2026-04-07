'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { createClient, type Hex, parseAbiItem, parseUnits } from 'viem'
import { Actions, tempoActions } from 'viem/tempo'
import { http as zoneHttp, zoneModerato } from 'viem/tempo/zones'
import { useConnection, useConnectorClient, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import {
  getZoneTransportConfig,
  moderatoZoneRpcUrls,
  stripRpcBasicAuth,
  zoneRpcSyncTimeout,
} from '../../../lib/private-zones.ts'
import { Button, ExplorerLink, Logout, Step } from '../Demo'
import { SignInButtons } from '../EmbedPasskeys'
import { pathUsd } from '../tokens'
import { useStickyStepCompletion } from './useStickyStepCompletion.ts'

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
    getBalance: (parameters: { account: Hex; token: Hex }) => Promise<bigint>
  }
  zone: {
    requestEncryptedWithdrawalSync: (parameters: {
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
    signAuthorizationToken: () => Promise<{
      authentication: {
        expiresAt: number
        zoneId: number
      }
      token: Hex
    }>
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
  const {
    data: rootBalance,
    isPending: rootBalanceIsPending,
    refetch: refetchRootBalance,
  } = Hooks.token.useGetBalance({
    account: address,
    token: pathUsd,
  })

  const zoneClient = React.useMemo(
    () =>
      connectorClient?.account
        ? (createClient({
            account: connectorClient.account,
            chain: zoneModerato(ZONE_ID),
            transport: zoneHttp(
              stripRpcBasicAuth(moderatoZoneRpcUrls[ZONE_ID]),
              getZoneTransportConfig(moderatoZoneRpcUrls[ZONE_ID]),
            ),
          }).extend(tempoActions()) as unknown as ZoneClientLike)
        : undefined,
    [connectorClient],
  )

  const authQuery = useQuery({
    enabled: false,
    queryKey: ['guide-private-zones-withdraw-auth', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      const auth = await zoneClient.zone.signAuthorizationToken()

      return { auth }
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  })

  React.useEffect(() => {
    if (!authQuery.isSuccess) return

    void queryClient.invalidateQueries({
      queryKey: ['demo-zone-balance', address, ZONE_ID],
    })
  }, [address, authQuery.isSuccess, queryClient])

  const withdrawalFeeQuery = useQuery({
    enabled: Boolean(zoneClient && authQuery.isSuccess),
    queryKey: ['guide-private-zones-withdraw-fee', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      return zoneClient.zone.getWithdrawalFee()
    },
    staleTime: 30_000,
  })

  const zoneBalanceQuery = useQuery({
    enabled: Boolean(zoneClient && authQuery.isSuccess),
    queryKey: ['guide-private-zones-withdraw-zone-balance', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      return zoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
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
        token: pathUsd,
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
      if (withdrawalFeeQuery.data === undefined) throw new Error('withdrawal fee not ready')

      const currentRootBalance = await Actions.token.getBalance(connectorClient as never, {
        account: address,
        token: pathUsd,
      })
      const currentZoneBalance = await zoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
      const receipt =
        mode === 'authenticated'
          ? (
              await zoneClient.zone.requestEncryptedWithdrawalSync({
                account: connectorClient.account,
                amount: WITHDRAWAL_AMOUNT,
                feeToken: pathUsd,
                revealTo: AUTHENTICATED_WITHDRAWAL_REVEAL_TO,
                timeout: zoneRpcSyncTimeout,
                to: address,
                token: pathUsd,
              })
            ).receipt
          : (
              await zoneClient.zone.requestWithdrawalSync({
                account: connectorClient.account,
                amount: WITHDRAWAL_AMOUNT,
                feeToken: pathUsd,
                timeout: zoneRpcSyncTimeout,
                to: address,
                token: pathUsd,
              })
            ).receipt
      const anchorBlock = await publicClient.getBlockNumber()

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: switching modes should clear the previous submission state.
  React.useEffect(() => {
    withdrawMutation.reset()
  }, [mode])

  const withdrawalConfirmationQuery = useQuery({
    enabled: Boolean(
      publicClient &&
        zoneClient &&
        connectorClient &&
        authQuery.isSuccess &&
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

      const fromBlock =
        withdrawMutation.data.anchorBlock > 5n ? withdrawMutation.data.anchorBlock - 5n : 0n

      const [currentRootBalance, currentZoneBalance, latest] = await Promise.all([
        Actions.token.getBalance(connectorClient as never, {
          account: address,
          token: pathUsd,
        }),
        zoneClient.token.getBalance({
          account: address,
          token: pathUsd,
        }),
        publicClient.getBlockNumber(),
      ])

      const logs = await publicClient.getLogs({
        address: pathUsd,
        args: { to: address },
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

  const hasRootBalance = Boolean(rootBalance && rootBalance > 0n)
  const settlementTxHash = withdrawalConfirmationQuery.data?.txHash
  const withdrawalConfirmed = Boolean(settlementTxHash)
  const topUpReceipt = topUpMutation.data?.receipt
  const authIsPreparing = authQuery.fetchStatus === 'fetching'
  const stepTwoAction = authQuery.isSuccess ? undefined : (
    <Button
      className="font-normal text-[14px] -tracking-[2%]"
      disabled={authIsPreparing || !zoneClient}
      onClick={() => authQuery.refetch()}
      type="button"
      variant={zoneClient ? 'accent' : 'default'}
    >
      {authIsPreparing
        ? `Authorizing ${ZONE_LABEL} reads`
        : authQuery.isError
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
        className="font-normal text-[14px] -tracking-[2%]"
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
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={fundMutation.isPending || !authQuery.isSuccess || rootBalanceIsPending}
        onClick={() => fundMutation.mutate()}
        type="button"
        variant={authQuery.isSuccess ? 'accent' : 'default'}
      >
        {fundMutation.isPending ? 'Getting pathUSD' : 'Get testnet pathUSD'}
      </Button>
    )
  } else if (!hasEnoughZoneBalance) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={topUpMutation.isPending || !authQuery.isSuccess}
        onClick={() => topUpMutation.mutate()}
        type="button"
        variant={authQuery.isSuccess ? 'accent' : 'default'}
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
        className="font-normal text-[14px] -tracking-[2%]"
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
        active={!authQuery.isSuccess}
        completed={authQuery.isSuccess}
        actions={stepTwoAction}
        error={authQuery.error}
        number={2}
        title={`Authorize private reads in ${ZONE_LABEL}.`}
      />

      <Step
        active={authQuery.isSuccess && !zoneBalanceStepComplete}
        completed={zoneBalanceStepComplete}
        actions={stepThreeAction}
        error={
          topUpMutation.error ??
          withdrawalFeeQuery.error ??
          zoneBalanceQuery.error ??
          fundMutation.error
        }
        number={3}
        title={`Make sure ${ZONE_LABEL} has enough pathUSD to cover the withdrawal and fee.`}
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
        title="Wait for pathUSD to settle back to your public balance."
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The withdrawal request is already accepted in {ZONE_LABEL}. This final step polls your
            public-chain pathUSD balance every 1.5 seconds until the batch settles.
          </p>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            If Tempo-side settlement fails, the amount returns to the fallback recipient in the zone
            and the fee is still consumed.
          </p>
          {settlementTxHash && <ExplorerLink hash={settlementTxHash} />}
        </StepBody>
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
        title={`Make sure ${ZONE_LABEL} has enough pathUSD to cover the withdrawal and fee.`}
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
        title="Wait for pathUSD to settle back to your public balance."
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
    <div className="ms-[42px] rounded-xl border border-gray4 bg-gray2/40 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="max-w-[34rem]">
          <p className="text-[12px] text-gray9 uppercase tracking-[0.12em]">Withdrawal mode</p>
          <p className="mt-1 text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            Standard withdrawals reveal the sender of the withdrawal, while authenticated
            withdrawals only reveal sender details to the holder of the reveal key.
          </p>
        </div>
        <div className="flex shrink-0 self-start rounded-lg border border-gray4 bg-background p-1">
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
                  'rounded-md px-3 py-1.5 font-normal text-[13px] -tracking-[1%] transition-colors',
                  selected ? 'bg-invert text-invert' : 'text-gray10 hover:text-gray12',
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
    <div className="mx-6 pb-4">
      <div className="mt-3 border-gray4 border-s-2 ps-5">
        <div className="flex flex-col gap-2 py-0.5">{props.children}</div>
      </div>
    </div>
  )
}

function getWithdrawalActionLabel(parameters: { isPending: boolean; isSuccess: boolean }) {
  const { isPending, isSuccess } = parameters

  if (isPending) return 'Withdrawing pathUSD'

  if (isSuccess) return 'Withdrawal submitted'

  return 'Withdraw 100 pathUSD'
}

function getWithdrawalSubmitStepTitle(mode: WithdrawalMode) {
  return mode === 'authenticated'
    ? `Submit the authenticated withdrawal back from ${ZONE_LABEL}.`
    : `Submit the withdrawal back from ${ZONE_LABEL}.`
}

function DetailLine(props: { label: string; value: string; dataTestId?: string | undefined }) {
  const { dataTestId, label, value } = props

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] -tracking-[1%]">
      <span className="text-gray9">{label}</span>
      <span className="break-all font-mono text-[12px] text-gray12" data-testid={dataTestId}>
        {value}
      </span>
    </div>
  )
}

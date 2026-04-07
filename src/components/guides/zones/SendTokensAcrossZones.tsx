'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import {
  createClient,
  encodeAbiParameters,
  formatUnits,
  type Hex,
  parseAbiItem,
  parseUnits,
} from 'viem'
import { Actions, tempoActions } from 'viem/tempo'
import { http as zoneHttp, zoneModerato } from 'viem/tempo/zones'
import { useConnection, useConnectorClient, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import {
  getZoneTransportConfig,
  routerCallbackGasLimit,
  stripRpcBasicAuth,
  swapAndDepositRouter,
  ZONE_A,
  ZONE_B,
  zeroBytes32,
  zoneRpcSyncTimeout,
} from '../../../lib/private-zones.ts'
import { Button, ExplorerLink, Login, Logout, Step } from '../Demo'
import { pathUsd } from '../tokens'
import { useStickyStepCompletion } from './useStickyStepCompletion.ts'

const TRANSFER_AMOUNT = parseUnits('25', 6)
const ZONE_GAS_BUFFER = parseUnits('1', 6)

const portalAbi = [
  {
    name: 'calculateDepositFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint128' }],
  },
  {
    name: 'isTokenEnabled',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
] as const

const targetDepositEvent = parseAbiItem(
  'event DepositMade(bytes32 indexed newCurrentDepositQueueHash, address indexed sender, address token, address to, uint128 netAmount, uint128 fee, bytes32 memo)',
)

type ZoneClientLike = {
  token: {
    getBalance: (parameters: { account: Hex; token: Hex }) => Promise<bigint>
  }
  zone: {
    requestWithdrawalSync: (parameters: {
      account: unknown
      amount: bigint
      data?: Hex
      feeToken: Hex
      gas?: bigint
      timeout: number
      to: Hex
      token: Hex
    }) => Promise<{ receipt: { blockNumber: bigint; transactionHash: Hex } }>
    getWithdrawalFee: (parameters?: { gasLimit?: bigint | undefined }) => Promise<bigint>
    signAuthorizationToken: () => Promise<{
      authentication: {
        expiresAt: number
        zoneId: number
      }
      token: Hex
    }>
  }
}

export function SendTokensAcrossZones() {
  const { address } = useConnection()
  const connected = Boolean(address)

  return (
    <>
      <Step
        active={!connected}
        completed={connected}
        actions={connected ? <Logout /> : <Login />}
        error={undefined}
        number={1}
        title="Create or use a passkey account on the public chain."
      />

      {address ? (
        <ConnectedZoneFlow key={address} address={address as Hex} />
      ) : (
        <DisconnectedZoneFlow />
      )}
    </>
  )
}

function ConnectedZoneFlow(props: { address: Hex }) {
  const { address } = props
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

  const sourceZoneClient = React.useMemo(
    () =>
      connectorClient?.account
        ? (createClient({
            account: connectorClient.account,
            chain: zoneModerato(ZONE_A.id),
            transport: zoneHttp(
              stripRpcBasicAuth(ZONE_A.rpcUrl),
              getZoneTransportConfig(ZONE_A.rpcUrl),
            ),
          }).extend(tempoActions()) as unknown as ZoneClientLike)
        : undefined,
    [connectorClient],
  )
  const targetZoneClient = React.useMemo(
    () =>
      connectorClient?.account
        ? (createClient({
            account: connectorClient.account,
            chain: zoneModerato(ZONE_B.id),
            transport: zoneHttp(
              stripRpcBasicAuth(ZONE_B.rpcUrl),
              getZoneTransportConfig(ZONE_B.rpcUrl),
            ),
          }).extend(tempoActions()) as unknown as ZoneClientLike)
        : undefined,
    [connectorClient],
  )

  const sourceFooterQueryKey = React.useMemo(
    () => ['demo-zone-balance', address, ZONE_A.id, pathUsd],
    [address],
  )
  const targetFooterQueryKey = React.useMemo(
    () => ['demo-zone-balance', address, ZONE_B.id, pathUsd],
    [address],
  )

  const sourceAuthQuery = useQuery({
    enabled: false,
    queryKey: ['guide-private-zones-cross-zone-send-source-auth', address, ZONE_A.id],
    queryFn: async () => {
      if (!sourceZoneClient) throw new Error('Zone A client not ready')

      const auth = await sourceZoneClient.zone.signAuthorizationToken()

      return { auth }
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  })

  const sourceZoneBalanceQuery = useQuery({
    enabled: Boolean(sourceZoneClient && sourceAuthQuery.isSuccess),
    queryKey: ['guide-private-zones-cross-zone-send-source-balance', address, ZONE_A.id],
    queryFn: async () => {
      if (!sourceZoneClient) throw new Error('Zone A client not ready')

      return sourceZoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
    },
    staleTime: 30_000,
  })

  const transferPrereqsQuery = useQuery({
    enabled: Boolean(connectorClient && publicClient && sourceAuthQuery.isSuccess),
    queryKey: ['guide-private-zones-cross-zone-send-prereqs', address, ZONE_A.id, ZONE_B.id],
    queryFn: async () => {
      if (!publicClient) throw new Error('public client not ready')
      if (!sourceZoneClient) throw new Error('Zone A client not ready')

      const [routedWithdrawalFee, targetDepositFee, targetTokenEnabled] = await Promise.all([
        sourceZoneClient.zone.getWithdrawalFee({ gasLimit: routerCallbackGasLimit }),
        publicClient.readContract({
          address: ZONE_B.portalAddress,
          abi: portalAbi,
          functionName: 'calculateDepositFee',
        }),
        publicClient.readContract({
          address: ZONE_B.portalAddress,
          abi: portalAbi,
          functionName: 'isTokenEnabled',
          args: [pathUsd],
        }),
      ])

      if (!targetTokenEnabled) {
        throw new Error(`${ZONE_B.label} is not ready for pathUSD deposits yet.`)
      }
      if (TRANSFER_AMOUNT <= targetDepositFee) {
        throw new Error(
          `The ${ZONE_B.label} deposit fee is currently too high for this 25 pathUSD send.`,
        )
      }

      return {
        minimumTargetIncrease: TRANSFER_AMOUNT - targetDepositFee,
        routedWithdrawalFee,
        targetDepositFee,
      }
    },
    staleTime: 30_000,
  })

  const requiredSourceZoneBalance = transferPrereqsQuery.data
    ? TRANSFER_AMOUNT + transferPrereqsQuery.data.routedWithdrawalFee + ZONE_GAS_BUFFER
    : undefined
  const sourceZoneTopUpShortfall =
    requiredSourceZoneBalance !== undefined &&
    sourceZoneBalanceQuery.data !== undefined &&
    sourceZoneBalanceQuery.data < requiredSourceZoneBalance
      ? requiredSourceZoneBalance - sourceZoneBalanceQuery.data
      : 0n
  const hasEnoughSourceZoneBalance = Boolean(
    requiredSourceZoneBalance !== undefined &&
      sourceZoneBalanceQuery.data !== undefined &&
      sourceZoneBalanceQuery.data >= requiredSourceZoneBalance,
  )
  const sourceZoneBalanceStepComplete = useStickyStepCompletion(hasEnoughSourceZoneBalance)

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
      if (sourceZoneTopUpShortfall <= 0n) throw new Error('zone top-up is not required')

      const { receipt } = await Actions.zone.depositSync(connectorClient as never, {
        account: connectorClient.account,
        amount: sourceZoneTopUpShortfall,
        chain: connectorClient.chain as never,
        token: pathUsd,
        zoneId: ZONE_A.id,
      })

      return { receipt }
    },
    onSuccess: async () => {
      await refetchRootBalance()
      await sourceZoneBalanceQuery.refetch()
    },
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!sourceZoneClient) throw new Error('Zone A client not ready')
      if (!publicClient) throw new Error('public client not ready')
      if (!transferPrereqsQuery.data) throw new Error('Send prerequisites are not ready')

      const currentSourceBalance = await sourceZoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
      if (
        requiredSourceZoneBalance === undefined ||
        currentSourceBalance < requiredSourceZoneBalance
      ) {
        throw new Error('Zone A needs more pathUSD before the send can start.')
      }

      const { receipt } = await sourceZoneClient.zone.requestWithdrawalSync({
        account: connectorClient.account,
        amount: TRANSFER_AMOUNT,
        data: encodeRouterCallback(address),
        feeToken: pathUsd,
        gas: routerCallbackGasLimit,
        timeout: zoneRpcSyncTimeout,
        to: swapAndDepositRouter,
        token: pathUsd,
      })

      const anchorBlock = await publicClient.getBlockNumber()

      return {
        anchorBlock,
        minimumTargetIncrease: transferPrereqsQuery.data.minimumTargetIncrease,
        receipt,
        targetDepositFee: transferPrereqsQuery.data.targetDepositFee,
      }
    },
    onSuccess: async () => {
      await sourceZoneBalanceQuery.refetch()
      await queryClient.invalidateQueries({ queryKey: sourceFooterQueryKey })
    },
  })

  const settlementQuery = useQuery({
    enabled: Boolean(
      publicClient && sendMutation.isSuccess && sendMutation.data?.anchorBlock !== undefined,
    ),
    queryKey: [
      'guide-private-zones-cross-zone-send-settlement',
      address,
      sendMutation.data?.anchorBlock?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient) throw new Error('public client not ready')
      if (!sendMutation.data) throw new Error('send submission not ready')

      const fromBlock = sendMutation.data.anchorBlock > 5n ? sendMutation.data.anchorBlock - 5n : 0n
      const latest = await publicClient.getBlockNumber()
      const logs = await publicClient.getLogs({
        address: ZONE_B.portalAddress,
        event: targetDepositEvent,
        fromBlock,
        toBlock: latest,
      })

      const match = logs.find((log) => {
        const sender = log.args.sender
        const token = log.args.token
        const recipient = log.args.to
        const netAmount = log.args.netAmount

        return (
          typeof sender === 'string' &&
          typeof token === 'string' &&
          typeof recipient === 'string' &&
          typeof netAmount === 'bigint' &&
          sender.toLowerCase() === swapAndDepositRouter.toLowerCase() &&
          token.toLowerCase() === pathUsd.toLowerCase() &&
          recipient.toLowerCase() === address.toLowerCase() &&
          netAmount >= sendMutation.data.minimumTargetIncrease
        )
      })

      return match ? { txHash: match.transactionHash } : null
    },
    refetchInterval: (query) => {
      if (query.state.error || query.state.data) return false

      return 2_000
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const targetAuthMutation = useMutation({
    mutationFn: async () => {
      if (!targetZoneClient) throw new Error('Zone B client not ready')

      return targetZoneClient.zone.signAuthorizationToken()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: targetFooterQueryKey })
      await targetZoneBalanceQuery.refetch()
    },
  })

  const targetZoneBalanceQuery = useQuery({
    enabled: Boolean(targetZoneClient && targetAuthMutation.isSuccess && settlementQuery.data),
    queryKey: ['guide-private-zones-cross-zone-send-target-balance', address, ZONE_B.id],
    queryFn: async () => {
      if (!targetZoneClient) throw new Error('Zone B client not ready')

      return targetZoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
    },
    staleTime: 30_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const hasRootBalance = Boolean(rootBalance && rootBalance > 0n)
  const topUpReceipt = topUpMutation.data?.receipt
  const routedSendReceipt = sendMutation.data?.receipt
  const settlementTxHash = settlementQuery.data?.txHash
  const targetBalanceReady = Boolean(
    settlementQuery.data && targetAuthMutation.isSuccess && targetZoneBalanceQuery.isSuccess,
  )
  const sourceAuthIsPreparing = sourceAuthQuery.fetchStatus === 'fetching'
  const stepTwoAction = sourceAuthQuery.isSuccess ? undefined : (
    <Button
      className="font-normal text-[14px] -tracking-[2%]"
      disabled={sourceAuthIsPreparing || !sourceZoneClient}
      onClick={() => sourceAuthQuery.refetch()}
      type="button"
      variant={sourceZoneClient ? 'accent' : 'default'}
    >
      {sourceAuthIsPreparing
        ? `Authorizing ${ZONE_A.label} reads`
        : sourceAuthQuery.isError
          ? 'Retry'
          : `Authorize ${ZONE_A.label} reads`}
    </Button>
  )

  React.useEffect(() => {
    if (!sourceAuthQuery.isSuccess) return

    void queryClient.invalidateQueries({ queryKey: sourceFooterQueryKey })
  }, [queryClient, sourceAuthQuery.isSuccess, sourceFooterQueryKey])

  React.useEffect(() => {
    if (!targetAuthMutation.isSuccess) return

    void queryClient.invalidateQueries({ queryKey: targetFooterQueryKey })
  }, [queryClient, targetAuthMutation.isSuccess, targetFooterQueryKey])

  React.useEffect(() => {
    if (!topUpMutation.isSuccess || sourceZoneBalanceStepComplete) return

    const interval = window.setInterval(() => {
      void sourceZoneBalanceQuery.refetch()
    }, 1_500)

    return () => window.clearInterval(interval)
  }, [sourceZoneBalanceQuery, sourceZoneBalanceStepComplete, topUpMutation.isSuccess])

  let stepThreeAction: React.ReactNode
  if (sourceZoneBalanceStepComplete) {
    stepThreeAction = undefined
  } else if (sourceZoneBalanceQuery.isPending || transferPrereqsQuery.isPending) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled
        type="button"
        variant="default"
      >
        Checking Zone A
      </Button>
    )
  } else if (!hasEnoughSourceZoneBalance && !hasRootBalance) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={fundMutation.isPending || !sourceAuthQuery.isSuccess || rootBalanceIsPending}
        onClick={() => fundMutation.mutate()}
        type="button"
        variant={sourceAuthQuery.isSuccess ? 'accent' : 'default'}
      >
        {fundMutation.isPending ? 'Getting pathUSD' : 'Get testnet pathUSD'}
      </Button>
    )
  } else if (!hasEnoughSourceZoneBalance) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={topUpMutation.isPending || !sourceAuthQuery.isSuccess}
        onClick={() => topUpMutation.mutate()}
        type="button"
        variant={sourceAuthQuery.isSuccess ? 'accent' : 'default'}
      >
        {topUpMutation.isPending ? 'Approving + topping up Zone A' : 'Approve + top up Zone A'}
      </Button>
    )
  }

  let stepFourAction: React.ReactNode
  if (!sourceZoneBalanceStepComplete || transferPrereqsQuery.isPending) {
    stepFourAction = undefined
  } else if (transferPrereqsQuery.isError) {
    stepFourAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={() => transferPrereqsQuery.refetch()}
        type="button"
        variant="default"
      >
        Retry send check
      </Button>
    )
  } else {
    stepFourAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={sendMutation.isPending || sendMutation.isSuccess}
        onClick={() => sendMutation.mutate()}
        type="button"
        variant={sendMutation.isSuccess ? 'default' : 'accent'}
      >
        {sendMutation.isPending
          ? 'Submitting routed send'
          : sendMutation.isSuccess
            ? 'Send submitted'
            : 'Send 25 pathUSD into Zone B'}
      </Button>
    )
  }

  let stepSixAction: React.ReactNode
  if (!settlementQuery.data) {
    stepSixAction = undefined
  } else if (targetZoneBalanceQuery.isError) {
    stepSixAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={() => targetZoneBalanceQuery.refetch()}
        type="button"
        variant="default"
      >
        Retry Zone B read
      </Button>
    )
  } else if (!targetAuthMutation.isSuccess) {
    stepSixAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={targetAuthMutation.isPending}
        onClick={() => targetAuthMutation.mutate()}
        type="button"
        variant="accent"
      >
        {targetAuthMutation.isPending ? 'Authorizing Zone B reads' : 'Authorize Zone B reads'}
      </Button>
    )
  } else if (targetZoneBalanceQuery.isPending) {
    stepSixAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled
        type="button"
        variant="default"
      >
        Reading Zone B pathUSD
      </Button>
    )
  }

  return (
    <>
      <Step
        active={!sourceAuthQuery.isSuccess}
        completed={sourceAuthQuery.isSuccess}
        actions={stepTwoAction}
        error={sourceAuthQuery.error}
        number={2}
        title={`Authorize private reads in ${ZONE_A.label}.`}
      />

      <Step
        active={sourceAuthQuery.isSuccess && !sourceZoneBalanceStepComplete}
        completed={sourceZoneBalanceStepComplete}
        actions={stepThreeAction}
        error={
          topUpMutation.error ??
          sourceZoneBalanceQuery.error ??
          transferPrereqsQuery.error ??
          fundMutation.error
        }
        number={3}
        title={`Make sure ${ZONE_A.label} has enough pathUSD for the send and withdrawal fee.`}
      >
        {topUpReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={topUpReceipt.blockNumber.toString()} />
            <ExplorerLink hash={topUpReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={sourceZoneBalanceStepComplete && !sendMutation.isSuccess}
        completed={sendMutation.isSuccess}
        actions={stepFourAction}
        error={sendMutation.error ?? transferPrereqsQuery.error}
        number={4}
        title={`Withdraw 25 pathUSD from ${ZONE_A.label} and route it into ${ZONE_B.label}.`}
      >
        {routedSendReceipt && sendMutation.data && (
          <StepBody>
            <DetailLine label="Receipt block" value={routedSendReceipt.blockNumber.toString()} />
            <DetailLine
              label={`${ZONE_B.label} deposit fee`}
              value={`${formatUnits(sendMutation.data.targetDepositFee, 6)} pathUSD`}
            />
            <DetailLine
              label={`Expected ${ZONE_B.label} net amount`}
              value={`${formatUnits(sendMutation.data.minimumTargetIncrease, 6)} pathUSD`}
            />
            <ExplorerLink hash={routedSendReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={sendMutation.isSuccess && !settlementQuery.data}
        completed={Boolean(settlementQuery.data)}
        actions={undefined}
        error={sendMutation.isSuccess ? settlementQuery.error : undefined}
        number={5}
        title={`Wait for the routed pathUSD deposit to land in ${ZONE_B.label}.`}
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The funds have already left {ZONE_A.label}. This step polls the public-chain deposit
            into {ZONE_B.label} every 2 seconds while the routed withdrawal is processed.
          </p>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            Because the token stays as pathUSD, the router skips the swap and deposits the same
            asset into {ZONE_B.label}. {ZONE_B.label}'s portal deposit fee is still deducted from
            the arriving amount.
          </p>
          {settlementTxHash && <ExplorerLink hash={settlementTxHash} />}
        </StepBody>
      </Step>

      <Step
        active={Boolean(settlementQuery.data) && !targetBalanceReady}
        completed={targetBalanceReady}
        actions={stepSixAction}
        error={
          targetAuthMutation.error ??
          (settlementQuery.data ? targetZoneBalanceQuery.error : undefined)
        }
        number={6}
        title={`Authorize private reads in ${ZONE_B.label} and confirm the pathUSD balance.`}
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The routed deposit can settle before this page is allowed to read {ZONE_B.label}. Once
            you authorize private reads for this session, the demo fetches your pathUSD balance.
          </p>
        </StepBody>
      </Step>
    </>
  )
}

function DisconnectedZoneFlow() {
  return (
    <>
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={2}
        title={`Authorize private reads in ${ZONE_A.label}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={3}
        title={`Make sure ${ZONE_A.label} has enough pathUSD for the send and withdrawal fee.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={4}
        title={`Withdraw 25 pathUSD from ${ZONE_A.label} and route it into ${ZONE_B.label}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={5}
        title={`Wait for the routed pathUSD deposit to land in ${ZONE_B.label}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={6}
        title={`Authorize private reads in ${ZONE_B.label} and confirm the pathUSD balance.`}
      />
    </>
  )
}

function encodeRouterCallback(recipient: Hex) {
  return encodeAbiParameters(
    [
      { type: 'bool' },
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'bytes32' },
      { type: 'uint128' },
    ],
    [false, pathUsd, ZONE_B.portalAddress, recipient, zeroBytes32, 0n],
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

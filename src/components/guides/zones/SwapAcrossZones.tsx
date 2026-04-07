'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { encodeAbiParameters, type Hex, parseAbiItem, parseUnits } from 'viem'
import { sendTransactionSync } from 'viem/actions'
import { Actions } from 'viem/tempo'
import { useConnection, useConnectorClient, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import {
  getTempoZoneClient,
  getZoneClientParameters,
  moderatoZoneFactory,
  routerCallbackGasLimit,
  stablecoinDex,
  swapAndDepositRouter,
  ZONE_A,
  ZONE_B,
  zeroBytes32,
  zoneOutbox,
  zoneRpcSyncTimeout,
} from '../../../lib/private-zones.ts'
import { Button, ExplorerLink, Logout, Step } from '../Demo'
import { SignInButtons } from '../EmbedPasskeys'
import { betaUsd, pathUsd } from '../tokens'
import { useStickyStepCompletion } from './useStickyStepCompletion.ts'

const SWAP_AMOUNT = parseUnits('25', 6)
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

const routerAbi = [
  {
    name: 'stablecoinDEX',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'zoneFactory',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const

const targetDepositEvent = parseAbiItem(
  'event DepositMade(bytes32 indexed newCurrentDepositQueueHash, address indexed sender, address token, address to, uint128 netAmount, uint128 fee, bytes32 memo)',
)

type ZoneClientLike = {
  token: {
    getAllowance: (parameters: { account: Hex; spender: Hex; token: Hex }) => Promise<bigint>
    getBalance: (parameters: { account: Hex; token: Hex }) => Promise<bigint>
  }
  zone: {
    getWithdrawalFee: (parameters?: { gasLimit?: bigint | undefined }) => Promise<bigint>
    prepareAuthorizationToken: () => Promise<{
      account: Hex
      expiresAt: bigint
    }>
  }
}

type RootChainWithZones = {
  zones?: Record<number, { portalAddress: Hex }>
}

export function SwapAcrossZones() {
  const { address } = useConnection()
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
  const sourceZonePortalAddress = (connectorClient?.chain as RootChainWithZones | undefined)
    ?.zones?.[ZONE_A.id]?.portalAddress
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
      connectorClient
        ? (getTempoZoneClient(
            connectorClient as never,
            getZoneClientParameters(ZONE_A.id, ZONE_A.rpcUrl) as never,
          ) as unknown as ZoneClientLike)
        : undefined,
    [connectorClient],
  )
  const targetZoneClient = React.useMemo(
    () =>
      connectorClient
        ? (getTempoZoneClient(
            connectorClient as never,
            getZoneClientParameters(ZONE_B.id, ZONE_B.rpcUrl) as never,
          ) as unknown as ZoneClientLike)
        : undefined,
    [connectorClient],
  )

  const sourceFooterQueryKey = React.useMemo(
    () => ['demo-zone-balance', address, ZONE_A.id, pathUsd],
    [address],
  )
  const targetFooterQueryKey = React.useMemo(
    () => ['demo-zone-balance', address, ZONE_B.id, betaUsd],
    [address],
  )

  const sourceAuthQuery = useQuery({
    enabled: false,
    queryKey: ['guide-private-zones-swap-source-auth', address, ZONE_A.id],
    queryFn: async () => {
      if (!sourceZoneClient) throw new Error('Zone A client not ready')

      const auth = await sourceZoneClient.zone.prepareAuthorizationToken()

      return { auth }
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  })

  const sourceZoneBalanceQuery = useQuery({
    enabled: Boolean(sourceZoneClient && sourceAuthQuery.isSuccess),
    queryKey: ['guide-private-zones-swap-source-balance', address, ZONE_A.id],
    queryFn: async () => {
      if (!sourceZoneClient) throw new Error('Zone A client not ready')

      return sourceZoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
    },
    staleTime: 30_000,
  })

  const swapPrereqsQuery = useQuery({
    enabled: Boolean(connectorClient && publicClient && sourceAuthQuery.isSuccess),
    queryKey: ['guide-private-zones-swap-prereqs', address, ZONE_A.id, ZONE_B.id],
    queryFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!publicClient) throw new Error('public client not ready')

      const [
        routedWithdrawalFee,
        quotedOutput,
        targetDepositFee,
        targetTokenEnabled,
        routerDex,
        routerFactory,
      ] = await Promise.all([
        sourceZoneClient?.zone.getWithdrawalFee({ gasLimit: routerCallbackGasLimit }),
        Actions.dex.getSellQuote(publicClient as never, {
          amountIn: SWAP_AMOUNT,
          tokenIn: pathUsd,
          tokenOut: betaUsd,
        }),
        publicClient.readContract({
          address: ZONE_B.portalAddress,
          abi: portalAbi,
          functionName: 'calculateDepositFee',
        }),
        publicClient.readContract({
          address: ZONE_B.portalAddress,
          abi: portalAbi,
          functionName: 'isTokenEnabled',
          args: [betaUsd],
        }),
        publicClient.readContract({
          address: swapAndDepositRouter,
          abi: routerAbi,
          functionName: 'stablecoinDEX',
        }),
        publicClient.readContract({
          address: swapAndDepositRouter,
          abi: routerAbi,
          functionName: 'zoneFactory',
        }),
      ])

      if (routedWithdrawalFee === undefined) throw new Error('Zone A withdrawal fee not ready')
      if (routerDex.toLowerCase() !== stablecoinDex.toLowerCase()) {
        throw new Error('The routed swap router is not pointing at the expected StablecoinDEX.')
      }
      if (routerFactory.toLowerCase() !== moderatoZoneFactory.toLowerCase()) {
        throw new Error(
          'The routed swap router is not pointing at the current public-chain ZoneFactory.',
        )
      }
      if (!targetTokenEnabled) {
        throw new Error(`${ZONE_B.label} is not ready for betaUSD deposits yet.`)
      }

      const minimumOutput = applyOnePercentSlippageBuffer(quotedOutput)
      if (minimumOutput <= targetDepositFee) {
        throw new Error(
          `The current pathUSD -> betaUSD quote is too small to cover the ${ZONE_B.label} deposit fee.`,
        )
      }

      return {
        minimumOutput,
        minimumTargetIncrease: minimumOutput - targetDepositFee,
        quotedOutput,
        routedWithdrawalFee,
      }
    },
    staleTime: 30_000,
  })

  const requiredSourceZoneBalance = swapPrereqsQuery.data
    ? SWAP_AMOUNT + swapPrereqsQuery.data.routedWithdrawalFee + ZONE_GAS_BUFFER
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

  const portalAllowanceQuery = useQuery({
    enabled: Boolean(
      connectorClient &&
        sourceZonePortalAddress &&
        sourceAuthQuery.isSuccess &&
        !sourceZoneBalanceStepComplete &&
        sourceZoneTopUpShortfall > 0n,
    ),
    queryKey: [
      'guide-private-zones-swap-portal-allowance',
      address,
      ZONE_A.id,
      sourceZonePortalAddress,
    ],
    queryFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!sourceZonePortalAddress) throw new Error('Zone A portal address not configured')

      return Actions.token.getAllowance(connectorClient as never, {
        account: address,
        spender: sourceZonePortalAddress,
        token: pathUsd,
      })
    },
    staleTime: 30_000,
  })

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
      if (!sourceZonePortalAddress) throw new Error('Zone A portal address not configured')
      if (sourceZoneTopUpShortfall <= 0n) throw new Error('Zone A top-up is not required')

      const includesApproval = !hasPortalAllowance
      const receipt = await sendTransactionSync(
        connectorClient as never,
        {
          account: connectorClient.account,
          calls: [
            ...(includesApproval
              ? [
                  Actions.token.approve.call({
                    amount: sourceZoneTopUpShortfall,
                    spender: sourceZonePortalAddress,
                    token: pathUsd,
                  }),
                ]
              : []),
            Actions.zone.deposit.call({
              account: connectorClient.account,
              amount: sourceZoneTopUpShortfall,
              chain: connectorClient.chain as never,
              token: pathUsd,
              zone: ZONE_A.id,
            } as never),
          ],
          throwOnReceiptRevert: true,
          timeout: 60_000,
        } as never,
      )

      return {
        includesApproval,
        receipt,
      }
    },
    onSuccess: async () => {
      await refetchRootBalance()
      await portalAllowanceQuery.refetch()
      await sourceZoneBalanceQuery.refetch()
      await queryClient.invalidateQueries({ queryKey: sourceFooterQueryKey })
    },
  })

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!sourceZoneClient) throw new Error('Zone A client not ready')
      if (!publicClient) throw new Error('public client not ready')
      if (!swapPrereqsQuery.data) throw new Error('Swap prerequisites are not ready')

      const currentSourceBalance = await sourceZoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
      if (
        requiredSourceZoneBalance === undefined ||
        currentSourceBalance < requiredSourceZoneBalance
      ) {
        throw new Error('Zone A needs more pathUSD before the swap can start.')
      }

      const currentAllowance = await sourceZoneClient.token.getAllowance({
        account: address,
        spender: zoneOutbox,
        token: pathUsd,
      })
      const requiredSourceAllowance = SWAP_AMOUNT + swapPrereqsQuery.data.routedWithdrawalFee
      const includesApproval = currentAllowance < requiredSourceAllowance
      const callbackData = encodeRouterCallback({
        minimumOutput: swapPrereqsQuery.data.minimumOutput,
        recipient: address,
      })

      const receipt = await sendTransactionSync(
        sourceZoneClient as never,
        {
          account: connectorClient.account,
          feeToken: pathUsd,
          calls: [
            ...(includesApproval
              ? [
                  Actions.token.approve.call({
                    amount: requiredSourceAllowance,
                    spender: zoneOutbox,
                    token: pathUsd,
                  }),
                ]
              : []),
            Actions.zone.requestWithdrawal.call({
              account: connectorClient.account,
              amount: SWAP_AMOUNT,
              data: callbackData,
              gasLimit: routerCallbackGasLimit,
              to: swapAndDepositRouter,
              token: pathUsd,
            }),
          ],
          throwOnReceiptRevert: true,
          timeout: zoneRpcSyncTimeout,
        } as never,
      )

      const anchorBlock = await publicClient.getBlockNumber()

      return {
        anchorBlock,
        minimumTargetIncrease: swapPrereqsQuery.data.minimumTargetIncrease,
        receipt,
      }
    },
    onSuccess: async () => {
      await sourceZoneBalanceQuery.refetch()
      await queryClient.invalidateQueries({ queryKey: sourceFooterQueryKey })
    },
  })

  const settlementQuery = useQuery({
    enabled: Boolean(
      publicClient && swapMutation.isSuccess && swapMutation.data?.anchorBlock !== undefined,
    ),
    queryKey: [
      'guide-private-zones-swap-settlement',
      address,
      swapMutation.data?.anchorBlock?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient) throw new Error('public client not ready')
      if (!swapMutation.data) throw new Error('swap submission not ready')

      const fromBlock = swapMutation.data.anchorBlock > 5n ? swapMutation.data.anchorBlock - 5n : 0n
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
          token.toLowerCase() === betaUsd.toLowerCase() &&
          recipient.toLowerCase() === address.toLowerCase() &&
          netAmount >= swapMutation.data.minimumTargetIncrease
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

      return targetZoneClient.zone.prepareAuthorizationToken()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: targetFooterQueryKey })
      await targetZoneBalanceQuery.refetch()
    },
  })

  const targetZoneBalanceQuery = useQuery({
    enabled: Boolean(targetZoneClient && targetAuthMutation.isSuccess && settlementQuery.data),
    queryKey: ['guide-private-zones-swap-target-balance', address, ZONE_B.id],
    queryFn: async () => {
      if (!targetZoneClient) throw new Error('Zone B client not ready')

      return targetZoneClient.token.getBalance({
        account: address,
        token: betaUsd,
      })
    },
    staleTime: 30_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const hasRootBalance = Boolean(rootBalance && rootBalance > 0n)
  const hasPortalAllowance = Boolean(
    portalAllowanceQuery.data !== undefined &&
      portalAllowanceQuery.data >= sourceZoneTopUpShortfall,
  )
  const topUpReceipt = topUpMutation.data?.receipt
  const topUpIncludesApproval = topUpMutation.data?.includesApproval ?? !hasPortalAllowance
  const routedSwapReceipt = swapMutation.data?.receipt
  const settlementTxHash = settlementQuery.data?.txHash
  const targetBalanceReady =
    settlementQuery.data && targetAuthMutation.isSuccess && targetZoneBalanceQuery.isSuccess
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
  } else if (sourceZoneBalanceQuery.isPending || swapPrereqsQuery.isPending) {
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
  } else if (!hasEnoughSourceZoneBalance && portalAllowanceQuery.isError) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={() => portalAllowanceQuery.refetch()}
        type="button"
        variant="default"
      >
        Retry portal check
      </Button>
    )
  } else if (
    !hasEnoughSourceZoneBalance &&
    (portalAllowanceQuery.isPending || portalAllowanceQuery.data === undefined)
  ) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled
        type="button"
        variant="default"
      >
        Checking portal approval
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
        {topUpMutation.isPending
          ? topUpIncludesApproval
            ? 'Approving + topping up Zone A'
            : 'Topping up Zone A'
          : topUpIncludesApproval
            ? 'Approve + top up Zone A'
            : 'Top up Zone A'}
      </Button>
    )
  }

  let stepFourAction: React.ReactNode
  if (!sourceZoneBalanceStepComplete || swapPrereqsQuery.isPending) {
    stepFourAction = undefined
  } else if (swapPrereqsQuery.isError) {
    stepFourAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={() => swapPrereqsQuery.refetch()}
        type="button"
        variant="default"
      >
        Retry swap check
      </Button>
    )
  } else {
    stepFourAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={swapMutation.isPending || swapMutation.isSuccess}
        onClick={() => swapMutation.mutate()}
        type="button"
        variant={swapMutation.isSuccess ? 'default' : 'accent'}
      >
        {swapMutation.isPending
          ? 'Submitting routed swap'
          : swapMutation.isSuccess
            ? 'Swap submitted'
            : 'Swap 25 pathUSD into Zone B betaUSD'}
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
        Reading Zone B betaUSD
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
          portalAllowanceQuery.error ??
          sourceZoneBalanceQuery.error ??
          swapPrereqsQuery.error ??
          fundMutation.error
        }
        number={3}
        title={`Make sure ${ZONE_A.label} has enough pathUSD for the swap and withdrawal fee.`}
      >
        {topUpReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={topUpReceipt.blockNumber.toString()} />
            <ExplorerLink hash={topUpReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={sourceZoneBalanceStepComplete && !swapMutation.isSuccess}
        completed={swapMutation.isSuccess}
        actions={stepFourAction}
        error={swapMutation.error ?? swapPrereqsQuery.error}
        number={4}
        title={`Withdraw 25 pathUSD from ${ZONE_A.label}, swap it, and route betaUSD into ${ZONE_B.label}.`}
      >
        {routedSwapReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={routedSwapReceipt.blockNumber.toString()} />
            <ExplorerLink hash={routedSwapReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={swapMutation.isSuccess && !settlementQuery.data}
        completed={Boolean(settlementQuery.data)}
        actions={undefined}
        error={swapMutation.isSuccess ? settlementQuery.error : undefined}
        number={5}
        title={`Wait for the routed betaUSD deposit to land in ${ZONE_B.label}.`}
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The funds have already left {ZONE_A.label}. This step polls the public-chain deposit
            into {ZONE_B.label} every 2 seconds while the withdrawal, swap, and deposit finish.
          </p>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The final betaUSD amount will be the swap output minus {ZONE_B.label}'s portal deposit
            fee.
          </p>
          {settlementTxHash && <ExplorerLink hash={settlementTxHash} />}
        </StepBody>
      </Step>

      <Step
        active={Boolean(settlementQuery.data) && !targetBalanceReady}
        completed={Boolean(targetBalanceReady)}
        actions={stepSixAction}
        error={
          targetAuthMutation.error ??
          (settlementQuery.data ? targetZoneBalanceQuery.error : undefined)
        }
        number={6}
        title={`Authorize private reads in ${ZONE_B.label} and confirm the betaUSD balance.`}
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The routed deposit can settle before this page is allowed to read {ZONE_B.label}. Once
            you authorize private reads for this session, the demo fetches your betaUSD balance.
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
        title={`Make sure ${ZONE_A.label} has enough pathUSD for the swap and withdrawal fee.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={4}
        title={`Withdraw 25 pathUSD from ${ZONE_A.label}, swap it, and route betaUSD into ${ZONE_B.label}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={5}
        title={`Wait for the routed betaUSD deposit to land in ${ZONE_B.label}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={6}
        title={`Authorize private reads in ${ZONE_B.label} and confirm the betaUSD balance.`}
      />
    </>
  )
}

function encodeRouterCallback(parameters: { minimumOutput: bigint; recipient: Hex }) {
  const { minimumOutput, recipient } = parameters

  return encodeAbiParameters(
    [
      { type: 'bool' },
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'bytes32' },
      { type: 'uint128' },
    ],
    [false, betaUsd, ZONE_B.portalAddress, recipient, zeroBytes32, minimumOutput],
  )
}

function applyOnePercentSlippageBuffer(value: bigint) {
  if (value <= 1n) return value
  return value - value / 100n
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

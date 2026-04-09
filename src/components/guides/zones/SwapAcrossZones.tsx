'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { createClient, encodeAbiParameters, type Hex, parseAbiItem, parseUnits } from 'viem'
import { Actions, tempoActions } from 'viem/tempo'
import { http as zoneHttp, zoneModerato } from 'viem/tempo/zones'
import { useConnection, useConnectorClient, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import {
  getZoneTransportConfig,
  moderatoZoneFactory,
  publicSettlementLookbackBlocks,
  routerCallbackGasLimit,
  stablecoinDex,
  stripRpcBasicAuth,
  swapAndDepositRouter,
  ZONE_A,
  ZONE_B,
  zeroBytes32,
  zoneRpcSyncTimeout,
} from '../../../lib/private-zones.ts'
import { useRootWebAuthnAccount } from '../../../lib/useRootWebAuthnAccount.ts'
import { useZoneAuthorization, type ZoneAuthClientLike } from '../../../lib/useZoneAuthorization.ts'
import { Button, ExplorerLink, Logout, ReceiptHash, Step } from '../Demo'
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
    getAuthorizationTokenInfo: ZoneAuthClientLike['zone']['getAuthorizationTokenInfo']
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
    signAuthorizationToken: ZoneAuthClientLike['zone']['signAuthorizationToken']
  }
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
  const { data: rootWebAuthnAccount } = useRootWebAuthnAccount()
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
      rootWebAuthnAccount
        ? (createClient({
            account: rootWebAuthnAccount,
            chain: zoneModerato(ZONE_A.id),
            transport: zoneHttp(
              stripRpcBasicAuth(ZONE_A.rpcUrl),
              getZoneTransportConfig(ZONE_A.rpcUrl),
            ),
          }).extend(tempoActions()) as unknown as ZoneClientLike)
        : undefined,
    [rootWebAuthnAccount],
  )
  const targetZoneClient = React.useMemo(
    () =>
      rootWebAuthnAccount
        ? (createClient({
            account: rootWebAuthnAccount,
            chain: zoneModerato(ZONE_B.id),
            transport: zoneHttp(
              stripRpcBasicAuth(ZONE_B.rpcUrl),
              getZoneTransportConfig(ZONE_B.rpcUrl),
            ),
          }).extend(tempoActions()) as unknown as ZoneClientLike)
        : undefined,
    [rootWebAuthnAccount],
  )

  const sourceFooterQueryKey = React.useMemo(
    () => ['demo-zone-balance', address, ZONE_A.id, pathUsd],
    [address],
  )
  const targetFooterQueryKey = React.useMemo(
    () => ['demo-zone-balance', address, ZONE_B.id, betaUsd],
    [address],
  )

  const sourceZoneAuthorization = useZoneAuthorization({
    address,
    chainId: ZONE_A.chainId,
    queryKey: ['guide-private-zones-swap-source-auth', address, ZONE_A.id],
    zoneClient: sourceZoneClient,
  })

  const sourceZoneBalanceQuery = useQuery({
    enabled: Boolean(sourceZoneClient && sourceZoneAuthorization.isAuthorized),
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
    enabled: Boolean(connectorClient && publicClient && sourceZoneAuthorization.isAuthorized),
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
        sourceZoneClient?.zone.getWithdrawalFee({
          gasLimit: routerCallbackGasLimit,
        }),
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
      if (sourceZoneTopUpShortfall <= 0n) throw new Error('Zone A top-up is not required')

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
      await queryClient.invalidateQueries({ queryKey: sourceFooterQueryKey })
    },
  })

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!sourceZoneClient) throw new Error('Zone A client not ready')
      if (!publicClient) throw new Error('public client not ready')
      if (!rootWebAuthnAccount) throw new Error('root account not ready')
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

      const callbackData = encodeRouterCallback({
        minimumOutput: swapPrereqsQuery.data.minimumOutput,
        recipient: address,
      })

      const anchorBlock = await publicClient.getBlockNumber()

      const { receipt } = await sourceZoneClient.zone.requestWithdrawalSync({
        account: rootWebAuthnAccount,
        amount: SWAP_AMOUNT,
        data: callbackData,
        feeToken: pathUsd,
        gas: routerCallbackGasLimit,
        timeout: zoneRpcSyncTimeout,
        to: swapAndDepositRouter,
        token: pathUsd,
      })

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

      const fromBlock =
        swapMutation.data.anchorBlock > publicSettlementLookbackBlocks
          ? swapMutation.data.anchorBlock - publicSettlementLookbackBlocks
          : 0n
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

  const targetZoneAuthorization = useZoneAuthorization({
    address,
    chainId: ZONE_B.chainId,
    queryKey: ['guide-private-zones-swap-target-auth', address, ZONE_B.id],
    zoneClient: targetZoneClient,
  })

  const targetZoneBalanceQuery = useQuery({
    enabled: Boolean(
      targetZoneClient && targetZoneAuthorization.isAuthorized && settlementQuery.data,
    ),
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
  const topUpReceipt = topUpMutation.data?.receipt
  const routedSwapReceipt = swapMutation.data?.receipt
  const settlementTxHash = settlementQuery.data?.txHash
  const targetBalanceReady =
    settlementQuery.data && targetZoneAuthorization.isAuthorized && targetZoneBalanceQuery.isSuccess
  const sourceAuthIsPreparing =
    sourceZoneAuthorization.isChecking || sourceZoneAuthorization.authorizeMutation.isPending
  const stepTwoAction = sourceZoneAuthorization.isAuthorized ? undefined : (
    <Button
      className="font-normal text-[14px] -tracking-[2%]"
      disabled={sourceAuthIsPreparing || !sourceZoneClient}
      onClick={() => sourceZoneAuthorization.authorizeMutation.mutate()}
      type="button"
      variant={sourceZoneClient ? 'accent' : 'default'}
    >
      {sourceAuthIsPreparing
        ? `Authorizing ${ZONE_A.label} reads`
        : sourceZoneAuthorization.authorizeMutation.isError
          ? 'Retry'
          : `Authorize ${ZONE_A.label} reads`}
    </Button>
  )

  React.useEffect(() => {
    if (!sourceZoneAuthorization.isAuthorized) return

    void queryClient.invalidateQueries({ queryKey: sourceFooterQueryKey })
  }, [queryClient, sourceFooterQueryKey, sourceZoneAuthorization.isAuthorized])

  React.useEffect(() => {
    if (!targetZoneAuthorization.isAuthorized) return

    void queryClient.invalidateQueries({ queryKey: targetFooterQueryKey })
  }, [queryClient, targetFooterQueryKey, targetZoneAuthorization.isAuthorized])

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
        disabled={
          fundMutation.isPending || !sourceZoneAuthorization.isAuthorized || rootBalanceIsPending
        }
        onClick={() => fundMutation.mutate()}
        type="button"
        variant={sourceZoneAuthorization.isAuthorized ? 'accent' : 'default'}
      >
        {fundMutation.isPending ? 'Getting pathUSD' : 'Get testnet pathUSD'}
      </Button>
    )
  } else if (!hasEnoughSourceZoneBalance) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={topUpMutation.isPending || !sourceZoneAuthorization.isAuthorized}
        onClick={() => topUpMutation.mutate()}
        type="button"
        variant={sourceZoneAuthorization.isAuthorized ? 'accent' : 'default'}
      >
        {topUpMutation.isPending ? 'Approving + topping up Zone A' : 'Approve + top up Zone A'}
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
  } else if (!targetZoneAuthorization.isAuthorized) {
    stepSixAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={targetZoneAuthorization.authorizeMutation.isPending}
        onClick={() => targetZoneAuthorization.authorizeMutation.mutate()}
        type="button"
        variant="accent"
      >
        {targetZoneAuthorization.authorizeMutation.isPending
          ? 'Authorizing Zone B reads'
          : 'Authorize Zone B reads'}
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
        active={!sourceZoneAuthorization.isAuthorized}
        completed={sourceZoneAuthorization.isAuthorized}
        actions={stepTwoAction}
        error={sourceZoneAuthorization.error}
        number={2}
        title={`Authorize private reads in ${ZONE_A.label}.`}
      />

      <Step
        active={sourceZoneAuthorization.isAuthorized && !sourceZoneBalanceStepComplete}
        completed={sourceZoneBalanceStepComplete}
        actions={stepThreeAction}
        error={
          topUpMutation.error ??
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
            <ReceiptHash hash={routedSwapReceipt.transactionHash} />
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
        {settlementTxHash && (
          <StepBody>{settlementTxHash && <ExplorerLink hash={settlementTxHash} />}</StepBody>
        )}
      </Step>

      <Step
        active={Boolean(settlementQuery.data) && !targetBalanceReady}
        completed={Boolean(targetBalanceReady)}
        actions={stepSixAction}
        error={
          targetZoneAuthorization.error ??
          (settlementQuery.data ? targetZoneBalanceQuery.error : undefined)
        }
        number={6}
        title={`Authorize private reads in ${ZONE_B.label} and confirm the betaUSD balance.`}
      />
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

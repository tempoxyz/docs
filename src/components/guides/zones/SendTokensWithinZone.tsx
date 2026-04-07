'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { type Hex, parseUnits } from 'viem'
import { sendTransactionSync } from 'viem/actions'
import { Actions } from 'viem/tempo'
import { useConnection, useConnectorClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { getZoneClient, zoneRpcSyncTimeout } from '../../../lib/viem-zone.ts'
import { Button, ExplorerLink, FAKE_RECIPIENT, Logout, Step } from '../Demo'
import { SignInButtons } from '../EmbedPasskeys'
import { pathUsd } from '../tokens'
import { useStickyStepCompletion } from './useStickyStepCompletion.ts'

const ZONE_LABEL = 'Zone A'
const ZONE_ID = 6 as const
const TRANSFER_AMOUNT = parseUnits('25', 6)
const ZONE_GAS_BUFFER = parseUnits('1', 6)

type ZoneClientLike = {
  token: {
    getBalance: (parameters: { account: Hex; token: Hex }) => Promise<bigint>
  }
  zone: {
    prepareAuthorizationToken: () => Promise<{
      account: Hex
      expiresAt: bigint
    }>
  }
}

type RootChainWithZones = {
  zones?: Record<number, { portalAddress: Hex }>
}

export function SendTokensWithinZone() {
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
  const { data: connectorClient } = useConnectorClient()
  const zonePortalAddress = (connectorClient?.chain as RootChainWithZones | undefined)?.zones?.[
    ZONE_ID
  ]?.portalAddress
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
      connectorClient
        ? (getZoneClient(connectorClient as never, { zone: ZONE_ID }) as unknown as ZoneClientLike)
        : undefined,
    [connectorClient],
  )

  const authQuery = useQuery({
    enabled: false,
    queryKey: ['guide-private-zones-send-auth', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      const auth = await zoneClient.zone.prepareAuthorizationToken()

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

  const zoneBalanceQuery = useQuery({
    enabled: Boolean(zoneClient && authQuery.isSuccess),
    queryKey: ['guide-private-zones-send-zone-balance', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      return zoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
    },
    staleTime: 30_000,
  })

  const requiredZoneBalance = TRANSFER_AMOUNT + ZONE_GAS_BUFFER
  const zoneTopUpShortfall =
    zoneBalanceQuery.data !== undefined && zoneBalanceQuery.data < requiredZoneBalance
      ? requiredZoneBalance - zoneBalanceQuery.data
      : 0n
  const hasEnoughZoneBalance = Boolean(
    zoneBalanceQuery.data !== undefined && zoneBalanceQuery.data >= requiredZoneBalance,
  )
  const zoneBalanceStepComplete = useStickyStepCompletion(hasEnoughZoneBalance)

  const portalAllowanceQuery = useQuery({
    enabled: Boolean(
      connectorClient &&
        zonePortalAddress &&
        authQuery.isSuccess &&
        !zoneBalanceStepComplete &&
        zoneTopUpShortfall > 0n,
    ),
    queryKey: ['guide-private-zones-send-portal-allowance', address, ZONE_ID, zonePortalAddress],
    queryFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!zonePortalAddress) throw new Error('zone portal address not configured')

      return Actions.token.getAllowance(connectorClient as never, {
        account: address,
        spender: zonePortalAddress,
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
      if (!zonePortalAddress) throw new Error('zone portal address not configured')
      if (zoneTopUpShortfall <= 0n) throw new Error('zone top-up is not required')

      const includesApproval = !hasPortalAllowance
      const receipt = await sendTransactionSync(
        connectorClient as never,
        {
          account: connectorClient.account,
          calls: [
            ...(includesApproval
              ? [
                  Actions.token.approve.call({
                    amount: zoneTopUpShortfall,
                    spender: zonePortalAddress,
                    token: pathUsd,
                  }),
                ]
              : []),
            Actions.zone.deposit.call({
              account: connectorClient.account,
              amount: zoneTopUpShortfall,
              chain: connectorClient.chain as never,
              token: pathUsd,
              zone: ZONE_ID,
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
      await zoneBalanceQuery.refetch()
    },
  })

  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!zoneClient) throw new Error('zone client not ready')

      const currentZoneBalance = await zoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
      if (currentZoneBalance < requiredZoneBalance) {
        throw new Error('Zone A needs more pathUSD before sending.')
      }

      const { receipt } = await Actions.token.transferSync(zoneClient as never, {
        account: connectorClient.account,
        amount: TRANSFER_AMOUNT,
        chain: connectorClient.chain as never,
        feeToken: pathUsd,
        timeout: zoneRpcSyncTimeout,
        to: FAKE_RECIPIENT as Hex,
        token: pathUsd,
      })

      return {
        receipt,
        startingZoneBalance: currentZoneBalance,
      }
    },
    onSuccess: async () => {
      await zoneBalanceQuery.refetch()
      await transferConfirmationQuery.refetch()
    },
  })

  const transferConfirmationQuery = useQuery({
    enabled: Boolean(zoneClient && authQuery.isSuccess && transferMutation.isSuccess),
    queryKey: ['guide-private-zones-send-confirmation', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      return zoneClient.token.getBalance({
        account: address,
        token: pathUsd,
      })
    },
    refetchInterval: (query) => {
      if (query.state.error) return false

      const expectedMaxZoneBalance = transferMutation.data?.startingZoneBalance
        ? transferMutation.data.startingZoneBalance - TRANSFER_AMOUNT
        : undefined
      if (expectedMaxZoneBalance === undefined) return false

      const currentZoneBalance = query.state.data as bigint | undefined
      return currentZoneBalance !== undefined && currentZoneBalance <= expectedMaxZoneBalance
        ? false
        : 1_500
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const hasRootBalance = Boolean(rootBalance && rootBalance > 0n)
  const hasPortalAllowance = Boolean(
    portalAllowanceQuery.data !== undefined && portalAllowanceQuery.data >= zoneTopUpShortfall,
  )
  const topUpReceipt = topUpMutation.data?.receipt
  const topUpIncludesApproval = topUpMutation.data?.includesApproval ?? !hasPortalAllowance
  const expectedMaxZoneBalance = transferMutation.data?.startingZoneBalance
    ? transferMutation.data.startingZoneBalance - TRANSFER_AMOUNT
    : undefined
  const transferConfirmed = Boolean(
    expectedMaxZoneBalance !== undefined &&
      transferConfirmationQuery.data !== undefined &&
      transferConfirmationQuery.data <= expectedMaxZoneBalance,
  )
  const transferReceipt = transferMutation.data?.receipt
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
  } else if (zoneBalanceQuery.isPending) {
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
  } else if (!hasEnoughZoneBalance && portalAllowanceQuery.isError) {
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
    !hasEnoughZoneBalance &&
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
  } else if (!hasEnoughZoneBalance) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={topUpMutation.isPending || !authQuery.isSuccess}
        onClick={() => topUpMutation.mutate()}
        type="button"
        variant={authQuery.isSuccess ? 'accent' : 'default'}
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
  if (!zoneBalanceStepComplete) {
    stepFourAction = undefined
  } else {
    stepFourAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={transferMutation.isPending || transferMutation.isSuccess}
        onClick={() => transferMutation.mutate()}
        type="button"
        variant={transferMutation.isSuccess ? 'default' : 'accent'}
      >
        {transferMutation.isPending
          ? 'Sending pathUSD'
          : transferMutation.isSuccess
            ? 'Transfer submitted'
            : 'Send 25 pathUSD'}
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
          portalAllowanceQuery.error ??
          zoneBalanceQuery.error ??
          fundMutation.error
        }
        number={3}
        title={`Make sure ${ZONE_LABEL} has enough pathUSD to cover the transfer and fee.`}
      >
        {topUpReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={topUpReceipt.blockNumber.toString()} />
            <ExplorerLink hash={topUpReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={zoneBalanceStepComplete && !transferMutation.isSuccess}
        completed={transferMutation.isSuccess}
        actions={stepFourAction}
        error={transferMutation.error}
        number={4}
        title={`Send 25 pathUSD from ${ZONE_LABEL} to the demo recipient.`}
      >
        {transferReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={transferReceipt.blockNumber.toString()} />
            <ExplorerLink hash={transferReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={transferMutation.isSuccess && !transferConfirmed}
        completed={transferConfirmed}
        actions={undefined}
        error={transferMutation.isSuccess ? transferConfirmationQuery.error : undefined}
        number={5}
        title={`Wait for ${ZONE_LABEL} to show the updated private balance.`}
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            The transfer is already accepted in {ZONE_LABEL}. This final step polls your private
            balance every 1.5 seconds until the sent amount and fee are reflected.
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
        title={`Authorize private reads in ${ZONE_LABEL}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={3}
        title={`Make sure ${ZONE_LABEL} has enough pathUSD to cover the transfer and fee.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={4}
        title={`Send 25 pathUSD to the demo recipient in ${ZONE_LABEL}.`}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={5}
        title={`Wait for ${ZONE_LABEL} to show the updated private balance.`}
      />
    </>
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

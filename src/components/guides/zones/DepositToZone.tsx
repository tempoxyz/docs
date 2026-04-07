'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { createClient, type Hex, parseAbi, parseUnits } from 'viem'
import { Actions, tempoActions } from 'viem/tempo'
import { http as zoneHttp, zoneModerato } from 'viem/tempo/zones'
import { useConnection, useConnectorClient, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import {
  getZoneTransportConfig,
  moderatoZoneRpcUrls,
  stripRpcBasicAuth,
} from '../../../lib/private-zones.ts'
import { Button, ExplorerLink, Logout, Step } from '../Demo'
import { SignInButtons } from '../EmbedPasskeys'
import { pathUsd } from '../tokens'

const ZONE_LABEL = 'Zone A'
const ZONE_ID = 6 as const
const DEPOSIT_AMOUNT = parseUnits('100', 6)
const zonePortalFeeAbi = parseAbi(['function calculateDepositFee() view returns (uint128)'])

type DepositMode = 'plaintext' | 'encrypted'

type ZoneClientLike = {
  token: {
    getBalance: (parameters: { account: Hex; token: Hex }) => Promise<bigint>
  }
  zone: {
    signAuthorizationToken: () => Promise<{
      authentication: {
        expiresAt: number
        zoneId: number
      }
      token: Hex
    }>
  }
}

type RootChainWithZones = {
  zones?: Record<number, { portalAddress: Hex }>
}

type DepositSetup = {
  depositFee: bigint
}

export function DepositToZone() {
  const { address } = useConnection()
  const [mode, setMode] = React.useState<DepositMode>('plaintext')
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

      <DepositModeSelector mode={mode} onChange={setMode} />

      {address ? (
        <ConnectedZoneFlow address={address as Hex} mode={mode} />
      ) : (
        <DisconnectedZoneFlow mode={mode} />
      )}
    </>
  )
}

function ConnectedZoneFlow(props: { address: Hex; mode: DepositMode }) {
  const { address, mode } = props
  const queryClient = useQueryClient()
  const { data: connectorClient } = useConnectorClient()
  const publicClient = usePublicClient()
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
    queryKey: ['guide-private-zones-auth', address, ZONE_ID],
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

  const depositSetupQuery = useQuery({
    enabled: Boolean(connectorClient && publicClient && zonePortalAddress && authQuery.isSuccess),
    queryKey: ['guide-private-zones-deposit-setup', address, ZONE_ID, zonePortalAddress],
    queryFn: async (): Promise<DepositSetup> => {
      if (!publicClient) throw new Error('public client not ready')
      if (!zonePortalAddress) throw new Error('zone portal address not configured')

      return {
        depositFee: await publicClient.readContract({
          address: zonePortalAddress,
          abi: zonePortalFeeAbi,
          functionName: 'calculateDepositFee',
        }),
      }
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

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!connectorClient) throw new Error('connector client not ready')
      if (!zoneClient) throw new Error('zone client not ready')
      if (!depositSetupQuery.data) throw new Error('deposit setup not ready')

      const startingZoneBalance = await zoneClient.token
        .getBalance({
          account: address,
          token: pathUsd,
        })
        .catch(() => 0n)

      const creditedAmount = getNetZoneDepositAmount(
        DEPOSIT_AMOUNT,
        depositSetupQuery.data.depositFee,
      )

      const receipt =
        mode === 'encrypted'
          ? (
              await Actions.zone.encryptedDepositSync(
                connectorClient as never,
                {
                  account: connectorClient.account,
                  amount: DEPOSIT_AMOUNT,
                  chain: connectorClient.chain as never,
                  timeout: 60_000,
                  token: pathUsd,
                  zoneId: ZONE_ID,
                } as never,
              )
            ).receipt
          : (
              await Actions.zone.depositSync(
                connectorClient as never,
                {
                  account: connectorClient.account,
                  amount: DEPOSIT_AMOUNT,
                  chain: connectorClient.chain as never,
                  token: pathUsd,
                  zoneId: ZONE_ID,
                } as never,
              )
            ).receipt

      return {
        creditedAmount,
        receipt,
        startingZoneBalance,
      }
    },
    onSuccess: async () => {
      await refetchRootBalance()
      await depositSetupQuery.refetch()
      await zoneBalanceQuery.refetch()
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: switching modes should clear the previous submission state.
  React.useEffect(() => {
    depositMutation.reset()
  }, [mode])

  const rootReceipt = depositMutation.data?.receipt
  const targetZoneBalance = depositMutation.data
    ? depositMutation.data.startingZoneBalance + depositMutation.data.creditedAmount
    : undefined

  const zoneBalanceQuery = useQuery({
    enabled: Boolean(zoneClient && authQuery.isSuccess && targetZoneBalance !== undefined),
    queryKey: ['guide-private-zones-zone-balance', address, ZONE_ID],
    queryFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      try {
        return await zoneClient.token.getBalance({
          account: address,
          token: pathUsd,
        })
      } catch {
        return null
      }
    },
    refetchInterval: (query) => {
      if (targetZoneBalance === undefined || query.state.error) return false

      return ((query.state.data as bigint | null | undefined) ?? 0n) >= targetZoneBalance
        ? false
        : 1_500
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const hasRootBalance = Boolean(rootBalance && rootBalance > 0n)
  const zoneDepositProcessed = Boolean(
    targetZoneBalance !== undefined &&
      typeof zoneBalanceQuery.data === 'bigint' &&
      zoneBalanceQuery.data >= targetZoneBalance,
  )
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

  let stepThreeAction: React.ReactNode
  if (!hasRootBalance) {
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
  } else if (depositSetupQuery.isError) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={() => depositSetupQuery.refetch()}
        type="button"
        variant="default"
      >
        Retry deposit checks
      </Button>
    )
  } else if (depositSetupQuery.isPending || depositSetupQuery.data === undefined) {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled
        type="button"
        variant="default"
      >
        Checking deposit setup
      </Button>
    )
  } else {
    stepThreeAction = (
      <Button
        className="font-normal text-[14px] -tracking-[2%]"
        disabled={depositMutation.isPending || !authQuery.isSuccess}
        onClick={() => depositMutation.mutate()}
        type="button"
        variant={authQuery.isSuccess ? 'accent' : 'default'}
      >
        {getDepositActionLabel({ isPending: depositMutation.isPending })}
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
        active={authQuery.isSuccess && !depositMutation.isSuccess}
        completed={depositMutation.isSuccess}
        actions={stepThreeAction}
        error={depositMutation.error ?? depositSetupQuery.error ?? fundMutation.error}
        number={3}
        title={getSubmitStepTitle(mode)}
      >
        {rootReceipt && (
          <StepBody>
            <DetailLine label="Receipt block" value={rootReceipt.blockNumber.toString()} />
            <ExplorerLink hash={rootReceipt.transactionHash} />
          </StepBody>
        )}
      </Step>

      <Step
        active={depositMutation.isSuccess && !zoneDepositProcessed}
        completed={zoneDepositProcessed}
        actions={undefined}
        error={depositMutation.isSuccess ? zoneBalanceQuery.error : undefined}
        number={4}
        title={getConfirmationStepTitle(mode)}
      >
        <StepBody>
          <p className="text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            Your public-chain deposit is already submitted. This last step polls the private{' '}
            {ZONE_LABEL} balance every 1.5 seconds until the post-fee amount appears.
          </p>
        </StepBody>
      </Step>
    </>
  )
}

function DisconnectedZoneFlow(props: { mode: DepositMode }) {
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
        title={getSubmitStepTitle(mode)}
      />
      <Step
        active={false}
        completed={false}
        actions={undefined}
        error={undefined}
        number={4}
        title={getConfirmationStepTitle(mode)}
      />
    </>
  )
}

function DepositModeSelector(props: { mode: DepositMode; onChange: (mode: DepositMode) => void }) {
  const { mode, onChange } = props

  return (
    <div className="ms-[42px] rounded-xl border border-gray4 bg-gray2/40 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="max-w-[34rem]">
          <p className="text-[12px] text-gray9 uppercase tracking-[0.12em]">Deposit mode</p>
          <p className="mt-1 text-[13px] text-gray10 leading-relaxed -tracking-[1%]">
            Plaintext reveals both the recipient and memo of the deposit, while encrypted only lets
            the sequencer see those details.
          </p>
        </div>
        <div className="flex shrink-0 self-start rounded-lg border border-gray4 bg-background p-1">
          {[
            ['plaintext', 'Plaintext'],
            ['encrypted', 'Encrypted'],
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
                onClick={() => onChange(value as DepositMode)}
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

function getDepositActionLabel(parameters: { isPending: boolean }) {
  return parameters.isPending ? 'Depositing pathUSD' : 'Deposit 100 pathUSD'
}

function getSubmitStepTitle(mode: DepositMode) {
  return mode === 'encrypted'
    ? `Fund and submit the encrypted deposit for 100 pathUSD into ${ZONE_LABEL}.`
    : `Fund and submit the deposit for 100 pathUSD into ${ZONE_LABEL}.`
}

function getConfirmationStepTitle(mode: DepositMode) {
  return mode === 'encrypted'
    ? `Wait for ${ZONE_LABEL} to credit the encrypted deposit.`
    : `Wait for ${ZONE_LABEL} to credit the deposit.`
}

function getNetZoneDepositAmount(amount: bigint, depositFee: bigint) {
  if (depositFee > amount) {
    throw new Error(
      `Zone portal deposit fee ${depositFee.toString()} is greater than deposit amount ${amount.toString()}.`,
    )
  }

  return amount - depositFee
}

'use client'

import { useMutation } from '@tanstack/react-query'
import { VirtualAddress } from 'ox/tempo'
import * as React from 'react'
import {
  type Address,
  type Chain,
  type Client,
  createClient,
  createPublicClient,
  createWalletClient,
  formatUnits,
  type Hex,
  http,
  parseUnits,
  type Transport,
  zeroAddress,
} from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { tempoDevnet, tempoLocalnet, tempoModerato } from 'viem/chains'
import { Abis, Actions, tempoActions, withFeePayer } from 'viem/tempo'
import { Button, ExplorerAccountLink, ExplorerLink, Step, StringFormatter } from './Demo'
import { alphaUsd, pathUsd } from './tokens'

const TEST_MNEMONIC = 'test test test test test test test test test test test junk'
const VIRTUAL_REGISTRY_ADDRESS = '0xfDC0000000000000000000000000000000000000' as const
const DEMO_USER_TAG = '0x000000000001' as const
const DEVNET_SPONSOR_URL = 'https://sponsor.devnet.tempo.xyz' as const
const MODERATO_SPONSOR_URL = 'https://sponsor.moderato.tempo.xyz' as const
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as const
const PREMINED_DEMO_MASTER_SALT =
  '0x00000000000000000000000000000000000000000000000000000000a559642c' as const
const PREMINED_DEMO_MASTER_ID = '0xb385a519' as const
const PREMINED_DEMO_REGISTRATION_HASH =
  '0x00000000b385a5196cd77effb51c3c46f09634f47dc1ecd4cbef7acb61ec404b' as const

function normalizeUserTag(value: string): Hex | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null

  const withoutPrefix = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed
  if (!/^[0-9a-f]{1,12}$/.test(withoutPrefix)) return null

  return `0x${withoutPrefix.padStart(12, '0')}` as Hex
}

type RegistrationResult = {
  masterAddress: Address
  masterId: Hex
  registrationHash: Hex
  salt: Hex
  txHash?: Hex
  virtualAddress: Address
}

type SendResult = {
  after: {
    master: string
    virtual: string
  }
  before: {
    master: string
    virtual: string
  }
  events: Array<{
    amount: string
    from: Address
    to: Address
  }>
  sender: Address
  txHash: Hex
}

export function VirtualAddressesFastDemo() {
  const tempoEnv = import.meta.env.VITE_TEMPO_ENV
  const isLocalnet = tempoEnv === 'localnet'
  const isDevnet = tempoEnv === 'devnet'
  const isModerato = !isLocalnet && !isDevnet
  const isPublicTestnet = isDevnet || isModerato
  const isSupported = isLocalnet || isPublicTestnet
  const hasExplorerLink = isModerato || Boolean(import.meta.env.VITE_EXPLORER_OVERRIDE)

  const [registration, setRegistration] = React.useState<RegistrationResult | null>(null)
  const [sendResult, setSendResult] = React.useState<SendResult | null>(null)
  const [userTagInput, setUserTagInput] = React.useState<string>(DEMO_USER_TAG)

  const demoAdmin = React.useMemo(() => mnemonicToAccount(TEST_MNEMONIC), [])
  const demoMaster = React.useMemo(() => mnemonicToAccount(TEST_MNEMONIC, { addressIndex: 1 }), [])
  const demoSender = React.useMemo(() => mnemonicToAccount(TEST_MNEMONIC, { addressIndex: 2 }), [])

  const runtimeChain = React.useMemo(
    () => (isLocalnet ? tempoLocalnet : isDevnet ? tempoDevnet : tempoModerato),
    [isDevnet, isLocalnet],
  )

  const publicClient = React.useMemo(() => {
    if (!runtimeChain) return null

    return createPublicClient({
      chain: runtimeChain,
      transport: isLocalnet ? http() : http(runtimeChain.rpcUrls.default.http[0]),
    })
  }, [isLocalnet, runtimeChain])

  const demoAdminClient = React.useMemo(() => {
    if (!isLocalnet) return null

    return createClient({
      account: demoAdmin,
      chain: tempoLocalnet,
      transport: http(),
    }).extend(tempoActions())
  }, [demoAdmin, isLocalnet])

  const demoMasterWalletClient = React.useMemo(() => {
    if (!runtimeChain) return null

    return createWalletClient({
      account: demoMaster,
      chain: runtimeChain,
      transport: isLocalnet
        ? http()
        : withFeePayer(
            http(runtimeChain.rpcUrls.default.http[0]),
            http(isDevnet ? DEVNET_SPONSOR_URL : MODERATO_SPONSOR_URL),
          ),
    })
  }, [demoMaster, isDevnet, isLocalnet, runtimeChain])

  const demoSenderClient = React.useMemo(() => {
    if (!runtimeChain) return null

    return createClient({
      account: demoSender,
      chain: runtimeChain,
      transport: isLocalnet
        ? http()
        : withFeePayer(
            http(runtimeChain.rpcUrls.default.http[0]),
            http(isDevnet ? DEVNET_SPONSOR_URL : MODERATO_SPONSOR_URL),
          ),
    }).extend(tempoActions())
  }, [demoSender, isDevnet, isLocalnet, runtimeChain])

  const baseRegistration = React.useMemo(
    (): RegistrationResult => ({
      masterAddress: demoMaster.address,
      masterId: PREMINED_DEMO_MASTER_ID,
      registrationHash: PREMINED_DEMO_REGISTRATION_HASH,
      salt: PREMINED_DEMO_MASTER_SALT,
      virtualAddress: VirtualAddress.from({
        masterId: PREMINED_DEMO_MASTER_ID,
        userTag: DEMO_USER_TAG,
      }),
    }),
    [demoMaster.address],
  )

  const normalizedUserTag = React.useMemo(() => normalizeUserTag(userTagInput), [userTagInput])

  const customVirtualAddress = React.useMemo(() => {
    if (!registration || !normalizedUserTag) return null

    return VirtualAddress.from({
      masterId: registration.masterId,
      userTag: normalizedUserTag,
    })
  }, [normalizedUserTag, registration])

  const getTokenBalance = React.useCallback(
    async (target: Address, token: Address): Promise<bigint> => {
      if (!publicClient) throw new Error('Runtime client unavailable.')

      return (await publicClient.readContract({
        address: token,
        abi: Abis.tip20,
        functionName: 'balanceOf',
        args: [target],
      })) as bigint
    },
    [publicClient],
  )

  const waitForTokenBalance = React.useCallback(
    async (target: Address, token: Address, timeoutMs = 120_000) => {
      const startedAt = Date.now()

      while (Date.now() - startedAt < timeoutMs) {
        if ((await getTokenBalance(target, token)) > 0n) return
        await new Promise((resolve) => setTimeout(resolve, 1_500))
      }

      throw new Error(`Timed out waiting for faucet funds for ${token}.`)
    },
    [getTokenBalance],
  )

  const ensureAccountFunded = React.useCallback(
    async (target: Address, requiredTokens: Address[]) => {
      if (!publicClient) return

      if (isLocalnet) {
        if (!demoAdminClient) return

        const adminClient = demoAdminClient as unknown as Client<Transport, Chain>

        await publicClient
          .request({
            method: 'tempo_fundAddress' as never,
            params: [target] as never,
          })
          .catch(() => {})

        if (requiredTokens.includes(alphaUsd)) {
          await Actions.token.transferSync(adminClient, {
            account: demoAdmin,
            amount: parseUnits('1000', 6),
            chain: tempoLocalnet,
            to: target,
            token: alphaUsd,
          })
        }
        return
      }

      if (!demoSenderClient) throw new Error('Runtime clients unavailable.')
      if (requiredTokens.length === 0) return

      const balances = await Promise.all(
        requiredTokens.map((token) => getTokenBalance(target, token)),
      )
      if (balances.every((balance) => balance > 0n)) return

      await Actions.faucet.fund(demoSenderClient as unknown as Client<Transport, Chain>, {
        account: target,
      })
      await Promise.all(requiredTokens.map((token) => waitForTokenBalance(target, token)))
    },
    [
      demoAdmin,
      demoAdminClient,
      demoSenderClient,
      getTokenBalance,
      isLocalnet,
      publicClient,
      waitForTokenBalance,
    ],
  )

  const registerMutation = useMutation({
    mutationFn: async (): Promise<RegistrationResult> => {
      if (!isSupported) throw new Error('This live demo is available on Tempo testnet or localnet.')
      if (!publicClient || !demoMasterWalletClient) throw new Error('Runtime clients unavailable.')

      await ensureAccountFunded(demoMaster.address, isPublicTestnet ? [] : [alphaUsd])

      const registeredMaster = (await publicClient.readContract({
        address: VIRTUAL_REGISTRY_ADDRESS,
        abi: Abis.addressRegistry,
        functionName: 'getMaster',
        args: [PREMINED_DEMO_MASTER_ID],
      })) as Address

      if (registeredMaster.toLowerCase() === demoMaster.address.toLowerCase())
        return baseRegistration
      if (registeredMaster.toLowerCase() !== zeroAddress)
        throw new Error(
          'The pre-mined demo master id is already registered to a different address.',
        )

      const txHash = await demoMasterWalletClient.writeContract({
        address: VIRTUAL_REGISTRY_ADDRESS,
        abi: Abis.addressRegistry,
        functionName: 'registerVirtualMaster',
        args: [PREMINED_DEMO_MASTER_SALT],
        ...(isPublicTestnet ? { feePayer: true } : {}),
      })

      await publicClient.waitForTransactionReceipt({ hash: txHash })

      return {
        ...baseRegistration,
        txHash,
      }
    },
    onSuccess: (result) => {
      setRegistration(result)
      setSendResult(null)
    },
  })

  const sendMutation = useMutation({
    mutationFn: async (): Promise<SendResult> => {
      if (!isSupported) throw new Error('This live demo is available on Tempo testnet or localnet.')
      if (!registration) throw new Error('Prepare the demo master first.')
      if (!customVirtualAddress)
        throw new Error('Enter a valid user tag to derive a virtual address.')
      if (!demoSenderClient || !publicClient) throw new Error('Runtime clients unavailable.')

      const decimals = Number(
        await publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'decimals',
        }),
      )
      const amount = parseUnits('100', decimals)

      await ensureAccountFunded(demoSender.address, isLocalnet ? [alphaUsd] : [pathUsd])

      if (isLocalnet) {
        if (!demoAdminClient) throw new Error('Localnet admin client unavailable.')

        const adminClient = demoAdminClient as unknown as Client<Transport, Chain>

        await Actions.token.mint(adminClient, {
          account: demoAdmin,
          amount,
          chain: tempoLocalnet,
          to: demoSender.address,
          token: pathUsd,
        })
      }

      const [masterBefore, virtualBefore] = await Promise.all([
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [registration.masterAddress],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [customVirtualAddress],
        }) as Promise<bigint>,
      ])

      const { receipt } = await demoSenderClient.token.transferSync({
        amount,
        ...(isPublicTestnet ? { feePayer: true } : {}),
        to: customVirtualAddress,
        token: pathUsd,
      })

      const [masterAfter, virtualAfter] = await Promise.all([
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [registration.masterAddress],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [customVirtualAddress],
        }) as Promise<bigint>,
      ])

      return {
        after: {
          master: formatUnits(masterAfter, decimals),
          virtual: formatUnits(virtualAfter, decimals),
        },
        before: {
          master: formatUnits(masterBefore, decimals),
          virtual: formatUnits(virtualBefore, decimals),
        },
        events: receipt.logs
          .filter(
            (log) =>
              log.address.toLowerCase() === pathUsd.toLowerCase() &&
              log.topics[0] === TRANSFER_TOPIC,
          )
          .map((log) => ({
            amount: formatUnits(BigInt(log.data), decimals),
            from: `0x${log.topics[1]?.slice(26) ?? ''}` as Address,
            to: `0x${log.topics[2]?.slice(26) ?? ''}` as Address,
          })),
        sender: demoSender.address,
        txHash: receipt.transactionHash,
      }
    },
    onSuccess: (result) => setSendResult(result),
  })

  const tokenSymbol = 'pathUSD'

  return (
    <div className="space-y-4">
      <Step
        active={!registration}
        actions={
          <Button
            className="font-normal text-[14px] -tracking-[2%]"
            disabled={!isSupported || registerMutation.isPending}
            onClick={() => registerMutation.mutate()}
            type="button"
            variant={isSupported ? 'accent' : 'default'}
          >
            {registerMutation.isPending ? 'Preparing demo master…' : 'Prepare demo master'}
          </Button>
        }
        completed={Boolean(registration)}
        error={registerMutation.error}
        number={1}
        title="Use a docs-managed master with a pre-mined valid salt."
      >
        <div className="mx-6 border-gray4 border-s-2 ps-5 pb-4">
          {!isSupported ? (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Run docs against Tempo testnet or localnet to use this live preview.
            </div>
          ) : registration ? (
            <div className="mt-2 grid gap-2 text-[13px] text-gray9 -tracking-[1%]">
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">master wallet:</span>
                <code className="min-w-0 break-all font-mono text-[12px] text-primary">
                  {registration.masterAddress}
                </code>
              </div>
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">masterId:</span>
                <code className="font-mono text-primary">{registration.masterId}</code>
              </div>
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">pre-mined salt:</span>
                <code className="min-w-0 break-all font-mono text-[12px] text-primary">
                  {registration.salt}
                </code>
              </div>
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">virtual address:</span>
                <div>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-[11px] text-gray9 -tracking-[1%]"
                        htmlFor="virtualAddressUserTag"
                      >
                        Customize the trailing user tag to derive a different virtual address
                      </label>
                      <input
                        className="h-[34px] rounded-full border border-gray4 px-3.25 font-normal text-[14px] text-black -tracking-[2%] placeholder-gray9 dark:text-white"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        disabled={sendMutation.isPending}
                        id="virtualAddressUserTag"
                        name="virtualAddressUserTag"
                        onChange={(event) => {
                          setUserTagInput(event.target.value)
                          setSendResult(null)
                        }}
                        placeholder="0x000000000001"
                        spellCheck={false}
                        value={userTagInput}
                      />
                    </div>
                    {normalizedUserTag && customVirtualAddress ? (
                      <>
                        <div className="flex items-baseline gap-2 text-[11px] text-gray9 -tracking-[1%]">
                          <span>Normalized user tag:</span>
                          <code className="font-mono text-primary">{normalizedUserTag}</code>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="min-w-0 break-all font-mono text-[12px] text-primary">
                            {customVirtualAddress}
                          </span>
                          {hasExplorerLink && (
                            <ExplorerAccountLink address={customVirtualAddress} inline />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-[12px] text-destructive -tracking-[1%]">
                        Enter 1 to 12 hex characters, with or without{' '}
                        <span className="font-mono">0x</span>.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {registration.txHash ? (
                <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                  <span className="text-primary">registration tx:</span>
                  <code className="min-w-0 break-all font-mono text-[12px] text-primary">
                    {registration.txHash}
                  </code>
                </div>
              ) : (
                <div>
                  This docs-managed wallet was already registered, so the tab can skip straight to
                  the transfer.
                </div>
              )}
            </div>
          ) : registerMutation.isPending ? (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              This tab skips live mining and submits a pre-mined valid TIP-1022 salt for a
              docs-managed wallet so you can get to the forwarding flow immediately.
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Click <span className="text-primary">Prepare demo master</span> to use a shared
              docs-managed wallet with pre-mined valid TIP-1022 salt.
            </div>
          )}
        </div>
      </Step>

      <Step
        active={Boolean(registration) && !sendResult}
        actions={
          <Button
            className="font-normal text-[14px] -tracking-[2%]"
            disabled={
              !registration || !isSupported || sendMutation.isPending || !customVirtualAddress
            }
            onClick={() => sendMutation.mutate()}
            type="button"
            variant={registration && isSupported ? 'accent' : 'default'}
          >
            {sendMutation.isPending
              ? `Sending ${tokenSymbol}…`
              : sendResult
                ? `Send another 100 ${tokenSymbol}`
                : `Send 100 ${tokenSymbol}`}
          </Button>
        }
        completed={Boolean(sendResult)}
        error={sendMutation.error}
        number={2}
        title="Send from another address to the virtual address and watch it land in the registered wallet."
      >
        <div className="mx-6 border-gray4 border-s-2 ps-5 pb-4">
          {registration ? (
            <div className="mt-2 space-y-3 text-[13px] text-gray9 -tracking-[1%]">
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">demo sender:</span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="min-w-0 break-all font-mono text-[12px] text-primary">
                    {demoSender.address}
                  </span>
                  {hasExplorerLink && <ExplorerAccountLink address={demoSender.address} inline />}
                </div>
              </div>
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">virtual address:</span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="min-w-0 break-all font-mono text-[12px] text-primary">
                    {customVirtualAddress}
                  </span>
                  {customVirtualAddress && hasExplorerLink && (
                    <ExplorerAccountLink address={customVirtualAddress} inline />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                <span className="text-primary">registered wallet:</span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="min-w-0 break-all font-mono text-[12px] text-primary">
                    {registration.masterAddress}
                  </span>
                  {hasExplorerLink && (
                    <ExplorerAccountLink address={registration.masterAddress} inline />
                  )}
                </div>
              </div>

              {sendResult ? (
                <>
                  <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                    <span className="text-primary">transfer tx:</span>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="min-w-0 break-all font-mono text-[12px] text-primary">
                        {sendResult.txHash}
                      </span>
                      {hasExplorerLink && <ExplorerLink hash={sendResult.txHash} inline />}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-[max-content,minmax(0,1fr)] items-start gap-x-4">
                      <span className="text-primary">master balance:</span>
                      <code className="min-w-0 break-all font-mono text-primary">
                        {sendResult.before.master} → {sendResult.after.master}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-primary">Transfer events in this receipt</span>
                    <div>
                      Treat the <span className="font-mono text-primary">sender → virtual</span> and{' '}
                      <span className="font-mono text-primary">virtual → master</span> pair as one
                      logical deposit to the registered wallet. Other transfer logs in the receipt,
                      like fees, are separate.
                    </div>
                    {sendResult.events.map((event, index) => (
                      <div key={`${event.from}-${event.to}-${index}`}>
                        <code className="break-all font-mono text-[12px] text-primary">
                          {StringFormatter.truncate(event.from, { start: 8, end: 6 })} →{' '}
                          {StringFormatter.truncate(event.to, { start: 8, end: 6 })} ({event.amount}{' '}
                          {tokenSymbol})
                        </code>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div>
                  This tab uses a shared registered wallet and a pre-mined valid salt, so you can
                  focus on the forwarding behavior without waiting for salt mining to finish. Edit
                  the user tag to derive a different virtual address for the same registered wallet.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Prepare the demo master first. This step needs a registered master id and derived
              virtual address.
            </div>
          )}
        </div>
      </Step>
    </div>
  )
}

'use client'

import { useMutation } from '@tanstack/react-query'
import { VirtualAddress, VirtualMaster } from 'ox/tempo'
import * as React from 'react'
import {
  type Address,
  type Chain,
  type Client,
  createClient,
  createPublicClient,
  formatUnits,
  type Hex,
  http,
  parseUnits,
  type Transport,
} from 'viem'
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts'
import { tempoDevnet, tempoLocalnet, tempoModerato } from 'viem/chains'
import { Abis, Actions, tempoActions, withFeePayer } from 'viem/tempo'
import { useClient, useConnect, useConnection, useDisconnect, useWriteContract } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useWebAuthnConnector } from '../../wagmi.config'
import { Button, ExplorerAccountLink, ExplorerLink, Logout, Step, StringFormatter } from './Demo'
import { alphaUsd, pathUsd } from './tokens'

const TEST_MNEMONIC = 'test test test test test test test test test test test junk'
const DEMO_SENDER_KEY =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const
const VIRTUAL_REGISTRY_ADDRESS = '0xfDC0000000000000000000000000000000000000' as const
const DEMO_USER_TAG = '0x000000000001' as const
const DEVNET_SPONSOR_URL = 'https://sponsor.devnet.tempo.xyz' as const
const MODERATO_SPONSOR_URL = 'https://sponsor.moderato.tempo.xyz' as const
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' as const

type RegistrationResult = {
  masterId: Hex
  registrationHash: Hex
  salt: Hex
  txHash: Hex
  virtualAddress: Address
}

type MinerState =
  | { status: 'idle' }
  | {
      status: 'mining'
      totalAttempts: number
      hashesPerSecond: number
    }
  | {
      status: 'found'
      salt: string
      masterId: string
      registrationHash: string
    }
  | { status: 'error'; message: string }

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

function formatCount(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

function randomHex(size: number): Hex {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}` as Hex
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message.toLowerCase().includes('aborted'))
  )
}

function PasskeyLogin() {
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connector = useWebAuthnConnector()

  return connect.isPending ? (
    <Button disabled variant="default" type="button">
      Check prompt
    </Button>
  ) : (
    <div className="flex gap-1">
      <Button
        variant="accent"
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={async () => {
          await disconnect.disconnectAsync().catch(() => {})
          connect.connect({ connector })
        }}
        type="button"
      >
        Sign in
      </Button>
      <Button
        variant="default"
        className="font-normal text-[14px] -tracking-[2%]"
        onClick={async () => {
          await disconnect.disconnectAsync().catch(() => {})
          connect.connect({
            connector,
            capabilities: {
              label: 'Tempo Docs',
              type: 'sign-up',
            },
          })
        }}
        type="button"
      >
        Sign up
      </Button>
    </div>
  )
}

export function VirtualAddressesLiveDemo() {
  const tempoEnv = import.meta.env.VITE_TEMPO_ENV
  const isLocalnet = tempoEnv === 'localnet'
  const isDevnet = tempoEnv === 'devnet'
  const isModerato = !isLocalnet && !isDevnet
  const isPublicTestnet = isDevnet || isModerato
  const isSupported = isLocalnet || isPublicTestnet
  const hasExplorerLink = isModerato || Boolean(import.meta.env.VITE_EXPLORER_OVERRIDE)
  const { address } = useConnection()
  const client = useClient()
  const { writeContractAsync } = useWriteContract()

  const [minerState, setMinerState] = React.useState<MinerState>({ status: 'idle' })
  const [registration, setRegistration] = React.useState<RegistrationResult | null>(null)
  const [sendResult, setSendResult] = React.useState<SendResult | null>(null)

  const abortControllerRef = React.useRef<AbortController | null>(null)
  const previousAddressRef = React.useRef<Address | undefined>(undefined)

  const demoAdmin = React.useMemo(() => mnemonicToAccount(TEST_MNEMONIC), [])
  const demoSender = React.useMemo(() => privateKeyToAccount(DEMO_SENDER_KEY), [])

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

  const { data: feeBalance } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
    query: {
      enabled: Boolean(address && isLocalnet),
    },
  })

  const stopMiner = React.useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  React.useEffect(() => {
    if (previousAddressRef.current === address) return

    previousAddressRef.current = address as Address | undefined
    stopMiner()
    setMinerState({ status: 'idle' })
    setRegistration(null)
    setSendResult(null)
  }, [address, stopMiner])

  React.useEffect(
    () => () => {
      stopMiner()
    },
    [stopMiner],
  )

  const mineSalt = React.useCallback(
    async (masterAddress: Address) => {
      stopMiner()
      setMinerState({ status: 'mining', totalAttempts: 0, hashesPerSecond: 0 })

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const result = await VirtualMaster.mineSaltAsync({
          address: masterAddress,
          onProgress: (progress) => {
            setMinerState({
              status: 'mining',
              totalAttempts: progress.attempts,
              hashesPerSecond: Math.round(progress.rate),
            })
          },
          signal: abortController.signal,
          start: randomHex(32),
        })

        if (!result) throw new Error('Unable to find a valid TIP-1022 salt.')

        setMinerState({
          status: 'found',
          salt: result.salt,
          masterId: result.masterId,
          registrationHash: result.registrationHash,
        })

        return {
          masterId: result.masterId,
          registrationHash: result.registrationHash,
          salt: result.salt,
        }
      } catch (error) {
        if (isAbortError(error)) throw error

        const message = error instanceof Error ? error.message : 'Virtual master mining failed.'
        setMinerState({ status: 'error', message })
        throw new Error(message)
      } finally {
        if (abortControllerRef.current === abortController) abortControllerRef.current = null
      }
    },
    [stopMiner],
  )

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

        if (target === address && feeBalance && feeBalance > parseUnits('10', 6)) return

        await Actions.token.transferSync(adminClient, {
          account: demoAdmin,
          amount: parseUnits('1000', 6),
          chain: tempoLocalnet,
          to: target,
          token: alphaUsd,
        })
        return
      }

      if (!client) throw new Error('Client unavailable.')
      if (requiredTokens.length === 0) return

      const balances = await Promise.all(
        requiredTokens.map((token) => getTokenBalance(target, token)),
      )
      if (balances.every((balance) => balance > 0n)) return

      await Actions.faucet.fund(client as unknown as Client<Transport, Chain>, {
        account: target,
      })
      await Promise.all(requiredTokens.map((token) => waitForTokenBalance(target, token)))
    },
    [
      address,
      client,
      demoAdmin,
      demoAdminClient,
      feeBalance,
      getTokenBalance,
      isLocalnet,
      publicClient,
      waitForTokenBalance,
    ],
  )

  const registerMutation = useMutation({
    mutationFn: async (): Promise<RegistrationResult> => {
      if (!isSupported) throw new Error('This live demo is available on Tempo testnet or localnet.')
      if (!address) throw new Error('Sign in with a passkey first.')
      if (!publicClient) throw new Error('Runtime client unavailable.')

      const masterAddress = address as Address
      await ensureAccountFunded(masterAddress, isPublicTestnet ? [] : [alphaUsd])
      const mined = await mineSalt(masterAddress)

      const txHash = await writeContractAsync({
        address: VIRTUAL_REGISTRY_ADDRESS,
        abi: Abis.addressRegistry,
        functionName: 'registerVirtualMaster',
        args: [mined.salt],
        ...(isPublicTestnet ? { feePayer: true } : {}),
      })

      await publicClient.waitForTransactionReceipt({ hash: txHash })

      return {
        ...mined,
        txHash,
        virtualAddress: VirtualAddress.from({
          masterId: mined.masterId,
          userTag: DEMO_USER_TAG,
        }),
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
      if (!registration) throw new Error('Register a master id first.')
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
          args: [address as Address],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [registration.virtualAddress],
        }) as Promise<bigint>,
      ])

      const { receipt } = await demoSenderClient.token.transferSync({
        amount,
        ...(isPublicTestnet ? { feePayer: true } : {}),
        to: registration.virtualAddress,
        token: pathUsd,
      })

      const [masterAfter, virtualAfter] = await Promise.all([
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [address as Address],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: pathUsd,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [registration.virtualAddress],
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

  const registerAction = !isSupported ? (
    <Button disabled variant="default" type="button">
      Devnet or localnet only
    </Button>
  ) : registration ? null : (
    <Button
      className="font-normal text-[14px] -tracking-[2%]"
      disabled={!address || registerMutation.isPending}
      onClick={() => registerMutation.mutate()}
      type="button"
      variant={address ? 'accent' : 'default'}
    >
      {registerMutation.isPending
        ? minerState.status === 'mining'
          ? 'Mining salt…'
          : minerState.status === 'found'
            ? 'Confirm passkey…'
            : 'Registering…'
        : 'Register master id'}
    </Button>
  )

  const tokenSymbol = 'pathUSD'

  return (
    <div className="space-y-4">
      <Step
        active={!address}
        actions={address ? <Logout /> : <PasskeyLogin />}
        completed={Boolean(address)}
        number={1}
        title="Sign in with a passkey and create a Tempo address."
      >
        {address && (
          <div className="mx-6 border-gray4 border-s-2 ps-5 pb-4">
            <div className="mt-2 flex flex-col gap-1 text-[13px] text-gray9 -tracking-[1%]">
              <span className="text-primary">Connected passkey account</span>
              <code className="break-all font-mono text-[12px] text-primary">{address}</code>
              <span>
                The demo auto-funds the passkey account, uses `VirtualMaster.mineSaltAsync` to mine
                a valid salt with parallel workers when available, and sends the deposit from a
                separate demo address.
              </span>
            </div>
          </div>
        )}
      </Step>

      <Step
        active={Boolean(address) && !registration}
        actions={registerAction}
        completed={Boolean(registration)}
        error={registerMutation.error}
        number={2}
        title="Register a master id for that passkey address."
      >
        <div className="mx-6 border-gray4 border-s-2 ps-5 pb-4">
          {!isSupported ? (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Run docs against Tempo testnet or localnet to use this live preview.
            </div>
          ) : !address ? (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Sign in first, then the demo will fund the account if needed, mine the required salt
              with `VirtualMaster.mineSaltAsync`, and prompt the passkey for registration.
            </div>
          ) : registration ? (
            <div className="mt-2 grid gap-2 text-[13px] text-gray9 -tracking-[1%]">
              <div>
                <span className="text-primary">masterId:</span>{' '}
                <code className="font-mono text-primary">{registration.masterId}</code>
              </div>
              <div>
                <span className="text-primary">salt:</span>{' '}
                <code className="break-all font-mono text-[12px] text-primary">
                  {registration.salt}
                </code>
              </div>
              <div>
                <span className="text-primary">virtual address:</span>{' '}
                <code className="break-all font-mono text-[12px] text-primary">
                  {registration.virtualAddress}
                </code>
              </div>
              <div>
                <span className="text-primary">registration tx:</span>{' '}
                <code className="break-all font-mono text-[12px] text-primary">
                  {registration.txHash}
                </code>
              </div>
            </div>
          ) : minerState.status === 'mining' ? (
            <div className="mt-2 grid grid-cols-2 gap-2 text-[13px] text-gray9 -tracking-[1%] max-sm:grid-cols-1">
              <div>
                <span className="text-primary">hashes tried:</span>{' '}
                <code className="font-mono text-primary">
                  {formatCount(minerState.totalAttempts)}
                </code>
              </div>
              <div>
                <span className="text-primary">hash rate:</span>{' '}
                <code className="font-mono text-primary">
                  {formatCount(minerState.hashesPerSecond)}/s
                </code>
              </div>
              <div className="col-span-full">
                `VirtualMaster.mineSaltAsync` is searching for the 32-bit proof-of-work required by
                TIP-1022 using parallel workers when the browser supports them.
              </div>
            </div>
          ) : minerState.status === 'found' ? (
            <div className="mt-2 grid gap-2 text-[13px] text-gray9 -tracking-[1%]">
              <div>
                <span className="text-primary">masterId:</span>{' '}
                <code className="font-mono text-primary">{minerState.masterId}</code>
              </div>
              <div>
                <span className="text-primary">salt found:</span>{' '}
                <code className="break-all font-mono text-[12px] text-primary">
                  {minerState.salt}
                </code>
              </div>
              <div>Waiting for the registration transaction to be confirmed.</div>
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Click <span className="text-primary">Register master id</span> to fund the passkey for
              fees, mine a valid salt, and submit{' '}
              <code className="font-mono text-primary">registerVirtualMaster</code>.
            </div>
          )}
        </div>
      </Step>

      <Step
        active={Boolean(registration) && !sendResult}
        actions={
          <Button
            className="font-normal text-[14px] -tracking-[2%]"
            disabled={!registration || !isSupported || sendMutation.isPending}
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
        number={3}
        title="Send from another address to the virtual address and watch it land in the registered wallet."
      >
        <div className="mx-6 border-gray4 border-s-2 ps-5 pb-4">
          {registration ? (
            <div className="mt-2 space-y-3 text-[13px] text-gray9 -tracking-[1%]">
              <div>
                <span className="text-primary">demo sender:</span>{' '}
                <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[12px] text-primary">{demoSender.address}</span>
                  {hasExplorerLink && <ExplorerAccountLink address={demoSender.address} inline />}
                </span>
              </div>
              <div>
                <span className="text-primary">virtual address:</span>{' '}
                <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="break-all font-mono text-[12px] text-primary">
                    {registration.virtualAddress}
                  </span>
                  {hasExplorerLink && (
                    <ExplorerAccountLink address={registration.virtualAddress} inline />
                  )}
                </span>
              </div>
              <div>
                <span className="text-primary">registered wallet:</span>{' '}
                <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="break-all font-mono text-[12px] text-primary">{address}</span>
                  {hasExplorerLink && address && <ExplorerAccountLink address={address} inline />}
                </span>
              </div>

              {sendResult ? (
                <>
                  <div>
                    <span className="text-primary">transfer tx:</span>{' '}
                    <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="break-all font-mono text-[12px] text-primary">
                        {sendResult.txHash}
                      </span>
                      {hasExplorerLink && <ExplorerLink hash={sendResult.txHash} inline />}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
                    <div>
                      <span className="text-primary">master balance:</span>{' '}
                      <code className="font-mono text-primary">
                        {sendResult.before.master} → {sendResult.after.master}
                      </code>
                    </div>
                    <div>
                      <span className="text-primary">virtual balance:</span>{' '}
                      <code className="font-mono text-primary">
                        {sendResult.before.virtual} → {sendResult.after.virtual}
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
                  The demo uses `VirtualAddress.from` to derive a deposit address, funds a separate
                  sender if needed, transfers 100 {tokenSymbol} to the virtual address, and then
                  reads both balances so you can see the tokens land in the registered passkey
                  wallet.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-gray9 -tracking-[1%]">
              Finish registration first. This step needs a master id and derived virtual address.
            </div>
          )}
        </div>
      </Step>
    </div>
  )
}

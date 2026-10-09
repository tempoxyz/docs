'use client'

import { ExecutionError } from 'accounts'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  BaseError,
  type Client,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  type Transport,
} from 'viem'
import { estimateGas, readContract } from 'viem/actions'
import type { tempo } from 'viem/chains'
import {
  useChains,
  useClient,
  useConfig,
  useConnect,
  useConnection,
  useDisconnect,
  useReadContract,
  useSendCallsSync,
} from 'wagmi'
import { cx } from 'zyzz'
import {
  connectEvmAccount,
  evmTokenTransfer,
  sendEvmCall,
  useEvmWallets,
  WalletSendError,
  waitForEvmCall,
} from '../lib/evm-wallets'
import { agentInstructions } from '../lib/routes-agent-instructions'
import {
  type ApiRequest,
  type ApiResult,
  assertUnexpired,
  erc20Address,
  executeRoutesRequest,
  isSubsidyRefusal,
  loadRoutes,
  quoteRequest,
  RoutesApiError,
  requestUrl,
  retryOn,
  SourceRevertedError,
  sourceActionSchema,
  submitTempoCalls,
} from '../lib/routes-execution'
import {
  canSubsidize,
  demoMethods,
  type RoutePick,
  routeChoices,
  routeQuoteRequest,
  routeTestRequest,
  subsidizedDelivery,
  type TestMethod,
  type TestMode,
  type TestRoute,
} from '../lib/routes-test'
import {
  connectSolanaAccount,
  sendSplToken,
  solanaMainnet,
  useSolanaWallets,
  waitForSolanaSignature,
} from '../lib/solana-wallets'
import {
  connectTronAccount,
  sendTronCall,
  TronRevertedError,
  trc20Transfer,
  tronMainnet,
  useTronWallets,
  waitForTronReceipt,
} from '../lib/tron-wallets'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'
import { tempoChainIds, useTempoWalletConnector } from '../wagmi.config'
import { type ApiCall, ApiLog, CopyButton } from './ApiLog'
import { Container } from './Container'
import * as Demo from './guides/Demo'
import { RouteCanvas, type RouteProgress } from './RouteCanvas'
import { ApiKeyPill } from './RoutesApiKey'
import {
  input as inputStyle,
  label as labelStyle,
  note as noteStyle,
  Select,
} from './RoutesControls'

const consoleApiKeysUrl = 'https://console.tempo.xyz/?to=/:org/api-keys'
const explorers: Record<string, (hash: string) => string> = {
  'eip155:4217': (hash) => `https://explore.tempo.xyz/tx/${hash}`,
  'eip155:42431': (hash) => `https://explore.testnet.tempo.xyz/tx/${hash}`,
  'tron:0x2b6653dc': (hash) => `https://tronscan.org/#/transaction/${hash}`,
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': (hash) => `https://solscan.io/tx/${hash}`,
}
const quantity = (value: unknown) =>
  typeof value === 'object' && value && 'formatted' in value ? String(value.formatted) : '—'
const isRejection = (e: unknown) =>
  e instanceof BaseError
    ? !!e.walk((cause) => (cause as { code?: number }).code === 4001)
    : (e as { code?: number }).code === 4001

const noPick: RoutePick = {
  sourceChain: '',
  sourceToken: '',
  destinationChain: '',
  destinationToken: '',
}
const pickOf = (route: TestRoute): RoutePick => ({
  sourceChain: route.sourceChain.id,
  sourceToken: route.sourceToken.tokenKey,
  destinationChain: route.destinationChain.id,
  destinationToken: route.destinationToken.tokenKey,
})
// The same route can be listed with and without a key, so match it by its endpoints.
const routeKey = (route: TestRoute) => Object.values(pickOf(route)).join('|')

export function RoutesTester() {
  const [apiKey, setApiKey] = useState('')
  const [routes, setRoutes] = useState<TestRoute[]>([])
  const [pick, setPick] = useState<RoutePick>(noPick)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [method, setMethod] = useState<TestMethod>()
  const [progress, setProgress] = useState<RouteProgress & { routeId: string }>()
  const [keyOpen, setKeyOpen] = useState(false)
  // After a delivery, instructions for an AI agent to repeat the run for another user.
  const [instructions, setInstructions] = useState<string>()
  const [keyLocked, setKeyLocked] = useState(false)
  const [notice, setNotice] = useState('')
  const chosen = useRef<TestRoute>(undefined)
  // The directory reflects the key's access policy, so reload it (debounced) when the key changes.
  // A route chosen before the key was added stays chosen, quote and all, if the key can use it.
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const timer = setTimeout(() => {
      loadRoutes(AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]), apiKey)
        .then((list) => {
          const previous = chosen.current
          const kept = previous && list.find((r) => routeKey(r) === routeKey(previous))
          setRoutes(list)
          setPick(kept ? pickOf(kept) : noPick)
          setNotice(
            previous && !kept
              ? `This key cannot use ${previous.sourceToken.symbol} on ${previous.sourceChain.name} to ${previous.destinationToken.symbol} on ${previous.destinationChain.name}. Choose another route.`
              : '',
          )
        })
        .catch((e) => {
          if (!controller.signal.aborted)
            setError(e instanceof RoutesApiError ? e.message : 'Could not load routes. Try again.')
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [attempt, apiKey])
  const choices = routeChoices(routes, pick)
  const order: (keyof RoutePick)[] = [
    'sourceChain',
    'sourceToken',
    'destinationChain',
    'destinationToken',
  ]
  // Changing a choice clears the ones after it so stale selections cannot form an invalid route.
  const choose = (key: keyof RoutePick, value: string) => {
    setNotice('')
    setPick((current) => {
      const next = { ...current, [key]: value }
      for (const later of order.slice(order.indexOf(key) + 1)) next[later] = ''
      return next
    })
  }
  const field = (key: keyof RoutePick, options: { value: string; label: string }[]) => ({
    value: choices.pick[key],
    options,
    onChange: (value: string) => choose(key, value),
  })
  const selected = choices.route
  chosen.current = selected
  const methods = selected ? demoMethods(selected) : []
  const usable = methods.length > 0
  const activeMethod = method && methods.includes(method) ? method : methods[0]
  const shownProgress: RouteProgress =
    selected && usable
      ? progress?.routeId === routeKey(selected)
        ? progress
        : { phase: 'ready' }
      : { phase: 'idle' }
  return (
    <Container
      headerLeft={<span {...headerTitle()}>Try a route</span>}
      headerRight={
        <div {...headerActions()}>
          <ApiKeyPill
            apiKey={apiKey}
            open={keyOpen}
            onOpenChange={setKeyOpen}
            onSave={setApiKey}
            locked={keyLocked}
          />
        </div>
      }
      footer={
        <div {...footerRow()}>
          <InstructionsLink markdown={instructions} />
        </div>
      }
    >
      <section
        {...tester({ className: 'routes-tester' })}
        aria-label="Route playground"
        aria-busy={loading}
      >
        <Demo.Step
          number={1}
          title="Select your route"
          active={!(selected && usable)}
          completed={!!(selected && usable)}
        >
          <div {...stepBody()}>
            <RouteCanvas
              source={{
                network: field('sourceChain', choices.options.sourceChains),
                asset: field('sourceToken', choices.options.sourceTokens),
              }}
              destination={{
                network: field('destinationChain', choices.options.destinationChains),
                asset: field('destinationToken', choices.options.destinationTokens),
              }}
              disabled={loading || locked}
              progress={shownProgress}
              method={activeMethod}
              methods={methods}
              onMethod={setMethod}
              locked={locked}
              loading={loading}
            />
          </div>
        </Demo.Step>
        {notice && (
          <p role="status" {...cautionText()}>
            {notice}
          </p>
        )}
        {error && (
          <div {...errorRow()}>
            <p role="alert" {...errorText()}>
              {error}
            </p>
            <Demo.Button type="button" onClick={() => setAttempt((x) => x + 1)}>
              Retry
            </Demo.Button>
          </div>
        )}
        {!loading && !error && routes.length === 0 && (
          <p {...noteStyle()}>No routes are available{apiKey.trim() ? ' for this key' : ''}.</p>
        )}
        {selected && !usable && (
          <p {...noteStyle()}>
            This route needs a {selected.sourceChain.name} wallet to sign transfers, which this demo
            cannot do. Use the{' '}
            <a href="/docs/routes/transfers" {...accentLink()}>
              Transfers API
            </a>{' '}
            from your integration.
          </p>
        )}
        {selected && usable && activeMethod ? (
          <RouteLifecycle
            key={routeKey(selected)}
            route={selected}
            method={activeMethod}
            apiKey={apiKey}
            onLock={setLocked}
            onCommit={() => setKeyLocked(true)}
            onProgress={(next) => setProgress({ ...next, routeId: routeKey(selected) })}
            onInstructions={setInstructions}
            onNeedKey={() => setKeyOpen(true)}
          />
        ) : (
          <PendingSteps />
        )}
      </section>
    </Container>
  )
}

/** The steps and API log, shown dimmed and empty until a route is chosen. */
function PendingSteps() {
  return (
    <div {...stepsLayout()}>
      <div {...stepList()}>
        {['Get a quote', 'Create the transfer', 'Sign and send', 'Track delivery'].map(
          (title, index) => (
            <Demo.Step
              key={title}
              number={index + 2}
              title={title}
              active={false}
              completed={false}
            />
          ),
        )}
      </div>
      <ApiLog calls={[]} busy={false} />
    </div>
  )
}

function RouteLifecycle({
  route,
  method,
  apiKey,
  onLock,
  onCommit,
  onProgress,
  onInstructions,
  onNeedKey,
}: {
  route: TestRoute
  method: TestMethod
  apiKey: string
  onLock: (locked: boolean) => void
  /** Creation has started, so the key that made it must stay. */
  onCommit: () => void
  onProgress: (progress: RouteProgress) => void
  onInstructions: (markdown: string | undefined) => void
  /** Open the key panel, where the reader pastes their API key. */
  onNeedKey: () => void
}) {
  const [mode, setMode] = useState<TestMode>(route.capabilities.transfer?.modes[0] ?? 'exactSource')
  const [amount, setAmount] = useState('')
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [refundAddress, setRefundAddress] = useState('')
  // 1:1 delivery is requested wherever the route offers it, until the API refuses the subsidy.
  const [subsidyRefused, setSubsidyRefused] = useState(false)
  const [quote, setQuote] = useState<ApiResult>()
  const [created, setCreated] = useState<ApiResult>()
  const [hashes, setHashes] = useState<string[]>([])
  const [confirmedCalls, setConfirmedCalls] = useState(0)
  const [registered, setRegistered] = useState(false)
  const [deposits, setDeposits] = useState<Record<string, unknown>[]>()
  const [depositId, setDepositId] = useState('')
  const [status, setStatus] = useState<ApiResult>()
  const [uncertain, setUncertain] = useState(false)
  const [reverted, setReverted] = useState(false)
  const [pollError, setPollError] = useState('')
  const [_checkedAt, setCheckedAt] = useState('')
  const [polls, setPolls] = useState(0)
  const [busy, setBusy] = useState(false)
  const [funding, setFunding] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const callId = useRef(0)
  const creation = useRef<{ request: ApiRequest; startedAt: number } | null>(null)
  const quoteReady = useRef(false)
  const inFlight = useRef(false)
  const sourceChainId = /^eip155:(\d+)$/.exec(route.sourceChain.id)?.[1]
  // Tempo sources sign with Tempo Wallet; the other configured EVM networks use browser wallets.
  const chains = useChains()
  const tempoChainId = chains.find(
    (c) => tempoChainIds.has(c.id) && c.id === Number(sourceChainId),
  )?.id
  const wagmiConfig = useConfig()
  const connection = useConnection()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const tempoWallet = useTempoWalletConnector()
  const sendCalls = useSendCallsSync()
  const tempoClient = useClient({ chainId: tempoChainId })
  // Each source network signs with its own kind of wallet: Tempo Wallet (the Tempo accounts SDK)
  // on Tempo, and the reader's choice of browser wallet everywhere else.
  const family = tempoChainId
    ? 'tempo'
    : route.sourceChain.id === tronMainnet
      ? 'tron'
      : route.sourceChain.id === solanaMainnet
        ? 'solana'
        : route.sourceChain.id.startsWith('eip155:')
          ? 'evm'
          : undefined
  const evmWallets = useEvmWallets()
  const tronWallets = useTronWallets()
  const solanaWallets = useSolanaWallets()
  const [walletId, setWalletId] = useState('')
  const pick = <T extends { name: string }>(list: readonly T[], key: (w: T) => string) =>
    list.find((w) => key(w) === walletId) ?? list[0]
  const evmWallet = pick(evmWallets, (w) => w.id)
  const tronWallet = pick(tronWallets, (w) => w.id)
  const solanaWallet = pick(solanaWallets, (w) => w.name)
  const walletOptions =
    family === 'evm'
      ? evmWallets.map((w) => ({ id: w.id, name: w.name }))
      : family === 'tron'
        ? tronWallets.map((w) => ({ id: w.id, name: w.name }))
        : family === 'solana'
          ? solanaWallets.map((w) => ({ id: w.name, name: w.name }))
          : []
  const walletName =
    family === 'tempo'
      ? 'Tempo Wallet'
      : family === 'evm'
        ? evmWallet?.name
        : family === 'tron'
          ? tronWallet?.name
          : solanaWallet?.name
  const sourceTokenAddress = tempoChainId ? erc20Address(route.sourceToken.tokenKey) : undefined
  const senderAddress = /^0x[\da-fA-F]{40}$/.test(sender) ? (sender as `0x${string}`) : undefined
  const sourceBalance = useReadContract({
    address: sourceTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: senderAddress ? [senderAddress] : undefined,
    chainId: tempoChainId,
    query: { enabled: !!sourceTokenAddress && !!senderAddress && method === 'transfer' },
  })
  const tempoAccount =
    tempoWallet && connection.connector?.id === tempoWallet.id ? connection.address : undefined
  const subsidyAvailable = canSubsidize(route, method, mode)
  const input = {
    method,
    mode,
    amount,
    sender,
    recipient,
    refundAddress,
    // 1:1 delivery is organization pricing, so only a quote with the reader's key asks for it.
    subsidize: subsidyAvailable && !subsidyRefused && !!apiKey.trim(),
  }
  let quoteParams: ReturnType<typeof routeQuoteRequest> | undefined
  let quoteValidation = ''
  try {
    quoteParams = routeQuoteRequest(route, input)
  } catch (e) {
    quoteValidation = (e as Error).message
  }
  let body: ReturnType<typeof routeTestRequest> | undefined
  let validation = ''
  try {
    body = routeTestRequest(route, input)
  } catch (e) {
    validation = (e as Error).message
  }
  const isTransfer = method === 'transfer'
  const { symbol: sourceSymbol, decimals: sourceDecimals } = route.sourceToken
  const sourceBaseUnits = (data?: Record<string, unknown>) =>
    (data?.sourceAmount as { baseUnits?: string } | undefined)?.baseUnits
  const requiredSource = BigInt(
    sourceBaseUnits(created?.data) ??
      sourceBaseUnits(quote?.data) ??
      (quoteParams && mode === 'exactSource' ? quoteParams.amount : '0'),
  )
  const balance = isTransfer ? sourceBalance.data : undefined
  const shortfall = balance !== undefined && requiredSource > 0n && balance < requiredSource
  const id = typeof created?.data.id === 'string' ? created.data.id : ''
  const parsedAction = sourceActionSchema.safeParse(created?.data.action)
  // Tron sources get Tron calls; every other transfer source gets EVM calls.
  const action =
    parsedAction.success && (parsedAction.data.type === 'tron:calls') === (family === 'tron')
      ? parsedAction
      : { success: false as const }
  const calls = action.success ? action.data.calls : []
  const expiresAt = (created?.data.quote as { expiresAt?: string } | undefined)?.expiresAt
  const current = status?.data
  const frozen = !!quote || !!creation.current || busy
  const step = !quote ? 1 : !created ? 2 : (isTransfer ? !registered : !depositId) ? 3 : 4
  // Only failures get the red error box. A caution asks the reader to check something first.
  const message = error || pollError
  const caution =
    (uncertain && !busy
      ? `${walletName ?? 'The wallet'} may have sent this transaction. Check its history before trying again, so it is not sent twice.`
      : '') ||
    (shortfall && step > 1 && step < 4 && balance !== undefined
      ? `The sender holds ${formatUnits(balance, sourceDecimals)} ${sourceSymbol}, and this transfer sends ${formatUnits(requiredSource, sourceDecimals)}. Add ${sourceSymbol} to the sender, then recheck.`
      : '')
  const errorFor = (n: number) => (message && step === n ? new Error(message) : undefined)
  const cautionFor = (n: number) =>
    caution && step === n ? (
      <p role="status" {...cx(stepBody(), cautionText())}>
        {caution}
      </p>
    ) : null
  // What the canvas shows: where the route is, the amounts at each end, and the addresses.
  // A created transfer carries its final terms. A created deposit address has only its address,
  // so its amounts stay those of the quote.
  const terms = (created?.data.sourceAmount ? created : quote)?.data
  const subsidizedTerms = terms?.subsidize === true
  const { decimals: destinationDecimals, symbol: destinationSymbol } = route.destinationToken
  const guaranteed =
    terms && subsidizedTerms ? subsidizedDelivery(terms, destinationDecimals) : undefined
  const progress: RouteProgress = {
    phase:
      step === 4
        ? current?.status === 'completed'
          ? 'delivered'
          : finalStatuses.has(String(current?.status ?? ''))
            ? 'attention'
            : 'delivering'
        : message
          ? 'attention'
          : step === 3
            ? 'funding'
            : step === 2
              ? 'quoted'
              : 'ready',
    sendAmount: terms
      ? `${quantity(terms.sourceAmount)} ${sourceSymbol}`
      : amount && mode === 'exactSource'
        ? `${amount} ${sourceSymbol}`
        : undefined,
    receiveAmount:
      current?.status === 'completed'
        ? `${quantity(current.destinationAmount)} ${destinationSymbol}`
        : terms
          ? `${guaranteed ? formatUnits(guaranteed.guaranteed, destinationDecimals) : quantity(terms.destinationAmount)} ${destinationSymbol}`
          : undefined,
    sourceAddress: (isTransfer ? sender : refundAddress) || undefined,
    destinationAddress: recipient || undefined,
  }
  const progressKey = JSON.stringify(progress)
  const reportProgress = useRef(onProgress)
  reportProgress.current = onProgress
  useEffect(() => {
    reportProgress.current(JSON.parse(progressKey))
  }, [progressKey])

  // Release the route pickers if the key's directory drops this route.
  useEffect(() => () => onLock(false), [onLock])

  useEffect(() => {
    if (!created && !creation.current) return
    const preventLoss = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', preventLoss)
    return () => window.removeEventListener('beforeunload', preventLoss)
  }, [created, busy])

  async function task(work: () => Promise<void>) {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    onLock(true)
    try {
      await work()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.')
    } finally {
      inFlight.current = false
      setBusy(false)
      onLock(quoteReady.current || !!creation.current)
    }
  }
  async function call(request: ApiRequest) {
    const id = ++callId.current
    const keyed = !!apiKey.trim()
    setApiCalls((list) => {
      const latest = list[0]
      // Background polls repeat the same read; fold them into one entry with a count.
      if (
        latest &&
        request.method === 'GET' &&
        latest.request.method === 'GET' &&
        requestUrl(latest.request) === requestUrl(request)
      )
        return [
          { ...latest, id, request, keyed, result: undefined, repeats: latest.repeats + 1 },
          ...list.slice(1),
        ]
      return [{ id, request, keyed, repeats: 1 }, ...list].slice(0, 25)
    })
    const finish = (result: ApiResult) =>
      setApiCalls((list) => list.map((entry) => (entry.id === id ? { ...entry, result } : entry)))
    try {
      const result = await executeRoutesRequest(request, apiKey)
      finish(result)
      return result
    } catch (e) {
      finish(
        e instanceof RoutesApiError
          ? e.result
          : { status: 0, data: { message: e instanceof Error ? e.message : 'Request failed.' } },
      )
      throw e
    }
  }
  async function register(submitted: string[]) {
    setRegistering(true)
    try {
      // The API may not have seen the transaction confirm yet; keep registering until it has.
      await retryOn(
        ['source_transaction_pending'],
        () =>
          call({
            method: 'POST',
            path: `/transfers/${id}/source-transactions`,
            body: { transactionHashes: submitted },
          }),
        { attempts: 20, intervalMs: 3_000 },
      )
    } catch (e) {
      // Already registered (for example after a lost response): tracking shows where it stands.
      if (!(e instanceof RoutesApiError && e.code === 'routes_transfer_not_awaiting_source'))
        throw e
    } finally {
      setRegistering(false)
    }
    setRegistered(true)
  }

  const unsubsidizedQuote = () => call(quoteRequest(route, { ...input, subsidize: false }))
  // The quote's price list: public without a key, the organization's with one.
  const quotedWith = useRef(apiKey)
  const getQuote = () =>
    task(async () => {
      quotedWith.current = apiKey
      let result: ApiResult
      try {
        result = await call(quoteRequest(route, input))
      } catch (e) {
        // Without approval or inventory for 1:1 delivery, quote the route without it.
        if (!input.subsidize || !isSubsidyRefusal(e)) throw e
        setSubsidyRefused(true)
        result = await unsubsidizedQuote()
      }
      setQuote(result)
      quoteReady.current = true
    })
  // Adding or removing a key changes the price list, so an open quote is priced again.
  useEffect(() => {
    if (!quote || creation.current || quotedWith.current === apiKey) return
    void getQuote()
  }, [apiKey])
  const editQuote = () => {
    setSubsidyRefused(false)
    setQuote(undefined)
    quoteReady.current = false
    onLock(false)
  }
  const create = () =>
    task(async () => {
      if (!body) throw new Error(validation)
      onCommit()
      // Retries reuse the same request and idempotency key, so a lost response cannot duplicate it.
      creation.current ??= {
        startedAt: Date.now(),
        request: {
          method: 'POST',
          path: `/${isTransfer ? 'transfers' : 'deposit-addresses'}`,
          body,
          idempotencyKey: crypto.randomUUID(),
        },
      }
      if (Date.now() - creation.current.startedAt >= 24 * 60 * 60 * 1000)
        throw new Error('The retry window has passed. Reload the page to start a new test.')
      const request = creation.current.request
      let result: ApiResult
      try {
        // A duplicate of an in-flight request: wait for the original rather than send a new one.
        result = await retryOn(['idempotency_in_progress'], () => call(request), {
          attempts: 5,
          intervalMs: 2_000,
        })
      } catch (e) {
        // A keyless quote uses the docs key, whose 1:1 approval the reader's organization may not
        // have. Nothing was created, so quote again without the subsidy before creating.
        if (!request.body?.subsidize || !isSubsidyRefusal(e)) throw e
        creation.current = null
        setSubsidyRefused(true)
        setQuote(await unsubsidizedQuote())
        throw new Error(
          'Your organization cannot use 1:1 delivery on this route, so the quote is now without it. Review it, then create.',
        )
      }
      if (typeof result.data.id !== 'string')
        throw new Error('Creation returned no ID. Retry to recover the response.')
      setCreated(result)
    })
  const signWithTempo = () =>
    task(async () => {
      const chainId = tempoChainId
      if (!chainId) return
      // wagmi and viem/actions resolve different viem builds, so type the RPC client once here.
      const rpc = tempoClient as unknown as Client<Transport, typeof tempo>
      let hash: string
      try {
        hash = await submitTempoCalls(
          (parameters) => sendCalls.mutateAsync({ ...parameters, chainId }),
          {
            chainId,
            sender,
            connected: tempoAccount,
            calls,
            expiresAt,
            required: { amount: requiredSource, symbol: sourceSymbol, decimals: sourceDecimals },
            readBalance: async () =>
              sourceTokenAddress
                ? readContract(rpc, {
                    address: sourceTokenAddress,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [sender as `0x${string}`],
                  })
                : requiredSource,
            simulate: (batch) =>
              estimateGas(rpc, { account: sender as `0x${string}`, calls: batch }).catch(
                (e: Error) => {
                  throw new Error(`${ExecutionError.parse(e).message} Nothing was sent.`)
                },
              ),
            onBroadcast: () => setUncertain(true),
            onHash: (submitted) => {
              setHashes([submitted])
              setUncertain(false)
            },
          },
        )
      } catch (e) {
        if (isRejection(e)) setUncertain(false)
        if (e instanceof SourceRevertedError) setReverted(true)
        void sourceBalance.refetch()
        throw e
      }
      setConfirmedCalls(calls.length)
      await register([hash])
    })
  const signWithBrowserWallet = () =>
    task(async () => {
      const chainId = Number(sourceChainId)
      if (!evmWallet) throw new Error('Open this page in a browser with an EVM wallet to sign.')
      const submitted = [...hashes]
      for (let i = confirmedCalls; i < calls.length; i++) {
        // A call with a saved hash was already broadcast: wait for it instead of sending again.
        if (!submitted[i]) {
          try {
            submitted[i] = await sendEvmCall(wagmiConfig, {
              connector: evmWallet,
              chainId,
              sender,
              call: calls[i],
              expiresAt,
              onHash: (hash) => {
                submitted[i] = hash
                setHashes([...submitted])
                setUncertain(false)
              },
              onBroadcast: () => setUncertain(true),
            })
          } catch (e) {
            if (isRejection(e)) setUncertain(false)
            if (!(e instanceof WalletSendError)) throw e
            setUncertain(false)
            const resume =
              i > 0 ? ` Call ${i} is confirmed, so Sign and send resumes from call ${i + 1}.` : ''
            throw new Error(
              `Your wallet could not send call ${i + 1} of ${calls.length}, and nothing was broadcast.${resume} If it fails again, try another browser wallet. (${e.detail})`,
            )
          }
        }
        try {
          await waitForEvmCall(wagmiConfig, chainId, submitted[i])
        } catch (e) {
          if (e instanceof SourceRevertedError) setReverted(true)
          throw e
        }
        setConfirmedCalls(i + 1)
      }
      await register(submitted)
    })
  const signWithTronWallet = () =>
    task(async () => {
      if (!tronWallet) throw new Error('Install a Tron wallet, such as TronLink, to sign.')
      const submitted = [...hashes]
      for (let i = confirmedCalls; i < calls.length; i++) {
        // Tron has no nonce: each call lands before the next is sent, and a saved ID is never resent.
        if (!submitted[i]) {
          assertUnexpired(expiresAt)
          try {
            submitted[i] = await sendTronCall(tronWallet, sender, calls[i], () =>
              setUncertain(true),
            )
          } catch (e) {
            if (isRejection(e)) setUncertain(false)
            throw e
          }
          setHashes([...submitted])
          setUncertain(false)
        }
        try {
          await waitForTronReceipt(submitted[i])
        } catch (e) {
          if (e instanceof TronRevertedError) setReverted(true)
          throw e
        }
        setConfirmedCalls(i + 1)
      }
      await register(submitted)
    })
  const signAndSend = () =>
    family === 'tempo'
      ? signWithTempo()
      : family === 'tron'
        ? signWithTronWallet()
        : signWithBrowserWallet()
  /** Fund the deposit address from a wallet on the source network; any wallet also works. */
  const fundWithWallet = () =>
    task(async () => {
      setFunding(true)
      try {
        await fund()
      } finally {
        setFunding(false)
      }
    })
  const fund = async () => {
    const to = String(created?.data.address ?? '')
    const token = route.sourceToken.tokenKey.split(':').at(-1) ?? ''
    const amount = requiredSource
    const onHash = (hash: string) => {
      setHashes([hash])
      setUncertain(false)
    }
    const onBroadcast = () => setUncertain(true)
    try {
      if (family === 'tempo') {
        if (!tempoChainId) return
        const result = await sendCalls.mutateAsync({
          calls: [
            {
              to: token as `0x${string}`,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [to as `0x${string}`, amount],
              }),
            },
          ],
          chainId: tempoChainId,
          // The docs wallet config sponsors testnet fees; the sender pays fees on mainnet.
          capabilities: { feePayer: false },
        })
        const hash = result.receipts?.[0]?.transactionHash
        if (hash) onHash(hash)
        if (result.status !== 'success') throw new SourceRevertedError()
      } else if (family === 'evm') {
        if (!evmWallet) throw new Error('Open this page in a browser with an EVM wallet to send.')
        const chainId = Number(sourceChainId)
        const hash = await sendEvmCall(wagmiConfig, {
          connector: evmWallet,
          chainId,
          call: evmTokenTransfer(token, to, amount),
          // Deposit addresses take funds at any time, so the transfer has no expiry.
          expiresAt: null,
          onHash,
          onBroadcast,
        })
        await waitForEvmCall(wagmiConfig, chainId, hash)
      } else if (family === 'tron') {
        if (!tronWallet) throw new Error('Install a Tron wallet, such as TronLink, to send.')
        const txid = await sendTronCall(
          tronWallet,
          undefined,
          trc20Transfer(token, to, amount),
          onBroadcast,
        )
        onHash(txid)
        await waitForTronReceipt(txid)
      } else if (family === 'solana') {
        if (!solanaWallet) throw new Error('Install a Solana wallet, such as Phantom, to send.')
        const sent = await sendSplToken({
          wallet: solanaWallet,
          mint: token,
          decimals: sourceDecimals,
          to,
          amount,
          onBroadcast,
        })
        onHash(sent.signature)
        await waitForSolanaSignature(sent.signature, sent.lastValidBlockHeight)
      }
    } catch (e) {
      if (isRejection(e)) setUncertain(false)
      if (e instanceof SourceRevertedError || e instanceof TronRevertedError) setReverted(true)
      throw e
    }
  }
  async function readDeposits() {
    const result = await call({
      method: 'GET',
      path: '/deposits',
      query: { depositAddress: created?.data.address, limit: 50 },
    })
    const rows = Array.isArray(result.data.data)
      ? (result.data.data as Record<string, unknown>[])
      : []
    setDeposits(rows)
    if (rows.length === 1) setDepositId(String(rows[0].id))
  }
  async function readStatus() {
    setStatus(
      await call({
        method: 'GET',
        path: isTransfer ? `/transfers/${id}` : `/deposits/${depositId}`,
      }),
    )
  }
  // Background checks keep the step buttons free; an error pauses them until the reader retries.
  const poll = (read: () => Promise<void>) => async () => {
    try {
      await read()
      setPollError('')
      setCheckedAt(new Date().toLocaleTimeString())
      setPolls((n) => n + 1)
    } catch (e) {
      setPollError(e instanceof Error ? e.message : 'Request failed.')
    }
  }
  const pollTimeout = () =>
    setPollError('Stopped checking after 30 minutes. Check again to resume.')
  const watchingDeposit =
    step === 3 &&
    !isTransfer &&
    created?.data.status === 'active' &&
    !(deposits && deposits.length > 1) &&
    !pollError
  const tracking = step === 4 && !finalStatuses.has(String(current?.status ?? '')) && !pollError
  usePolling(watchingDeposit, poll(readDeposits), pollTimeout)
  usePolling(tracking, poll(readStatus), pollTimeout)
  const findDeposit = () => {
    setPollError('')
    return task(readDeposits)
  }
  const checkStatus = () => {
    setPollError('')
    return task(readStatus)
  }
  const recheck = (
    <Demo.Button
      type="button"
      disabled={sourceBalance.isFetching}
      onClick={() => void sourceBalance.refetch()}
    >
      {sourceBalance.isFetching ? 'Checking…' : 'Recheck balance'}
    </Demo.Button>
  )
  const hasKey = !!apiKey.trim()
  const pricingNote = (
    <>
      Add your Tempo API key{' '}
      <button type="button" onClick={onNeedKey} {...quietLink()}>
        here
      </button>{' '}
      to create routes with configured pricing. Get yours in the{' '}
      <a href={consoleApiKeysUrl} target="_blank" rel="noreferrer" {...quietLink()}>
        Tempo API console
      </a>
      .
    </>
  )
  const amountToken =
    isTransfer && mode === 'exactDestination' ? route.destinationToken : route.sourceToken
  // Every address field can be filled from a wallet on its network: Tempo Wallet (the Tempo
  // accounts SDK) on Tempo, wagmi's browser wallets on other EVM networks, and Tron and Solana
  // wallets on theirs. Connecting only shares an address; nothing is signed.
  const [connectedAddresses, setConnectedAddresses] = useState<Record<string, string>>({})
  // The field whose wallet choices are showing, when the network has more than one wallet.
  const [choosingWallet, setChoosingWallet] = useState<string>()
  const tempoChainFor = (chainId: string) =>
    chains.find((c) => tempoChainIds.has(c.id) && `eip155:${c.id}` === chainId)
  type FieldWallet = { id: string; name: string; connect: () => Promise<string | undefined> }
  const walletsFor = (chainId: string): FieldWallet[] => {
    const tempoChain = tempoChainFor(chainId)
    if (tempoChain)
      return tempoWallet
        ? [
            {
              id: tempoWallet.id,
              name: 'Tempo Wallet',
              connect: async () =>
                tempoAccount ??
                (await connect.connectAsync({ connector: tempoWallet, chainId: tempoChain.id }))
                  .accounts[0],
            },
          ]
        : []
    if (chainId === tronMainnet)
      return tronWallets.map((w) => ({
        id: w.id,
        name: w.name,
        connect: () => connectTronAccount(w),
      }))
    if (chainId === solanaMainnet)
      return solanaWallets.map((w) => ({
        id: w.name,
        name: w.name,
        connect: () => connectSolanaAccount(w),
      }))
    if (chainId.startsWith('eip155:'))
      return evmWallets.map((w) => ({
        id: w.id,
        name: w.name,
        connect: () => connectEvmAccount(wagmiConfig, w),
      }))
    return []
  }
  const addressField = (options: {
    id: string
    label: string
    chainId: string
    value: string
    onChange: (value: string) => void
    disabled: boolean
    placeholder: string
    /** Span both columns of the field grid on wider screens. */
    wide?: boolean
  }) => {
    const wallets = walletsFor(options.chainId)
    const connected =
      !!options.value &&
      connectedAddresses[options.id]?.toLowerCase() === options.value.toLowerCase()
    const blocked = options.disabled || connect.isPending
    // The chosen wallet also signs later steps on this network.
    const fill = (wallet: FieldWallet) =>
      task(async () => {
        setChoosingWallet(undefined)
        setWalletId(wallet.id)
        const address = await wallet.connect()
        if (!address) return
        options.onChange(address)
        setConnectedAddresses((current) => ({ ...current, [options.id]: address }))
      })
    return (
      <div {...cx(labelStyle(), options.wide && wideField())}>
        {/* The connect controls sit beside the label, so the label still names the input. */}
        <span>
          <label htmlFor={options.id}>{options.label}</label>
          {wallets.length > 0 &&
            (connected ? (
              ' (Connected)'
            ) : choosingWallet === options.id ? (
              <>
                {' · Connect with '}
                {wallets.map((wallet, index) => (
                  <span key={wallet.id}>
                    {index > 0 && ' · '}
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => void fill(wallet)}
                      {...connectLink()}
                    >
                      {wallet.name}
                    </button>
                  </span>
                ))}
              </>
            ) : (
              <>
                {' '}
                <button
                  type="button"
                  title={wallets.length === 1 ? `Fill in from ${wallets[0].name}` : undefined}
                  disabled={blocked}
                  onClick={() =>
                    wallets.length === 1 ? void fill(wallets[0]) : setChoosingWallet(options.id)
                  }
                  {...connectLink()}
                >
                  (Connect)
                </button>
              </>
            ))}
        </span>
        <input
          id={options.id}
          {...inputStyle()}
          autoComplete="off"
          disabled={options.disabled}
          value={options.value}
          onChange={(e) => options.onChange(e.target.value)}
          placeholder={options.placeholder}
        />
      </div>
    )
  }
  const walletLabel = (chain: { id: string; name: string }, role: string) =>
    tempoChainFor(chain.id) ? `Tempo ${role} wallet` : `${chain.name} wallet address`
  const recipientField = (disabled: boolean, wide?: boolean) =>
    addressField({
      id: 'routes-recipient',
      label: `Recipient on ${route.destinationChain.name}`,
      chainId: route.destinationChain.id,
      value: recipient,
      onChange: setRecipient,
      disabled,
      placeholder: walletLabel(route.destinationChain, 'destination'),
      wide,
    })
  const tempoSignIn = (
    <Demo.Button
      variant="accent"
      type="button"
      disabled={!tempoWallet || connect.isPending}
      onClick={async () => {
        await disconnect.disconnectAsync().catch(() => {})
        connect.connect({ connector: tempoWallet, chainId: tempoChainId })
      }}
    >
      {connect.isPending ? 'Check prompt' : 'Sign in with Tempo'}
    </Demo.Button>
  )
  // A choice only when this browser has more than one wallet for the source network.
  const walletPicker = walletOptions.length > 1 && (
    <label {...labelStyle()} htmlFor="routes-wallet">
      Wallet
      <Select
        id="routes-wallet"
        value={
          family === 'solana'
            ? solanaWallet?.name
            : (family === 'tron' ? tronWallet : evmWallet)?.id
        }
        disabled={busy || hashes.length > 0}
        onChange={(e) => setWalletId(e.target.value)}
      >
        {walletOptions.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </Select>
    </label>
  )
  const signAction = !action.success ? null : shortfall && hashes.length === 0 ? (
    recheck
  ) : confirmedCalls === calls.length && hashes.length > 0 ? (
    <Demo.Button
      variant="accent"
      type="button"
      disabled={busy}
      onClick={() => void task(() => register(hashes))}
    >
      Register transaction
    </Demo.Button>
  ) : family === 'tempo' && !tempoAccount ? (
    tempoSignIn
  ) : (
    <Demo.Button
      variant="accent"
      type="button"
      disabled={busy || uncertain || reverted}
      onClick={() => void signAndSend()}
    >
      Sign and send
    </Demo.Button>
  )
  // One line that follows the wallet: what to do now, and what is happening.
  const total = family === 'tempo' ? 1 : calls.length
  const sent = hashes.filter(Boolean).length
  const nth = (i: number) => (total > 1 ? `transaction ${i + 1} of ${total}` : 'the transaction')
  const capitalized = (text: string) => text[0].toUpperCase() + text.slice(1)
  const signStatus = registering
    ? 'Registering the transaction with Routes…'
    : !busy
      ? undefined
      : uncertain
        ? `Approve ${nth(sent)} in ${walletName}.`
        : sent > confirmedCalls
          ? `${capitalized(nth(confirmedCalls))} sent. Confirming on ${route.sourceChain.name}…`
          : `Check ${walletName} to continue.`
  const fundStatus = !funding
    ? undefined
    : uncertain
      ? `Approve the transfer in ${walletName}.`
      : hashes.length > 0
        ? `Sent. Confirming on ${route.sourceChain.name}…`
        : `Check ${walletName} to continue.`
  const signNote = !action.success
    ? 'This route returned an action this demo cannot sign.'
    : tempoChainId && tempoAccount && tempoAccount.toLowerCase() !== sender.toLowerCase()
      ? `Signed in as ${Demo.StringFormatter.truncate(tempoAccount)}, not the sender. Sign in with the sender account.`
      : `${walletName ?? 'Your wallet'} signs ${
          family === 'tempo'
            ? 'every call in one transaction'
            : calls.length === 1
              ? 'one transaction'
              : `${calls.length} transactions`
        } from the sender${family !== 'tempo' && calls.length > 1 ? ', one at a time' : ''}.`
  const instructions =
    current?.status === 'completed' && quoteParams && body
      ? agentInstructions({
          route,
          method,
          mode,
          amount,
          amountToken,
          subsidize: !!input.subsidize,
          quoteQuery: quoteParams,
          createBody: body,
          addresses: { sender, recipient, refundAddress },
          outcome: {
            deliveredAmount: quantity(current.destinationAmount),
            destinationHash: (current.destinationTransactionHashes as string[] | undefined)?.[0],
          },
        })
      : undefined
  const reportInstructions = useRef(onInstructions)
  reportInstructions.current = onInstructions
  useEffect(() => {
    reportInstructions.current(instructions)
  }, [instructions])
  useEffect(() => () => reportInstructions.current(undefined), [])
  const reason = current?.statusReason as { code?: string; message?: string } | undefined
  const delivered = (current?.destinationTransactionHashes as string[] | undefined)?.[0]

  return (
    <div {...stepsLayout({ className: 'routes-test-lifecycle' })}>
      <div {...cx(stepList(), stepColumn())}>
        <Demo.Step
          number={2}
          title="Get a quote"
          active={step === 1}
          completed={!!quote}
          error={errorFor(1)}
          actions={
            quote && !creation.current ? (
              <Demo.Button type="button" disabled={busy} onClick={editQuote}>
                Edit
              </Demo.Button>
            ) : null
          }
        >
          {quote ? (
            <QuoteSummary data={terms ?? quote.data} route={route} />
          ) : (
            <div {...stepForm()}>
              <div {...fieldGrid()}>
                {isTransfer && (route.capabilities.transfer?.modes.length ?? 0) > 1 && (
                  <label {...cx(labelStyle(), wideField())} htmlFor="routes-amount-mode">
                    Amount mode
                    <Select
                      id="routes-amount-mode"
                      disabled={frozen}
                      value={mode}
                      onChange={(e) => setMode(e.target.value as TestMode)}
                    >
                      {route.capabilities.transfer?.modes.map((m) => (
                        <option key={m} value={m}>
                          {m === 'exactSource' ? 'Amount sent' : 'Amount received'}
                        </option>
                      ))}
                    </Select>
                  </label>
                )}
                <label {...labelStyle()}>
                  Amount ({amountToken.symbol})
                  <input
                    {...inputStyle()}
                    inputMode="decimal"
                    disabled={frozen}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.00"
                  />
                </label>
                {isTransfer && (
                  <>
                    {addressField({
                      id: 'routes-sender',
                      label: `Sender on ${route.sourceChain.name}`,
                      chainId: route.sourceChain.id,
                      value: sender,
                      onChange: setSender,
                      disabled: frozen,
                      placeholder: walletLabel(route.sourceChain, 'source'),
                    })}
                    {recipientField(frozen, true)}
                  </>
                )}
              </div>
              {(balance !== undefined || (amount && quoteValidation)) && (
                <p {...noteStyle()}>
                  {balance !== undefined &&
                    `Balance: ${formatUnits(balance, sourceDecimals)} ${sourceSymbol}${shortfall ? ' (not enough for this amount)' : ''}. `}
                  {amount && quoteValidation}
                </p>
              )}
              <Demo.Button
                variant="accent"
                type="button"
                disabled={!quoteParams || busy}
                onClick={() => void getQuote()}
              >
                {busy ? 'Quoting…' : 'Get quote'}
              </Demo.Button>
            </div>
          )}
        </Demo.Step>
        <Demo.Step
          number={3}
          title={isTransfer ? 'Create the transfer' : 'Create a deposit address'}
          active={step === 2}
          completed={!!created}
          error={errorFor(2)}
          actions={
            step !== 2 || !isTransfer ? null : shortfall ? (
              recheck
            ) : !hasKey ? null : (
              <Demo.Button
                variant="accent"
                type="button"
                disabled={busy}
                onClick={() => void create()}
              >
                {busy ? 'Creating…' : creation.current && !created ? 'Retry' : 'Create'}
              </Demo.Button>
            )
          }
        >
          {step === 2 && isTransfer && !hasKey && (
            <p {...cx(stepBody(), noteStyle())}>{pricingNote}</p>
          )}
          {step === 2 && !isTransfer && (
            <div {...stepForm()}>
              <p {...bodyText()}>
                Routes creates a {route.sourceChain.name} address for this route.{' '}
                {route.sourceToken.symbol} sent to it lands automatically as{' '}
                {route.destinationToken.symbol} in the {route.destinationChain.name} wallet below.
              </p>
              <div {...fieldGrid()}>
                {recipientField(!!creation.current || busy)}
                {addressField({
                  id: 'routes-refund',
                  label: `Refund address on ${route.sourceChain.name}`,
                  chainId: route.sourceChain.id,
                  value: refundAddress,
                  onChange: setRefundAddress,
                  disabled: !!creation.current || busy,
                  placeholder: 'Where refunds go',
                })}
              </div>
              {(recipient || refundAddress) && validation && <p {...noteStyle()}>{validation}</p>}
              {!hasKey && <p {...noteStyle()}>{pricingNote}</p>}
              {hasKey && (
                <Demo.Button
                  variant="accent"
                  type="button"
                  disabled={!body || busy}
                  onClick={() => void create()}
                >
                  {busy ? 'Creating…' : creation.current && !created ? 'Retry' : 'Create'}
                </Demo.Button>
              )}
            </div>
          )}
          {cautionFor(2)}
          {created && (
            <ReferenceLink
              id={id}
              href={
                isTransfer
                  ? '/docs/api/routes/transfers#getroutestransfer'
                  : '/docs/api/routes/deposit-addresses#getroutesdepositaddress'
              }
            />
          )}
        </Demo.Step>
        {isTransfer ? (
          <Demo.Step
            number={4}
            title="Sign and send"
            active={step === 3}
            completed={registered}
            error={errorFor(3)}
            actions={step === 3 ? signAction : null}
          >
            {step === 3 && (
              <p
                role="status"
                {...cx(stepBody(), !!signStatus && statusText(), !signStatus && noteStyle())}
              >
                {signStatus ?? signNote}
              </p>
            )}
            {cautionFor(3)}
            {step === 3 && walletPicker && <div {...stepBody()}>{walletPicker}</div>}
            {hashes.length > 0 && (
              <div {...hashList()}>
                {hashes.map((hash) => (
                  <TransactionHash key={hash} chainId={route.sourceChain.id} hash={hash} />
                ))}
              </div>
            )}
          </Demo.Step>
        ) : (
          <Demo.Step
            number={4}
            title="Fund the address"
            active={step === 3}
            completed={!!depositId}
            error={errorFor(3)}
            actions={
              step === 3 ? (
                <Demo.Button
                  type="button"
                  disabled={busy || created?.data.status !== 'active'}
                  onClick={() => void findDeposit()}
                >
                  {busy ? 'Checking…' : 'Check now'}
                </Demo.Button>
              ) : null
            }
          >
            {step === 3 && created && (
              <div {...fundBody()}>
                <p {...bodyText()}>
                  Send {amount} {sourceSymbol} to this {route.sourceChain.name} address. It lands
                  automatically as {route.destinationToken.symbol} on {route.destinationChain.name}.
                </p>
                <div {...depositAddress()}>
                  <span {...depositAddressText()}>{String(created.data.address ?? '')}</span>
                  <CopyButton text={String(created.data.address ?? '')} />
                </div>
                {created.data.status !== 'active' ? (
                  <p role="alert" {...errorText()}>
                    This address is not active. Do not fund it.
                  </p>
                ) : (
                  family && (
                    <div {...fundActions()}>
                      {walletPicker}
                      {family === 'tempo' && !tempoAccount ? (
                        tempoSignIn
                      ) : walletName ? (
                        <Demo.Button
                          variant="accent"
                          type="button"
                          disabled={busy || uncertain || reverted || hashes.length > 0}
                          onClick={() => void fundWithWallet()}
                        >
                          {hashes.length > 0 ? 'Sent' : `Send with ${walletName}`}
                        </Demo.Button>
                      ) : (
                        <p {...noteStyle()}>
                          Send from any {route.sourceChain.name} wallet. This browser has none to
                          send from here.
                        </p>
                      )}
                    </div>
                  )
                )}
                {fundStatus && (
                  <p role="status" {...statusText()}>
                    {fundStatus}
                  </p>
                )}
                {hashes.map((hash) => (
                  <TransactionHash key={hash} chainId={route.sourceChain.id} hash={hash} />
                ))}
                {watchingDeposit && !fundStatus && (
                  <p role="status" {...cx(pollingNote(), noteStyle())}>
                    <PollRing key={polls} durationMs={pollIntervalMs} />
                    Watching for your deposit
                  </p>
                )}
                {deposits && deposits.length > 1 && (
                  <label {...labelStyle()} htmlFor="routes-deposit">
                    Choose the deposit you sent
                    <Select
                      id="routes-deposit"
                      value={depositId}
                      onChange={(e) => setDepositId(e.target.value)}
                    >
                      <option value="">Select a deposit</option>
                      {deposits.map((d) => (
                        <option key={String(d.id)} value={String(d.id)}>
                          {quantity(d.sourceAmount)} {sourceSymbol} · {String(d.status)}
                        </option>
                      ))}
                    </Select>
                  </label>
                )}
              </div>
            )}
            {!isTransfer && cautionFor(3)}
            {depositId && step === 4 && (
              <ReferenceLink
                id={depositId}
                href="/docs/api/routes/deposit-addresses#getroutesdeposit"
              />
            )}
          </Demo.Step>
        )}
        <Demo.Step
          number={5}
          title="Track delivery"
          active={step === 4}
          completed={current?.status === 'completed'}
          error={errorFor(4)}
          actions={
            step === 4 && pollError ? (
              <Demo.Button type="button" disabled={busy} onClick={() => void checkStatus()}>
                Refresh
              </Demo.Button>
            ) : null
          }
        >
          {step === 4 && (
            <div {...trackBody()} role="status">
              <p {...bodyText()}>
                {current?.status === 'completed'
                  ? `Delivered ${quantity(current.destinationAmount)} ${route.destinationToken.symbol}.`
                  : `Status: ${String(current?.status ?? 'checking')}.`}{' '}
                {reason?.message ?? reason?.code}
              </p>
              {tracking && (
                <p {...cx(pollingNote(), noteStyle())}>
                  <PollRing key={polls} durationMs={pollIntervalMs} />
                  Checking for updates
                </p>
              )}
              {delivered && (
                <TransactionHash chainId={route.destinationChain.id} hash={delivered} />
              )}
            </div>
          )}
        </Demo.Step>
      </div>
      <ApiLog
        calls={apiCalls}
        busy={busy}
        referenceHref={
          isTransfer ? '/docs/api/routes/transfers' : '/docs/api/routes/deposit-addresses'
        }
      />
    </div>
  )
}

const finalStatuses = new Set(['completed', 'refunded', 'action-required', 'expired'])
const pollIntervalMs = 6_000

/** A ring that fills over one polling interval and starts again at each check. */
function PollRing({ durationMs }: { durationMs: number }) {
  const ring = useRef<SVGCircleElement>(null)
  const circumference = 2 * Math.PI * 7
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animation = ring.current?.animate(
      [{ strokeDashoffset: circumference }, { strokeDashoffset: 0 }],
      { duration: reduced ? 0 : durationMs, easing: 'linear', fill: 'forwards' },
    )
    return () => animation?.cancel()
  }, [durationMs, circumference])
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" {...pollRing()}>
      <circle cx="9" cy="9" r="7" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      <circle
        ref={ring}
        cx="9"
        cy="9"
        r="7"
        fill="none"
        stroke="var(--color-blue9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
    </svg>
  )
}

/**
 * An ID that opens its read operation in the API reference. The playground cannot take the ID
 * from the link, so a click also copies it, ready to paste as the `id` parameter.
 */
function ReferenceLink({ id, href }: { id: string; href: string }) {
  const [copied, copy] = Demo.useCopyToClipboard()
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title="Open in the API reference. The ID is copied to paste as the id parameter."
      onClick={() => void copy(id)}
      {...referenceLink()}
    >
      {id} ↗{copied && <span {...copiedNote()}>Copied</span>}
    </a>
  )
}

/** Opens the agent instructions as plain text in a new tab. */
function InstructionsLink({ markdown }: { markdown?: string }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!markdown) return setUrl(undefined)
    const next = URL.createObjectURL(new Blob([markdown], { type: 'text/plain;charset=utf-8' }))
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [markdown])
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" {...accentLink()}>
      Instructions for an AI agent ↗
    </a>
  ) : (
    <span />
  )
}

/** Run `poll` now and every `intervalMs` while enabled, without overlap; give up after `maxRuns`. */
function usePolling(
  enabled: boolean,
  poll: () => Promise<void>,
  onTimeout: () => void,
  { intervalMs = pollIntervalMs, maxRuns = 300 } = {},
) {
  const latest = useRef({ poll, onTimeout })
  latest.current = { poll, onTimeout }
  useEffect(() => {
    if (!enabled) return
    let stopped = false
    let runs = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const run = async () => {
      if (stopped) return
      if (++runs > maxRuns) return latest.current.onTimeout()
      await latest.current.poll()
      if (!stopped) timer = setTimeout(run, intervalMs)
    }
    void run()
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [enabled, intervalMs, maxRuns])
}

type Fee = { amount?: { formatted?: string }; token?: { symbol?: string } }
const feeDigits = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 })

/** The quote as a receipt: what is sent, what arrives, and the fees the API lists. */
function QuoteSummary({ data, route }: { data: Record<string, unknown>; route: TestRoute }) {
  const subsidized = data.subsidize === true
  const { decimals, symbol } = route.destinationToken
  const delivery = subsidized ? subsidizedDelivery(data, decimals) : undefined
  const received = delivery
    ? formatUnits(delivery.guaranteed, decimals)
    : quantity(data.destinationAmount)
  const fees = Array.isArray(data.fees) ? (data.fees as Fee[]) : []
  return (
    <dl {...quoteSummary()}>
      <Row label="You send">
        {quantity(data.sourceAmount)} {route.sourceToken.symbol}
      </Row>
      <Row label="Recipient gets">
        {received} {symbol}
      </Row>
      {fees.length === 0 ? (
        <Row label="Fees">None</Row>
      ) : (
        fees.map((fee, index) => (
          <Row key={`${fee.token?.symbol}-${index}`} label="Fee">
            {fee.amount?.formatted ? feeDigits.format(Number(fee.amount.formatted)) : '—'}{' '}
            {fee.token?.symbol}
          </Row>
        ))
      )}
    </dl>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div {...summaryRow()}>
      <dt {...summaryLabel()}>{label}</dt>
      <dd {...summaryValue()}>{children}</dd>
    </div>
  )
}

/** A source or destination hash, linked when its network has an explorer this page knows. */
function TransactionHash({ chainId, hash }: { chainId: string; hash: string }) {
  const explorer = explorers[chainId]
  const label = Demo.StringFormatter.truncate(hash)
  return explorer ? (
    <a href={explorer(hash)} target="_blank" rel="noreferrer" {...hashLink()}>
      {label} ↗
    </a>
  ) : (
    <p {...hashText()}>{label}</p>
  )
}

const headerTitle = style({ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.medium })
const headerActions = style({
  // design-exception: An auto margin pushes the key pill to the end of the header row.
  marginInlineStart: 'auto !custom',
})
const footerRow = style({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
})
// The playground sizes its layout to its own width, so it fits narrow and wide docs columns.
const tester = style({
  containerType: 'inline-size',
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['5'],
    },
  },
})
// The steps, with the API log beside them once the playground is wide enough.
const stepsLayout = style({
  display: 'grid',
  gap: tokens.spacing['6'],
  '@container (width >= 48rem)': {
    gridTemplateColumns: 'minmax(0, 1fr) 20rem',
    alignItems: 'flex-start',
  },
})
const stepList = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['6'],
    },
  },
})
const stepColumn = style({ minWidth: 0 })
const stepBody = style({ marginBlockStart: tokens.spacing['3'] })
const stepForm = style({
  marginBlockStart: tokens.spacing['3'],
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
const fieldGrid = style({
  display: 'grid',
  gap: tokens.spacing['3'],
  '@media (width >= 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
})
const wideField = style({ '@media (width >= 40rem)': { gridColumn: 'span 2 / span 2' } })
const fundBody = style({
  marginBlockStart: tokens.spacing['3'],
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
const trackBody = style({
  marginBlockStart: tokens.spacing['3'],
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['1'],
    },
  },
})
const hashList = style({
  marginBlockStart: tokens.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['1'],
    },
  },
})
const errorRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
const fundActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: tokens.spacing['3'],
})
const bodyText = style({ fontSize: tokens.fontSize.sm, color: inherited.color.textColorPrimary })
const statusText = style({
  fontSize: tokens.fontSize.compact,
  color: inherited.color.textColorPrimary,
})
// A caution asks the reader to check something first; only failures use the destructive color.
const cautionText = style({ fontSize: tokens.fontSize.compact, color: tokens.color.amber11 })
const errorText = style({
  fontSize: tokens.fontSize.compact,
  color: inherited.color.textColorDestructive,
})
const pollingNote = style({ display: 'flex', alignItems: 'center', gap: tokens.spacing['2'] })
const pollRing = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  rotate: '-90deg',
})
const depositAddress = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  borderRadius: tokens.radius.md,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  paddingBlock: tokens.spacing['2'],
  paddingInline: tokens.spacing['3'],
})
const depositAddressText = style({
  minWidth: 0,
  flex: 1,
  wordBreak: 'break-all',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.compact,
  color: inherited.color.textColorPrimary,
})
const accentLink = style({
  color: inherited.color.textColorAccent,
  '@media (hover: hover)': { ':hover': { textDecorationLine: 'underline' } },
})
// The (Connect) controls beside an address label read as links.
const connectLink = style({
  color: inherited.color.textColorAccent,
  ':disabled': { opacity: 0.6 },
  '@media (hover: hover)': {
    ':hover': { textDecorationLine: 'underline' },
    selectors: { '&:disabled:hover': { textDecorationLine: 'none' } },
  },
})
// A link inside a note: grey and underlined, so it reads as part of the sentence.
const quietLink = style({
  color: tokens.color.gray11,
  textDecorationLine: 'underline',
  textUnderlineOffset: '2px',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (hover: hover)': { ':hover': { color: inherited.color.textColorPrimary } },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
const hashLink = style({
  display: 'block',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  color: inherited.color.textColorAccent,
  '@media (hover: hover)': { ':hover': { textDecorationLine: 'underline' } },
})
const hashText = style({
  wordBreak: 'break-all',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray10,
})
const referenceLink = style({
  marginBlockStart: tokens.spacing['3'],
  display: 'block',
  wordBreak: 'break-all',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  color: inherited.color.textColorAccent,
  '@media (hover: hover)': { ':hover': { textDecorationLine: 'underline' } },
})
const copiedNote = style({
  marginInlineStart: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  color: tokens.color.gray10,
})
const quoteSummary = style({
  marginBlockStart: tokens.spacing['3'],
  maxWidth: '28rem',
  selectors: {
    ':where(& > :not(:last-child))': {
      borderBlockStartWidth: tokens.borderWidth.none,
      borderBlockEndWidth: tokens.borderWidth.hairline,
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: tokens.color.line,
    },
  },
})
const summaryRow = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: tokens.spacing['4'],
  paddingBlock: tokens.spacing['2'],
  ':first-child': { paddingBlockStart: 0 },
  ':last-child': { paddingBlockEnd: 0 },
})
const summaryLabel = style({ fontSize: tokens.fontSize.compact, color: tokens.color.gray10 })
const summaryValue = style({
  textAlign: 'right',
  fontSize: tokens.fontSize.sm,
  color: inherited.color.textColorPrimary,
  fontVariantNumeric: 'tabular-nums',
})

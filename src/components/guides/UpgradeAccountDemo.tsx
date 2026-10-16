'use client'

import * as React from 'react'
import type { Hex } from 'viem'
import { Container } from '../Container'
import * as ui from './AccountDemo.recipes'
import { Button, FAKE_RECIPIENT, Step, StringFormatter } from './Demo'

type Address = `0x${string}`
type Action = 'create' | 'fund' | 'pay' | 'upgrade' | 'alone' | 'both'
type Result = { hash?: Hex; message: string; ok: boolean }
type Owner = { owner: Address; weight: number }

type Demo = NonNullable<Awaited<ReturnType<typeof loadDemo>>>
type SigningAccount = Parameters<Demo['client']['token']['transferSync']>[0]['account']

const multisig: Address = '0xAACC000000000000000000000000000000000000'
const threshold = 2

/** Loaded only after the devnet answers, so viem's Tempo modules stay off pages that can't use it. */
async function loadDemo() {
  const devnet = await import('./account-sandbox-devnet')
  if (!(await devnet.probeDevnet())) return null
  const [viem, accounts, Tempo] = await Promise.all([
    import('viem'),
    import('viem/accounts'),
    import('viem/tempo'),
  ])
  return {
    client: Tempo.createClient({
      chain: Tempo.Chain.devnet,
      feeToken: devnet.devnetToken,
      transport: Tempo.http(devnet.devnetRpcUrl, { retryCount: 0 }),
    }),
    token: devnet.devnetToken,
    fromSecp256k1: (privateKey: Hex) => Tempo.Account.fromSecp256k1(privateKey),
    fromConfig: Tempo.Account.fromConfig,
    generatePrivateKey: accounts.generatePrivateKey,
    upgradeAbi: viem.parseAbi([
      'function upgradeAccount(uint8 threshold, (address owner, uint8 weight)[] owners) returns (bytes32)',
    ]),
    // The configuration salt Tempo assigns an upgraded account.
    upgradeSalt: (address: Address) =>
      viem.keccak256(viem.concat([viem.toHex('tempo:multisig:upgrade'), address])),
  }
}

/**
 * Start with a plain private-key account, fund it, then upgrade it in place to a configurable
 * account with two signers. Every step is a real transaction on the Tempo Accounts devnet.
 */
export function UpgradeAccountDemo() {
  const [preview, setPreview] = React.useState<Demo | null | undefined>(undefined)
  const [keys, setKeys] = React.useState<{ original: Hex; backup: Hex } | null>(null)
  const [balance, setBalance] = React.useState<string | null>(null)
  const [upgraded, setUpgraded] = React.useState(false)
  const [results, setResults] = React.useState<Partial<Record<Action, Result>>>({})
  const [pending, setPending] = React.useState<Action | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const busy = React.useRef(false)

  React.useEffect(() => {
    loadDemo()
      .then(setPreview)
      .catch(() => setPreview(null))
  }, [])

  const original = React.useMemo(
    () => (preview && keys ? preview.fromSecp256k1(keys.original) : null),
    [preview, keys],
  )

  async function refresh() {
    if (!preview || !original) return
    const next = await preview.client.token.getBalance({
      account: original.address,
      token: preview.token,
    })
    setBalance(next.formatted)
  }

  async function run(action: Action, work: () => Promise<Result | undefined>) {
    if (busy.current) return
    busy.current = true
    setPending(action)
    setError(null)
    try {
      const result = await work()
      if (result) setResults((current) => ({ ...current, [action]: result }))
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message.split('\n')[0] : 'Something went wrong.')
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  function create() {
    if (!preview) return Promise.resolve(undefined)
    setKeys({ original: preview.generatePrivateKey(), backup: preview.generatePrivateKey() })
    setBalance(null)
    setUpgraded(false)
    setResults({})
    return Promise.resolve(undefined)
  }

  async function fund() {
    if (!preview || !original) return
    await preview.client.faucet.fundSync({ account: original.address })
    return { message: 'Funded from the devnet faucet.', ok: true }
  }

  async function pay(account: SigningAccount) {
    if (!preview) throw new Error('Devnet isn’t ready.')
    const { receipt } = await preview.client.token.transferSync({
      account,
      amount: 1_000_000n,
      to: FAKE_RECIPIENT,
      token: preview.token,
    })
    return receipt.transactionHash
  }

  function owners(): Owner[] {
    if (!preview || !keys || !original) return []
    const backup = preview.fromSecp256k1(keys.backup)
    // Tempo requires signers sorted by address.
    return [original.address, backup.address]
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map((owner) => ({ owner, weight: 1 }))
  }

  async function upgrade() {
    if (!preview || !original) return
    const { transactionHash } = await preview.client.writeContractSync({
      account: original,
      address: multisig,
      abi: preview.upgradeAbi,
      functionName: 'upgradeAccount',
      args: [threshold, owners()],
    })
    setUpgraded(true)
    return {
      hash: transactionHash,
      message: 'Upgraded: 2 signers, threshold 2, same address.',
      ok: true,
    }
  }

  async function payAlone() {
    if (!original) return
    try {
      const hash = await pay(original)
      return { hash, message: 'Unexpectedly accepted.', ok: false }
    } catch (cause) {
      // Tempo rejects the retired root key with "primitive root key retired".
      const reason =
        cause instanceof Error
          ? `${cause.message} ${String((cause as { details?: unknown }).details ?? '')}`
          : ''
      if (!/root key retired/i.test(reason)) throw cause
      return {
        message: 'Rejected by Tempo: the original key can’t sign as a single-key account anymore.',
        ok: true,
      }
    }
  }

  async function payWithBoth() {
    if (!preview || !keys || !original) return
    const backup = preview.fromSecp256k1(keys.backup)
    const account = preview.fromConfig({
      address: original.address,
      owners: owners().map(({ owner, weight }) => ({
        owner: owner === original.address ? original : backup,
        weight,
      })),
      salt: preview.upgradeSalt(original.address),
      threshold,
      version: 1n,
    })
    return {
      hash: await pay(account),
      message: 'Paid 1 AlphaUSD, approved by both signers.',
      ok: true,
    }
  }

  const funded = balance !== null && Number(balance) > 0
  const disabled = !preview || pending !== null

  return (
    <Container
      headerLeft={<span {...ui.accountDemoTitle()}>Upgrade a private-key account</span>}
      footer="Real devnet transactions. The test keys live in this page’s memory only."
    >
      {preview === null ? (
        <p {...ui.accountDemoMuted()} role="status">
          This demo runs on the Tempo Accounts devnet, which this page can’t reach.
        </p>
      ) : (
        <div
          {...ui.accountDemoSteps()}
          data-testid="upgrade-account-demo"
          aria-busy={pending !== null}
        >
          <Step
            number={1}
            title="Create a private-key account"
            active
            completed={Boolean(keys)}
            actions={
              <Button
                type="button"
                variant="accent"
                disabled={disabled || Boolean(keys)}
                onClick={() => run('create', create)}
              >
                {preview === undefined ? 'Connecting…' : keys ? 'Created' : 'Create key'}
              </Button>
            }
          >
            {original && (
              <p {...ui.accountDemoAddress()}>{StringFormatter.truncate(original.address)}</p>
            )}
          </Step>

          <Step
            number={2}
            title="Fund it"
            active={Boolean(keys)}
            completed={funded}
            actions={
              <Button
                type="button"
                disabled={disabled || !keys || funded}
                onClick={() => run('fund', fund)}
              >
                {pending === 'fund' ? 'Funding…' : funded ? 'Funded' : 'Get test funds'}
              </Button>
            }
          >
            {balance !== null && <p {...ui.accountDemoNote()}>{balance} AlphaUSD</p>}
          </Step>

          <Step
            number={3}
            title="Pay 1 AlphaUSD with the private key"
            active={funded}
            completed={Boolean(results.pay)}
            actions={
              <Button
                type="button"
                disabled={disabled || !funded || upgraded || Boolean(results.pay)}
                onClick={() =>
                  run('pay', async () =>
                    original
                      ? {
                          hash: await pay(original),
                          message: 'Paid as a single-key account.',
                          ok: true,
                        }
                      : undefined,
                  )
                }
              >
                {pending === 'pay' ? 'Paying…' : 'Pay'}
              </Button>
            }
          >
            <ResultLine result={results.pay} />
          </Step>

          <Step
            number={4}
            title="Upgrade it to a configurable account"
            active={Boolean(results.pay)}
            completed={upgraded}
            actions={
              <Button
                type="button"
                variant="accent"
                disabled={disabled || !results.pay || upgraded}
                onClick={() => run('upgrade', upgrade)}
              >
                {pending === 'upgrade' ? 'Upgrading…' : upgraded ? 'Upgraded' : 'Upgrade'}
              </Button>
            }
          >
            <p {...ui.accountDemoNote()}>
              Signers: the original key (weight 1) and a new backup key (weight 1). Threshold 2.
            </p>
            <ResultLine result={results.upgrade} />
          </Step>

          <Step
            number={5}
            title="Pay with the original key alone"
            active={upgraded}
            completed={Boolean(results.alone)}
            actions={
              <Button
                type="button"
                disabled={disabled || !upgraded}
                onClick={() => run('alone', payAlone)}
              >
                {pending === 'alone' ? 'Sending…' : 'Try it'}
              </Button>
            }
          >
            <ResultLine result={results.alone} />
          </Step>

          <Step
            number={6}
            title="Pay with both signers"
            active={upgraded}
            completed={Boolean(results.both)}
            actions={
              <Button
                type="button"
                variant="accent"
                disabled={disabled || !upgraded}
                onClick={() => run('both', payWithBoth)}
              >
                {pending === 'both' ? 'Paying…' : 'Pay'}
              </Button>
            }
          >
            <ResultLine result={results.both} />
          </Step>

          {error && (
            <p role="alert" {...ui.accountDemoError()}>
              {error}
            </p>
          )}
        </div>
      )}
    </Container>
  )
}

/** Devnet has no public explorer, so show the hash itself. */
function ResultLine({ result }: { result: Result | undefined }) {
  if (!result) return null
  return (
    <p {...ui.accountDemoResult()} role="status">
      {result.message}
      {result.hash && (
        <>
          {' '}
          <code {...ui.accountDemoHash()} title={result.hash}>
            {StringFormatter.truncate(result.hash)}
          </code>
        </>
      )}
    </p>
  )
}

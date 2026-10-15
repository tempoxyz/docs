'use client'

import * as React from 'react'
import { type Hex, parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { Account, createClient, http, WebAuthnP256, WebCryptoP256 } from 'viem/tempo'
import { webAuthnRpId } from '../../wagmi.config'
import { Container } from '../Container'
import * as ui from './AccountDemo.recipes'
import { Button, FAKE_RECIPIENT, Step, StringFormatter } from './Demo'
import { alphaUsd } from './tokens'

const token = alphaUsd
const payment = parseUnits('1', 6)

type KeyType = 'passkey' | 'device' | 'private'
type Action = KeyType | 'fund' | 'pay'

const keyTypes: { type: KeyType; label: string; note: string }[] = [
  {
    type: 'passkey',
    label: 'Passkey',
    note: 'A passkey on this device. Each payment asks for it.',
  },
  {
    type: 'device',
    label: 'Device key',
    note: 'A P-256 key this browser can’t export, kept in this tab. Payments sign without a prompt.',
  },
  {
    type: 'private',
    label: 'Private key',
    note: 'A secp256k1 key, the same kind Ethereum wallets use, kept in this tab.',
  },
]

/**
 * Creates a single-key account on Moderato testnet from a passkey, a WebCrypto device key, or a
 * private key, then funds it from the faucet and pays with it. Keys live in this tab's memory.
 */
export function SingleKeyAccountDemo() {
  const [keyType, setKeyType] = React.useState<KeyType | null>(null)
  const [account, setAccount] = React.useState<Account.Account | null>(null)
  const [balance, setBalance] = React.useState<string | null>(null)
  const [paid, setPaid] = React.useState<Hex | null>(null)
  const [pending, setPending] = React.useState<Action | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const busy = React.useRef(false)

  const client = React.useMemo(
    () =>
      account &&
      createClient({
        account,
        chain: tempoModerato,
        feeToken: token,
        transport: http(tempoModerato.rpcUrls.default.http[0], { retryCount: 0 }),
      }),
    [account],
  )

  const refresh = React.useCallback(async () => {
    if (!client) return
    const next = await client.token.getBalance({ account: client.account.address, token })
    setBalance(next.formatted)
  }, [client])

  React.useEffect(() => {
    refresh().catch(() => setError('Could not read the testnet balance.'))
  }, [refresh])

  async function run(action: Action, work: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    setPending(action)
    setError(null)
    try {
      await work()
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.')
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  async function create(type: KeyType) {
    const next =
      type === 'passkey'
        ? Account.fromWebAuthnP256(
            await WebAuthnP256.createCredential({ label: 'Tempo docs demo', rpId: webAuthnRpId }),
            { rpId: webAuthnRpId },
          )
        : type === 'device'
          ? Account.fromWebCryptoP256(await WebCryptoP256.createKeyPair())
          : Account.fromSecp256k1(generatePrivateKey())
    setKeyType(type)
    setAccount(next)
    setBalance(null)
    setPaid(null)
  }

  async function fund() {
    if (!client) return
    await client.faucet.fundSync({ account: client.account.address, timeout: 60_000 })
  }

  async function pay() {
    if (!client) return
    const { receipt } = await client.token.transferSync({
      amount: payment,
      to: FAKE_RECIPIENT,
      token,
    })
    setPaid(receipt.transactionHash)
  }

  const funded = balance !== null && Number(balance) > 0
  const disabled = pending !== null
  const chosen = keyTypes.find((item) => item.type === keyType)
  const explorer = tempoModerato.blockExplorers.default.url

  return (
    <Container
      headerLeft={<span {...ui.accountDemoTitle()}>Create a single-key account</span>}
      headerRight={<span {...ui.accountDemoMuted()}>Moderato testnet</span>}
    >
      <div {...ui.accountDemoSteps()} data-testid="single-key-demo" aria-busy={pending !== null}>
        <Step
          number={1}
          title="Pick the account's key"
          active
          completed={Boolean(account)}
          actions={keyTypes.map((item) => (
            <Button
              key={item.type}
              type="button"
              variant={account ? 'default' : 'accent'}
              disabled={disabled}
              onClick={() => run(item.type, () => create(item.type))}
            >
              {pending === item.type ? 'Creating…' : item.label}
            </Button>
          ))}
        >
          {account && chosen && (
            <p {...ui.accountDemoNote()}>
              <a href={`${explorer}/address/${account.address}`} target="_blank" rel="noreferrer">
                {StringFormatter.truncate(account.address)} ↗
              </a>{' '}
              · {chosen.note} The address comes from the key, with no transaction.
            </p>
          )}
        </Step>

        <Step
          number={2}
          title="Get test funds"
          active={Boolean(account)}
          completed={funded}
          actions={
            <Button
              type="button"
              disabled={disabled || !account || funded}
              onClick={() => run('fund', fund)}
            >
              {pending === 'fund' ? 'Funding…' : funded ? 'Funded' : 'Get test funds'}
            </Button>
          }
        >
          {account && balance !== null && (
            <p {...ui.accountDemoNote()}>Balance: {balance} test stablecoins</p>
          )}
        </Step>

        <Step
          number={3}
          title="Pay 1 test stablecoin with the key"
          active={funded}
          completed={Boolean(paid)}
          actions={
            <Button type="button" disabled={disabled || !funded} onClick={() => run('pay', pay)}>
              {pending === 'pay' ? 'Paying…' : 'Pay'}
            </Button>
          }
        >
          {paid && (
            <p {...ui.accountDemoResult()} role="status">
              Paid.{' '}
              <a href={`${explorer}/tx/${paid}`} target="_blank" rel="noreferrer">
                View the transaction ↗
              </a>
            </p>
          )}
        </Step>

        {error && (
          <p role="alert" {...ui.accountDemoError()}>
            {error}
          </p>
        )}
      </div>
    </Container>
  )
}

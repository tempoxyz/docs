import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  injectedStellarWallets,
  StellarFailedError,
  StellarNotLandedError,
  type StellarWallet,
  sendStellarTransaction,
  signsUnchanged,
  stellarTransactionHash,
  waitForStellarTransaction,
} from './stellar-wallets'

// A 1 USDC payment with a text memo, built and signed with @stellar/stellar-sdk. `altered` is the
// same payment signed after its fee changed, as a wallet that rewrites envelopes would sign it.
const sender = 'GCFIRY65OQE7DFP5KLNS2PF2LVZMUZYJX4OZIEQ36N2IQANUB5XVYOJR'
const unsigned =
  'AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAJxAAAAAAB1vNFgAAAAEAAAAAAAAAAAAAAABw29iAAAAAAQAAAAVxXzEyMwAAAAAAAAEAAAAAAAAAAQAAAACBOXcOqH0XX1ajVGbDTH7My42KkbTuN6Jd9g9bj8mzlAAAAAFVU0RDAAAAADuZETgO/piLoKiQDrHP5E82b32+lGvtB3JA9/Yk3xXFAAAAAACYloAAAAAAAAAAAA=='
const signed =
  'AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAAJxAAAAAAB1vNFgAAAAEAAAAAAAAAAAAAAABw29iAAAAAAQAAAAVxXzEyMwAAAAAAAAEAAAAAAAAAAQAAAACBOXcOqH0XX1ajVGbDTH7My42KkbTuN6Jd9g9bj8mzlAAAAAFVU0RDAAAAADuZETgO/piLoKiQDrHP5E82b32+lGvtB3JA9/Yk3xXFAAAAAACYloAAAAAAAAAAAbQPb1wAAABAaTrtGwYVTE+mI5LshncTmJv5Xdgp6PT+KHuxrSAm1CsJnsPYZBQhy2fzC3yWqEQy+TVUTArm5w5l2owSR3BqCQ=='
const altered =
  'AAAAAgAAAACKiOPddAnxlf1S2y08ul1yymcJvx2UEhvzdIgBtA9vXAAATiAAAAAAB1vNFgAAAAEAAAAAAAAAAAAAAABw29iAAAAAAQAAAAVxXzEyMwAAAAAAAAEAAAAAAAAAAQAAAACBOXcOqH0XX1ajVGbDTH7My42KkbTuN6Jd9g9bj8mzlAAAAAFVU0RDAAAAADuZETgO/piLoKiQDrHP5E82b32+lGvtB3JA9/Yk3xXFAAAAAACYloAAAAAAAAAAAbQPb1wAAABA41t/w1r4MKjg9u2mi7ZhDUub9+QNl036mfa4JB5XYeiP+ubUwhzNj+wgC5R8KBm7Hr434ZJeXQ9qlo69A1deCA=='
const hash = 'daa3f6e13cd2e76bca765cb6a4ad21ac0e674953b57599a02c49feea8cb89339'
afterEach(() => vi.unstubAllGlobals())

describe('Stellar envelopes', () => {
  it('hashes an unsigned envelope as Stellar does', () => {
    expect(stellarTransactionHash(unsigned)).toBe(hash)
    expect(() => stellarTransactionHash(signed)).toThrow('cannot sign')
    expect(() => stellarTransactionHash('not base64')).toThrow('cannot sign')
  })
  it('accepts only the prepared transaction with a signature added', () => {
    expect(signsUnchanged(unsigned, signed)).toBe(true)
    expect(signsUnchanged(unsigned, altered)).toBe(false)
    expect(signsUnchanged(unsigned, unsigned)).toBe(false)
    expect(signsUnchanged(unsigned, '')).toBe(false)
  })
})

function wallet({ account = sender, returns = signed } = {}) {
  const signTransaction = vi.fn(async () => returns)
  const hana: StellarWallet = {
    id: 'hana',
    name: 'Hana Wallet',
    getAddress: async () => account,
    signTransaction,
  }
  return { hana, signTransaction }
}

/** Horizon answers: one reply for the submission, then one per transaction lookup. */
function horizon(submission: Response | Error, ...lookups: Response[]) {
  const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method !== 'POST') return lookups.shift() ?? new Response('', { status: 404 })
    if (submission instanceof Error) throw submission
    return submission
  })
  vi.stubGlobal('fetch', fetcher)
  return fetcher
}
const rejected = (transaction: string, operations?: string[]) =>
  Response.json({ extras: { result_codes: { transaction, operations } } }, { status: 400 })

describe('Stellar wallet adapters', () => {
  const mainnet = 'Public Global Stellar Network ; September 2015'
  it('finds no wallets in a page without Stellar providers', () => {
    vi.stubGlobal('window', {})
    expect(injectedStellarWallets()).toEqual([])
  })
  it('asks each injected provider for the account and a mainnet signature in its own shape', async () => {
    const hana = {
      getPublicKey: vi.fn(async () => sender),
      signTransaction: vi.fn(async () => signed),
    }
    const onekey = {
      getPublicKey: vi.fn(async () => sender),
      signTransaction: vi.fn(async () => ({ signedTxXdr: signed, signerAddress: sender })),
    }
    const bitget = {
      connect: vi.fn(async () => sender),
      signTransaction: vi.fn(async () => signed),
    }
    vi.stubGlobal('window', {
      hanaWallet: { stellar: hana },
      $onekey: { stellar: onekey },
      bitkeep: { stellar: bitget },
    })
    const wallets = injectedStellarWallets()
    expect(wallets.map((w) => w.name)).toEqual(['Hana Wallet', 'OneKey', 'Bitget Wallet'])
    for (const w of wallets) {
      await expect(w.getAddress()).resolves.toBe(sender)
      await expect(w.signTransaction(unsigned, sender)).resolves.toBe(signed)
    }
    expect(hana.signTransaction).toHaveBeenCalledWith({
      xdr: unsigned,
      accountToSign: sender,
      networkPassphrase: mainnet,
    })
    for (const provider of [onekey, bitget])
      expect(provider.signTransaction).toHaveBeenCalledWith(unsigned, {
        address: sender,
        networkPassphrase: mainnet,
      })
  })
})

describe('Stellar signing', () => {
  it('signs as the sender, saves the hash, then submits the signed envelope', async () => {
    const { hana, signTransaction } = wallet()
    const fetcher = horizon(Response.json({ hash, successful: true }))
    const onHash = vi.fn(() => expect(fetcher).not.toHaveBeenCalled())
    await expect(
      sendStellarTransaction({ wallet: hana, sender, xdr: unsigned, onHash }),
    ).resolves.toBe(hash)
    expect(signTransaction).toHaveBeenCalledWith(unsigned, sender)
    expect(onHash).toHaveBeenCalledWith(hash)
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toBe('https://horizon.stellar.org/transactions')
    expect(new URLSearchParams(String(init?.body)).get('tx')).toBe(signed)
  })
  it('never submits an envelope the wallet changed', async () => {
    const { hana } = wallet({ returns: altered })
    const fetcher = horizon(Response.json({}))
    await expect(sendStellarTransaction({ wallet: hana, sender, xdr: unsigned })).rejects.toThrow(
      'Hana Wallet signed a different transaction. Nothing was sent.',
    )
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('refuses another account before signing', async () => {
    const other = wallet({ account: `G${'A'.repeat(55)}` })
    await expect(
      sendStellarTransaction({ wallet: other.hana, sender, xdr: unsigned }),
    ).rejects.toThrow('Switch Hana Wallet to the sender')
    expect(other.signTransaction).not.toHaveBeenCalled()
  })
  it('explains a payment Horizon rejected before any ledger', async () => {
    horizon(rejected('tx_insufficient_balance'))
    const failure = sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned })
    await expect(failure).rejects.toBeInstanceOf(StellarNotLandedError)
    await expect(failure).rejects.toThrow('Add XLM, then try again. Nothing was sent.')
  })
  it('treats a rejected resubmission of a landed payment as sent', async () => {
    horizon(rejected('tx_bad_seq'), Response.json({ hash, successful: true }))
    await expect(
      sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned }),
    ).resolves.toBe(hash)
  })
  it('reports a payment that landed and failed', async () => {
    horizon(rejected('tx_failed', ['op_underfunded']))
    const failure = sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned })
    await expect(failure).rejects.toBeInstanceOf(StellarFailedError)
    await expect(failure).rejects.toThrow(
      'The Stellar payment failed. The sender does not hold enough of this asset. Start a new test.',
    )
  })
  it('waits by hash when the submission times out', async () => {
    horizon(new Response('Timeout', { status: 504 }))
    await expect(
      sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned }),
    ).resolves.toBe(hash)
  })
  it('lets a payment Horizon did not take be submitted again', async () => {
    horizon(new Response('Too Many Requests', { status: 429 }))
    const limited = sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned })
    await expect(limited).rejects.toBeInstanceOf(StellarNotLandedError)
    await expect(limited).rejects.toThrow('Horizon did not take the payment (HTTP 429).')
    horizon(new TypeError('Failed to fetch'))
    await expect(
      sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned }),
    ).rejects.toThrow('Horizon could not be reached. Sign and send again')
  })
  it('treats an unavailable Horizon as sent when it already holds the payment', async () => {
    horizon(new Response('', { status: 503 }), Response.json({ hash, successful: true }))
    await expect(
      sendStellarTransaction({ wallet: wallet().hana, sender, xdr: unsigned }),
    ).resolves.toBe(hash)
  })
})

describe('Stellar inclusion', () => {
  it('waits for the including ledger', async () => {
    const fetcher = horizon(
      Response.json({}),
      new Response('', { status: 404 }),
      new Response('', { status: 503 }),
      Response.json({ hash, successful: true }),
    )
    await expect(waitForStellarTransaction(hash, { intervalMs: 0 })).resolves.toMatchObject({
      successful: true,
    })
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(fetcher.mock.calls[0][0]).toBe(`https://horizon.stellar.org/transactions/${hash}`)
  })
  it('lets a payment that never landed be submitted again', async () => {
    horizon(Response.json({}))
    await expect(
      waitForStellarTransaction(hash, { attempts: 2, intervalMs: 0 }),
    ).rejects.toBeInstanceOf(StellarNotLandedError)
  })
  it('throws when the payment landed but failed', async () => {
    horizon(Response.json({}), Response.json({ hash, successful: false }))
    await expect(waitForStellarTransaction(hash, { intervalMs: 0 })).rejects.toBeInstanceOf(
      StellarFailedError,
    )
  })
})

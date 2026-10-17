import { describe, expect, it, vi } from 'vitest'
import {
  createEarnDemoClient,
  earnDemoAmount,
  earnDemoAsset,
  earnDemoEngine,
  earnDemoShare,
  earnDemoVault,
  minimumEarnDemoShares,
  parseEarnDemoAmount,
  verifyEarnDemoDeposit,
  verifyEarnDemoDirectory,
  verifyEarnDemoNetwork,
} from './earn-deposit-demo'

const account = '0x0000000000000000000000000000000000000001'
const otherAccount = '0x0000000000000000000000000000000000000002'

function vault() {
  return {
    id: earnDemoVault,
    verified: true,
    access: { status: 'open' },
    capabilities: { deposit: true, redeem: true },
    state: { depositsPaused: false },
    assetToken: { address: earnDemoAsset },
    shareToken: { address: earnDemoShare },
    engine: { address: earnDemoEngine },
  }
}

describe('Earn demo deployment guard', () => {
  it('accepts only the verified, open and active tested deployment', () => {
    expect(() => verifyEarnDemoDirectory({ data: [vault()] })).not.toThrow()
    expect(() => verifyEarnDemoNetwork(42431)).not.toThrow()
    expect(() => verifyEarnDemoNetwork(4217)).toThrow('Moderato testnet')
  })

  it('keeps supported redemption available when new deposits pause', () => {
    const directory = { data: [{ ...vault(), state: { depositsPaused: true } }] }
    expect(() => verifyEarnDemoDirectory(directory, 'deposit')).toThrow()
    expect(verifyEarnDemoDirectory(directory, 'redeem')).toEqual({ deposit: false, redeem: true })
    expect(verifyEarnDemoDirectory(directory, 'inspect')).toEqual({ deposit: false, redeem: true })
    expect(() =>
      verifyEarnDemoDirectory(
        { data: [{ ...vault(), capabilities: { redeem: false } }] },
        'redeem',
      ),
    ).toThrow()
  })

  it.each([
    { verified: false },
    { id: otherAccount },
    { access: { status: 'restricted' } },
    { capabilities: { deposit: false } },
    { state: { depositsPaused: true } },
    { assetToken: { address: otherAccount } },
    { shareToken: { address: otherAccount } },
    { engine: { address: otherAccount } },
  ])('rejects an unsafe directory change: %j', (change) => {
    expect(() => verifyEarnDemoDirectory({ data: [{ ...vault(), ...change }] })).toThrow(
      'not currently available',
    )
  })

  it.each([
    null,
    {},
    { data: [] },
    { data: [{ id: 12 }] },
    { data: [null] },
  ])('fails closed on a missing or malformed directory: %j', (response) =>
    expect(() => verifyEarnDemoDirectory(response)).toThrow())

  it('constructs a testnet passkey client without any network or signing action', () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    try {
      const client = createEarnDemoClient({
        credential: {
          id: 'test-public-credential',
          publicKey:
            '0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c2964fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
        },
        rpId: 'localhost',
      })
      expect(client.chain.id).toBe(42431)
      expect(Reflect.get(client.chain, 'feeToken')).toBe(earnDemoAsset)
      expect(request).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('Earn demo deposit bounds and receipt', () => {
  const result = {
    recipient: account,
    assetAmount: earnDemoAmount,
    shareAmount: 1_000_000n,
    receipt: { status: 'success' },
  } as const

  it('bounds execution 0.5% below the simulated positive output', () => {
    expect(minimumEarnDemoShares(1_000_000n)).toBe(995_000n)
    expect(() => minimumEarnDemoShares(0n)).toThrow()
    expect(() => minimumEarnDemoShares(-1n)).toThrow()
    expect(minimumEarnDemoShares(1n)).toBe(1n)
    expect(() => verifyEarnDemoDeposit(result, account, 995_000n)).not.toThrow()
  })

  it.each([
    { recipient: otherAccount as `0x${string}` },
    { assetAmount: earnDemoAmount + 1n },
    { shareAmount: 994_999n },
    { receipt: { status: 'reverted' } },
  ])('rejects a receipt that does not confirm the intended deposit (case %#)', (change) => {
    expect(() => verifyEarnDemoDeposit({ ...result, ...change }, account, 995_000n)).toThrow(
      'expected deposit',
    )
  })
})

describe('Editable Earn deposit amount', () => {
  it('accepts exact positive pathUSD amounts without rounding', () => {
    expect(parseEarnDemoAmount('1')).toBe(1_000_000n)
    expect(parseEarnDemoAmount(' 2.5 ')).toBe(2_500_000n)
    expect(parseEarnDemoAmount('0.000001')).toBe(1n)
  })

  it.each([
    '',
    '0',
    '0.000000',
    '-1',
    'NaN',
    '1e6',
    '0.0000001',
    '1.0000001',
    '1,000',
    '9'.repeat(78),
  ])('rejects an invalid or unrepresentable amount: %s', (input) =>
    expect(parseEarnDemoAmount(input)).toBeUndefined())

  it('checks the receipt against the amount selected in the UI', () => {
    const result = {
      recipient: account,
      assetAmount: 2_500_000n,
      shareAmount: 2_500_000n,
      receipt: { status: 'success' },
    } as const
    expect(() => verifyEarnDemoDeposit(result, account, 2_000_000n, 2_500_000n)).not.toThrow()
    expect(() => verifyEarnDemoDeposit(result, account, 2_000_000n, 1_000_000n)).toThrow(
      'expected deposit',
    )
  })
})

import type { Config } from '@wagmi/core'
import { encodeAbiParameters, encodeEventTopics, type Hash } from 'viem'
import { Abis } from 'viem/tempo'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitParallelPayment, type TransferState } from './SendParallelPayments'

const actions = vi.hoisted(() => ({ transfer: vi.fn(), waitForReceipt: vi.fn() }))
vi.mock('@wagmi/core', () => ({
  getPublicClient: () => ({ waitForTransactionReceipt: actions.waitForReceipt }),
}))
vi.mock('wagmi/tempo', () => ({ Actions: { token: { transfer: actions.transfer } }, Hooks: {} }))
vi.mock('../../Demo', () => ({
  Button: () => null,
  ExplorerLink: () => null,
  Step: () => null,
  FAKE_RECIPIENT: '0x0000000000000000000000000000000000000002',
  FAKE_RECIPIENT_2: '0x0000000000000000000000000000000000000003',
}))

const config = { state: { chainId: 42431 } } as Config
const hash = `0x${'ab'.repeat(32)}` as Hash
const payment = {
  account: '0x0000000000000000000000000000000000000001',
  to: '0x0000000000000000000000000000000000000002',
  token: '0x20c0000000000000000000000000000000000001',
  amount: 50_000_000n,
  nonceKey: 1n,
  nonce: 0,
} as const

function receipt(
  changes: {
    status?: 'success' | 'reverted'
    token?: string
    to?: `0x${string}`
    amount?: bigint
  } = {},
) {
  return {
    status: changes.status ?? 'success',
    transactionHash: hash,
    logs: [
      {
        address: changes.token ?? payment.token,
        topics: encodeEventTopics({
          abi: Abis.tip20,
          eventName: 'Transfer',
          args: { from: payment.account, to: changes.to ?? payment.to },
        }),
        data: encodeAbiParameters([{ type: 'uint256' }], [changes.amount ?? payment.amount]),
      },
    ],
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

beforeEach(() => vi.resetAllMocks())

describe('parallel payment confirmation', () => {
  it('keeps a submitted hash pending until a receipt proves delivery', async () => {
    const submission = deferred<Hash>()
    const confirmation = deferred<ReturnType<typeof receipt>>()
    actions.transfer.mockReturnValue(submission.promise)
    actions.waitForReceipt.mockReturnValue(confirmation.promise)
    const states: TransferState[] = []
    const result = submitParallelPayment(config, payment, (state) => states.push(state))

    expect(states).toEqual([{ status: 'pending' }])
    submission.resolve(hash)
    await vi.waitFor(() => expect(actions.waitForReceipt).toHaveBeenCalled())
    expect(states.at(-1)).toEqual({ status: 'submitted', hash })
    expect(states.some((state) => state.status === 'success')).toBe(false)
    expect(actions.waitForReceipt).toHaveBeenCalledWith({ hash })

    confirmation.resolve(receipt())
    expect(await result).toBe(true)
    expect(states.at(-1)).toEqual({ status: 'success', hash })
  })

  it('does not mark a reverted transaction as a completed payment', async () => {
    actions.transfer.mockResolvedValue(hash)
    actions.waitForReceipt.mockResolvedValue(receipt({ status: 'reverted' }))
    const update = vi.fn()
    expect(await submitParallelPayment(config, payment, update)).toBe(false)
    expect(update).toHaveBeenLastCalledWith({
      status: 'error',
      hash,
      error: 'Transaction reverted',
    })
  })

  it.each([
    { to: '0x0000000000000000000000000000000000000003' as `0x${string}` },
    { amount: payment.amount - 1n },
    { token: '0x20c0000000000000000000000000000000000002' },
  ])('requires the expected recipient, amount, and token (case %#)', async (changes) => {
    actions.transfer.mockResolvedValue(hash)
    actions.waitForReceipt.mockResolvedValue(receipt(changes))
    const update = vi.fn()
    expect(await submitParallelPayment(config, payment, update)).toBe(false)
    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'unconfirmed', hash }),
    )
    expect(update.mock.calls.some(([state]) => state.status === 'success')).toBe(false)
  })

  it('retains the hash when confirmation fails so a retry is not presented as safe', async () => {
    actions.transfer.mockResolvedValue(hash)
    actions.waitForReceipt.mockRejectedValue(new Error('Receipt request timed out'))
    const update = vi.fn()
    expect(await submitParallelPayment(config, payment, update)).toBe(false)
    expect(update).toHaveBeenLastCalledWith({
      status: 'unconfirmed',
      hash,
      error: 'Receipt request timed out',
    })
  })

  it('distinguishes a wallet rejection before submission from an unknown outcome', async () => {
    actions.transfer.mockRejectedValue(new Error('User rejected the request'))
    const update = vi.fn()
    expect(await submitParallelPayment(config, payment, update)).toBe(false)
    expect(update).toHaveBeenLastCalledWith({
      status: 'error',
      hash: undefined,
      error: 'User rejected the request',
    })
    expect(actions.waitForReceipt).not.toHaveBeenCalled()
  })
})

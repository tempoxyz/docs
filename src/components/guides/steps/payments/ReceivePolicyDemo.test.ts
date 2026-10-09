import { encodeAbiParameters, encodeEventTopics, type Hex, type TransactionReceipt } from 'viem'
import { Abis, Addresses } from 'viem/tempo'
import { describe, expect, it, vi } from 'vitest'
import { betaUsd } from '../../tokens'
import { findBlockedReceipt } from './ReceivePolicyDemo'

vi.mock('../../Demo', () => ({
  Button: () => null,
  ExplorerAccountLink: () => null,
  ExplorerLink: () => null,
  Step: () => null,
}))
const receiver = '0x0000000000000000000000000000000000000001'
const witness = '0x1234'
function receipt({
  emitter = Addresses.receivePolicyGuard,
  token = betaUsd as Hex,
  to = receiver as Hex,
  amount = 1_000_000n,
} = {}) {
  return {
    logs: [
      {
        address: emitter,
        topics: encodeEventTopics({
          abi: Abis.receivePolicyGuard,
          eventName: 'TransferBlocked',
          args: { token, receiver: to, blockedNonce: 0n },
        }),
        data: encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint8' }, { type: 'bytes' }],
          [amount, 1, witness],
        ),
      },
    ],
  } as Pick<TransactionReceipt, 'logs'>
}

describe('receive-policy demo receipts', () => {
  it('extracts the exact claim witness from a matching guard receipt', () => {
    expect(findBlockedReceipt(receipt(), receiver)).toBe(witness)
  })
  it.each([
    { emitter: receiver },
    { token: receiver as Hex },
    { to: '0x0000000000000000000000000000000000000002' as Hex },
    { amount: 2_000_000n },
  ])('does not claim a held payment from an unrelated event: %s', (change) => {
    expect(() => findBlockedReceipt(receipt(change), receiver)).toThrow('does not confirm')
  })
  it('does not treat transaction success alone as a held payment', () => {
    expect(() => findBlockedReceipt({ logs: [] }, receiver)).toThrow('does not confirm')
  })
})

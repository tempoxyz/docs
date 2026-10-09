import { decodeFunctionData, getAddress, parseAbi, zeroHash } from 'viem'
import { describe, expect, test } from 'vitest'
import { Actions } from './zone-sandbox-sdk'

const recipient = '0x1111111111111111111111111111111111111111'
const token = '0x20c0000000000000000000000000000000000001'

describe('legacy Zone sandbox compatibility', () => {
  test('encodes the deployed four-argument deposit and approves its portal', () => {
    const [approval, deposit] = Actions.zone.deposit.calls({
      chainId: 42431,
      zoneId: 6,
      token,
      recipient,
      amount: 100_000_000n,
    } as never)
    expect(approval.args[0]).toBe('0x7069DeC4E64Fd07334A0933eDe836C17259c9B23')
    expect(deposit.to).toBe(approval.args[0])
    const decoded = decodeFunctionData({
      abi: parseAbi([
        'function deposit(address token, address recipient, uint128 amount, bytes32 memo)',
      ]),
      data: deposit.data,
    })
    expect(decoded.args).toEqual([getAddress(token), recipient, 100_000_000n, zeroHash])
  })
})

import { PublicKey } from 'ox'
import { type Address, encodeFunctionData, type Hex, parseAbi } from 'viem'
import { zeroBytes32 } from './private-zones-encryption.ts'

export const AUTHENTICATED_WITHDRAWAL_REVEAL_TO =
  '0x031dc147467e8f106eb22850fef549dc74b8f6634aeac554ebdd4ab896b67cdf68' as const

export const zoneOutboxAuthenticatedWithdrawalAbi = parseAbi([
  'function requestWithdrawal(address token, address to, uint128 amount, bytes32 memo, uint64 gasLimit, address fallbackRecipient, bytes data, bytes revealTo)',
])

export function encodeAuthenticatedWithdrawalCall(parameters: {
  amount: bigint
  data?: Hex | undefined
  fallbackRecipient: Address
  gasLimit?: bigint | undefined
  memo?: Hex | undefined
  outbox: Address
  revealTo?: Hex | undefined
  to: Address
  token: Address
}) {
  const revealTo = PublicKey.toHex(
    PublicKey.fromHex(parameters.revealTo ?? AUTHENTICATED_WITHDRAWAL_REVEAL_TO),
  )

  return {
    data: encodeFunctionData({
      abi: zoneOutboxAuthenticatedWithdrawalAbi,
      functionName: 'requestWithdrawal',
      args: [
        parameters.token,
        parameters.to,
        parameters.amount,
        parameters.memo ?? zeroBytes32,
        parameters.gasLimit ?? 0n,
        parameters.fallbackRecipient,
        parameters.data ?? '0x',
        revealTo,
      ],
    }),
    to: parameters.outbox,
  }
}

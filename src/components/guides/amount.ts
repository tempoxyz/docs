export type TokenAmount = bigint | { amount: bigint } | null | undefined

export function baseUnits(amount: TokenAmount) {
  if (typeof amount === 'bigint') return amount
  return amount?.amount ?? 0n
}

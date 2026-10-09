import { Expiry } from 'accounts'
import { parseUnits } from 'viem'
import { Addresses } from 'viem/tempo'
import { alphaUsd, betaUsd, ousd, pathUsd, thetaUsd } from '../components/guides/tokens'

const tokens = [ousd, pathUsd, alphaUsd, betaUsd, thetaUsd] as const

/** Explicit contract access required by Tempo Wallet's bounded-key policy. */
export function demoWalletAuthorization() {
  return {
    expiry: Expiry.days(1),
    limits: tokens.map((token) => ({ token, limit: parseUnits('500', 6) })),
    scopes: (
      [
        ...tokens,
        Addresses.stablecoinDex,
        Addresses.feeManager,
        Addresses.tip20Factory,
        Addresses.tip403Registry,
      ] as const
    ).map((address) => ({ address })),
  }
}

import type { Address } from 'viem'
import { alphausd, betausd, ousd as core_ousd, pathusd, thetausd } from 'viem/tokens'

export const pathUsd = pathusd(4217).address
export const ousd = core_ousd(4217).address.toLowerCase() as Address
export const alphaUsd = alphausd(42431).address
export const betaUsd = betausd(42431).address
export const thetaUsd = thetausd(42431).address

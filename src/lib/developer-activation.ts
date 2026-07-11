'use client'

import { captureDocsEvent } from './posthog'

export const FAUCET_ACTIVATION_EXPERIMENT_KEY = 'faucet-first-payment-handoff-v1'
export const FAUCET_ACTIVATION_JOURNEY_VERSION = 'v1'
export const FAUCET_ACTIVATION_STORAGE_KEY = 'tempo:faucet-activation:v1'
export const FAUCET_ACTIVATION_PRIMARY_WINDOW_MS = 24 * 60 * 60 * 1_000
export const FAUCET_ACTIVATION_TTL_MS = 7 * FAUCET_ACTIVATION_PRIMARY_WINDOW_MS

export const DEVELOPER_ACTIVATION_EVENTS = {
  FAUCET_VIEWED: 'faucet_viewed',
  FAUCET_CLAIM_STARTED: 'faucet_claim_started',
  FAUCET_CLAIM_SUCCEEDED: 'faucet_claim_succeeded',
  FAUCET_CLAIM_FAILED: 'faucet_claim_failed',
  QUICKSTART_STARTED: 'quickstart_started',
  TESTNET_PAYMENT_SUCCEEDED: 'testnet_payment_succeeded',
  TESTNET_PAYMENT_FAILED: 'testnet_payment_failed',
} as const

export type FaucetActivationVariant = 'control' | 'guided_handoff' | 'unassigned'
export type FaucetClaimMethod = 'address_form' | 'connected_wallet'
export type ActivationFailureCategory =
  | 'receive_policy_redirect'
  | 'reverted'
  | 'rpc'
  | 'timeout'
  | 'unknown'

export type ClaimDurationBucket = 'under_5s' | '5_to_15s' | '15_to_30s' | '30s_or_more' | 'unknown'

export type TimeSinceClaimBucket =
  | 'under_1m'
  | '1_to_5m'
  | '5_to_30m'
  | '30m_to_2h'
  | '2_to_24h'
  | '1_to_3d'
  | '3_to_7d'
  | 'unknown'

type DeveloperActivationEventProperties = {
  faucet_viewed: Record<never, never>
  faucet_claim_started: {
    claim_method: FaucetClaimMethod
  }
  faucet_claim_succeeded: {
    claim_duration_bucket: ClaimDurationBucket
    claim_method: FaucetClaimMethod
    journey_persisted: boolean
    receipt_count: number
  }
  faucet_claim_failed: {
    claim_duration_bucket: ClaimDurationBucket
    claim_method: FaucetClaimMethod
    failure_category: ActivationFailureCategory
  }
  quickstart_started: {
    entry_point: 'handoff' | 'organic_after_claim'
    guide_id: 'send_payment'
    time_since_claim_bucket: TimeSinceClaimBucket
  }
  testnet_payment_succeeded: {
    asset: 'alpha_usd'
    delivery_confirmation: 'recipient_match'
    guide_id: 'send_payment'
    time_since_claim_bucket: TimeSinceClaimBucket
  }
  testnet_payment_failed: {
    failure_category: ActivationFailureCategory
    guide_id: 'send_payment'
    time_since_claim_bucket: TimeSinceClaimBucket
  }
}

export function captureDeveloperActivationEvent<
  event extends keyof DeveloperActivationEventProperties,
>(
  event: event,
  experimentVariant: FaucetActivationVariant,
  properties: DeveloperActivationEventProperties[event],
) {
  captureDocsEvent(event, {
    activation_scope: 'testnet_developer',
    network: 'moderato',
    chain_id: 42431,
    journey_version: FAUCET_ACTIVATION_JOURNEY_VERSION,
    experiment_key: FAUCET_ACTIVATION_EXPERIMENT_KEY,
    experiment_variant: experimentVariant,
    ...properties,
  })
}

export function resolveFaucetActivationVariant(
  featureFlag: boolean | string | undefined,
): FaucetActivationVariant {
  if (featureFlag === 'guided_handoff') return 'guided_handoff'
  if (featureFlag === 'control') return 'control'
  return 'unassigned'
}

export function resolveFaucetActivationAssignment({
  errorsLoading = false,
  featureFlag,
  locked,
}: {
  errorsLoading?: boolean
  featureFlag: boolean | string | undefined
  locked: boolean
}): Exclude<FaucetActivationVariant, 'unassigned'> | null {
  if (locked || errorsLoading) return null
  const variant = resolveFaucetActivationVariant(featureFlag)
  return variant === 'unassigned' ? null : variant
}

export function bucketClaimDuration(durationMs: number | undefined): ClaimDurationBucket {
  if (durationMs === undefined || !Number.isFinite(durationMs) || durationMs < 0) return 'unknown'
  if (durationMs < 5_000) return 'under_5s'
  if (durationMs < 15_000) return '5_to_15s'
  if (durationMs < 30_000) return '15_to_30s'
  return '30s_or_more'
}

export function bucketTimeSinceClaim(durationMs: number | undefined): TimeSinceClaimBucket {
  if (durationMs === undefined || !Number.isFinite(durationMs) || durationMs < 0) return 'unknown'
  if (durationMs < 60_000) return 'under_1m'
  if (durationMs < 5 * 60_000) return '1_to_5m'
  if (durationMs < 30 * 60_000) return '5_to_30m'
  if (durationMs < 2 * 60 * 60_000) return '30m_to_2h'
  if (durationMs <= FAUCET_ACTIVATION_PRIMARY_WINDOW_MS) return '2_to_24h'
  if (durationMs < 3 * FAUCET_ACTIVATION_PRIMARY_WINDOW_MS) return '1_to_3d'
  if (durationMs <= FAUCET_ACTIVATION_TTL_MS) return '3_to_7d'
  return 'unknown'
}

export class FaucetReceiptError extends Error {
  override name = 'FaucetReceiptError'

  constructor() {
    super('Faucet funding transaction did not succeed')
  }
}

export function assertSuccessfulFaucetReceipts(receipts: readonly { status?: string }[]): number {
  if (receipts.length === 0 || receipts.some((receipt) => receipt.status !== 'success'))
    throw new FaucetReceiptError()
  return receipts.length
}

export function isDeliveredTestnetPayment(
  result: { receipt?: { status?: string }; to?: string },
  requestedRecipient: string,
) {
  return (
    result.receipt?.status === 'success' &&
    typeof result.to === 'string' &&
    result.to.toLowerCase() === requestedRecipient.toLowerCase()
  )
}

export function categorizeActivationFailure(error: unknown): ActivationFailureCategory {
  if (error instanceof FaucetReceiptError) return 'reverted'
  if (!(error instanceof Error)) return 'unknown'

  const name = error.name.toLowerCase()
  if (name.includes('timeout')) return 'timeout'
  if (name.includes('revert')) return 'reverted'
  return 'rpc'
}

export type FaucetActivationJourney = {
  claimedAt: number
  claimMethod: FaucetClaimMethod
  experimentVariant: FaucetActivationVariant
  handoffClicked: boolean
  quickstartTracked: boolean
  version: 1
}

export type ActivationStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

function browserStorage(): ActivationStorage | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

function isFaucetActivationJourney(value: unknown): value is FaucetActivationJourney {
  if (!value || typeof value !== 'object') return false
  const journey = value as Partial<FaucetActivationJourney>
  return (
    journey.version === 1 &&
    typeof journey.claimedAt === 'number' &&
    Number.isFinite(journey.claimedAt) &&
    journey.claimedAt >= 0 &&
    (journey.claimMethod === 'address_form' || journey.claimMethod === 'connected_wallet') &&
    (journey.experimentVariant === 'control' ||
      journey.experimentVariant === 'guided_handoff' ||
      journey.experimentVariant === 'unassigned') &&
    typeof journey.handoffClicked === 'boolean' &&
    typeof journey.quickstartTracked === 'boolean'
  )
}

export function writeFaucetActivationJourney(
  journey: FaucetActivationJourney,
  storage: ActivationStorage | undefined = browserStorage(),
) {
  if (!storage) return false
  try {
    storage.setItem(FAUCET_ACTIVATION_STORAGE_KEY, JSON.stringify(journey))
    return true
  } catch {
    return false
  }
}

function removeFaucetActivationJourney(storage: ActivationStorage) {
  try {
    storage.removeItem(FAUCET_ACTIVATION_STORAGE_KEY)
  } catch {
    // Storage may be readable but not writable in restricted browser contexts.
  }
}

export function startFaucetActivationJourney(
  claimMethod: FaucetClaimMethod,
  experimentVariant: FaucetActivationVariant,
  now = Date.now(),
  storage: ActivationStorage | undefined = browserStorage(),
) {
  const journey: FaucetActivationJourney = {
    version: 1,
    claimedAt: now,
    claimMethod,
    experimentVariant,
    handoffClicked: false,
    quickstartTracked: false,
  }
  return {
    journey,
    persisted: writeFaucetActivationJourney(journey, storage),
  }
}

export function readFaucetActivationJourney(
  now = Date.now(),
  storage: ActivationStorage | undefined = browserStorage(),
): FaucetActivationJourney | null {
  if (!storage) return null

  try {
    const value = storage.getItem(FAUCET_ACTIVATION_STORAGE_KEY)
    if (!value) return null
    const journey: unknown = JSON.parse(value)
    if (
      !isFaucetActivationJourney(journey) ||
      journey.claimedAt > now ||
      now - journey.claimedAt > FAUCET_ACTIVATION_TTL_MS
    ) {
      removeFaucetActivationJourney(storage)
      return null
    }
    return journey
  } catch {
    removeFaucetActivationJourney(storage)
    return null
  }
}

export function updateFaucetActivationJourney(
  update: Partial<Pick<FaucetActivationJourney, 'handoffClicked' | 'quickstartTracked'>>,
  now = Date.now(),
  storage: ActivationStorage | undefined = browserStorage(),
) {
  const journey = readFaucetActivationJourney(now, storage)
  if (!journey) return null
  const updated = { ...journey, ...update }
  writeFaucetActivationJourney(updated, storage)
  return updated
}

export function trackDeveloperActivationQuickstart(
  now = Date.now(),
  storage: ActivationStorage | undefined = browserStorage(),
) {
  const journey = readFaucetActivationJourney(now, storage)
  if (!journey || journey.quickstartTracked) return false

  captureDeveloperActivationEvent('quickstart_started', journey.experimentVariant, {
    entry_point: journey.handoffClicked ? 'handoff' : 'organic_after_claim',
    guide_id: 'send_payment',
    time_since_claim_bucket: bucketTimeSinceClaim(now - journey.claimedAt),
  })
  updateFaucetActivationJourney({ quickstartTracked: true }, now, storage)
  return true
}

export function trackDeveloperActivationPaymentSucceeded(
  now = Date.now(),
  storage: ActivationStorage | undefined = browserStorage(),
) {
  const journey = readFaucetActivationJourney(now, storage)
  if (!journey) return false

  captureDeveloperActivationEvent('testnet_payment_succeeded', journey.experimentVariant, {
    asset: 'alpha_usd',
    delivery_confirmation: 'recipient_match',
    guide_id: 'send_payment',
    time_since_claim_bucket: bucketTimeSinceClaim(now - journey.claimedAt),
  })
  return true
}

export function trackDeveloperActivationPaymentFailed(
  failureCategory: ActivationFailureCategory,
  now = Date.now(),
  storage: ActivationStorage | undefined = browserStorage(),
) {
  const journey = readFaucetActivationJourney(now, storage)
  if (!journey) return false

  captureDeveloperActivationEvent('testnet_payment_failed', journey.experimentVariant, {
    failure_category: failureCategory,
    guide_id: 'send_payment',
    time_since_claim_bucket: bucketTimeSinceClaim(now - journey.claimedAt),
  })
  return true
}

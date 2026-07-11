import { describe, expect, it } from 'vitest'
import {
  type ActivationStorage,
  assertSuccessfulFaucetReceipts,
  bucketClaimDuration,
  bucketTimeSinceClaim,
  categorizeActivationFailure,
  FAUCET_ACTIVATION_PRIMARY_WINDOW_MS,
  FAUCET_ACTIVATION_STORAGE_KEY,
  FAUCET_ACTIVATION_TTL_MS,
  FaucetReceiptError,
  isDeliveredTestnetPayment,
  readFaucetActivationJourney,
  resolveFaucetActivationAssignment,
  resolveFaucetActivationVariant,
  startFaucetActivationJourney,
  trackDeveloperActivationPaymentSucceeded,
  trackDeveloperActivationQuickstart,
  updateFaucetActivationJourney,
} from './developer-activation'

function memoryStorage(): ActivationStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

describe('faucet activation experiment', () => {
  it('accepts only explicit multivariate assignments', () => {
    expect(resolveFaucetActivationVariant(undefined)).toBe('unassigned')
    expect(resolveFaucetActivationVariant(false)).toBe('unassigned')
    expect(resolveFaucetActivationVariant(true)).toBe('unassigned')
    expect(resolveFaucetActivationVariant('control')).toBe('control')
    expect(resolveFaucetActivationVariant('guided_handoff')).toBe('guided_handoff')
  })

  it('locks the first valid assignment and ignores loading failures or refreshes', () => {
    expect(
      resolveFaucetActivationAssignment({
        featureFlag: 'guided_handoff',
        locked: false,
      }),
    ).toBe('guided_handoff')
    expect(
      resolveFaucetActivationAssignment({
        errorsLoading: true,
        featureFlag: 'guided_handoff',
        locked: false,
      }),
    ).toBeNull()
    expect(
      resolveFaucetActivationAssignment({
        featureFlag: undefined,
        locked: false,
      }),
    ).toBeNull()
    expect(
      resolveFaucetActivationAssignment({
        featureFlag: 'guided_handoff',
        locked: true,
      }),
    ).toBeNull()
  })

  it('buckets claim and conversion timing without retaining exact durations', () => {
    expect(bucketClaimDuration(undefined)).toBe('unknown')
    expect(bucketClaimDuration(4_999)).toBe('under_5s')
    expect(bucketClaimDuration(5_000)).toBe('5_to_15s')
    expect(bucketClaimDuration(15_000)).toBe('15_to_30s')
    expect(bucketClaimDuration(30_000)).toBe('30s_or_more')

    expect(bucketTimeSinceClaim(59_999)).toBe('under_1m')
    expect(bucketTimeSinceClaim(60_000)).toBe('1_to_5m')
    expect(bucketTimeSinceClaim(5 * 60_000)).toBe('5_to_30m')
    expect(bucketTimeSinceClaim(30 * 60_000)).toBe('30m_to_2h')
    expect(bucketTimeSinceClaim(2 * 60 * 60_000)).toBe('2_to_24h')
    expect(bucketTimeSinceClaim(FAUCET_ACTIVATION_PRIMARY_WINDOW_MS)).toBe('2_to_24h')
    expect(bucketTimeSinceClaim(FAUCET_ACTIVATION_PRIMARY_WINDOW_MS + 1)).toBe('1_to_3d')
    expect(bucketTimeSinceClaim(3 * FAUCET_ACTIVATION_PRIMARY_WINDOW_MS)).toBe('3_to_7d')
    expect(bucketTimeSinceClaim(FAUCET_ACTIVATION_TTL_MS)).toBe('3_to_7d')
    expect(bucketTimeSinceClaim(FAUCET_ACTIVATION_TTL_MS + 1)).toBe('unknown')
  })

  it('requires at least one successful faucet receipt', () => {
    expect(assertSuccessfulFaucetReceipts([{ status: 'success' }])).toBe(1)
    expect(() => assertSuccessfulFaucetReceipts([])).toThrow(FaucetReceiptError)
    expect(() =>
      assertSuccessfulFaucetReceipts([{ status: 'success' }, { status: 'reverted' }]),
    ).toThrow(FaucetReceiptError)
  })

  it('requires both receipt success and recipient delivery for a payment', () => {
    const recipient = '0xbeefcafe54750903ac1c8909323af7beb21ea2cb'
    expect(
      isDeliveredTestnetPayment({ receipt: { status: 'success' }, to: recipient }, recipient),
    ).toBe(true)
    expect(
      isDeliveredTestnetPayment(
        {
          receipt: { status: 'success' },
          to: '0xb10c000000000000000000000000000000000000',
        },
        recipient,
      ),
    ).toBe(false)
    expect(
      isDeliveredTestnetPayment({ receipt: { status: 'reverted' }, to: recipient }, recipient),
    ).toBe(false)
  })

  it('reduces failures to safe categories', () => {
    expect(categorizeActivationFailure(new FaucetReceiptError())).toBe('reverted')
    expect(
      categorizeActivationFailure(Object.assign(new Error('private'), { name: 'TimeoutError' })),
    ).toBe('timeout')
    expect(categorizeActivationFailure(new Error('private'))).toBe('rpc')
    expect(categorizeActivationFailure('private')).toBe('unknown')
  })
})

describe('faucet activation journey storage', () => {
  it('stores only scope-limited journey state and updates safe booleans', () => {
    const storage = memoryStorage()
    const now = 1_000_000
    const started = startFaucetActivationJourney('connected_wallet', 'guided_handoff', now, storage)

    expect(started.persisted).toBe(true)

    expect(JSON.parse(storage.values.get(FAUCET_ACTIVATION_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      claimedAt: now,
      claimMethod: 'connected_wallet',
      experimentVariant: 'guided_handoff',
      handoffClicked: false,
      quickstartTracked: false,
    })

    expect(updateFaucetActivationJourney({ handoffClicked: true }, now, storage)).toMatchObject({
      handoffClicked: true,
      quickstartTracked: false,
    })

    expect(trackDeveloperActivationQuickstart(now + 1, storage)).toBe(true)
    expect(trackDeveloperActivationQuickstart(now + 2, storage)).toBe(false)
    expect(trackDeveloperActivationPaymentSucceeded(now + 3, storage)).toBe(true)
    expect(readFaucetActivationJourney(now + 3, storage)).toMatchObject({
      handoffClicked: true,
      quickstartTracked: true,
    })
  })

  it('retains a claim for the seven-day repeat-payment window', () => {
    const storage = memoryStorage()
    const now = 1_000_000
    startFaucetActivationJourney('address_form', 'control', now, storage)

    expect(readFaucetActivationJourney(now + FAUCET_ACTIVATION_TTL_MS, storage)).not.toBeNull()
    expect(readFaucetActivationJourney(now + FAUCET_ACTIVATION_TTL_MS + 1, storage)).toBeNull()
    expect(storage.values.has(FAUCET_ACTIVATION_STORAGE_KEY)).toBe(false)
  })

  it('preserves an unassigned journey without treating it as a control exposure', () => {
    const storage = memoryStorage()
    const now = 1_000_000
    startFaucetActivationJourney('address_form', 'unassigned', now, storage)

    expect(readFaucetActivationJourney(now, storage)).toMatchObject({
      experimentVariant: 'unassigned',
    })
  })

  it('rejects malformed or future journey state', () => {
    const storage = memoryStorage()
    storage.setItem(FAUCET_ACTIVATION_STORAGE_KEY, '{')
    expect(readFaucetActivationJourney(1_000, storage)).toBeNull()

    startFaucetActivationJourney('address_form', 'control', 2_000, storage)
    expect(readFaucetActivationJourney(1_999, storage)).toBeNull()
  })

  it('contains storage write and cleanup failures', () => {
    const restrictedStorage: ActivationStorage = {
      getItem: () => '{',
      removeItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }

    expect(
      startFaucetActivationJourney('address_form', 'control', 1_000, restrictedStorage).persisted,
    ).toBe(false)
    expect(readFaucetActivationJourney(1_000, restrictedStorage)).toBeNull()
  })
})

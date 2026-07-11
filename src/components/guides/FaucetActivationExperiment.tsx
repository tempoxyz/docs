'use client'

import * as React from 'react'
import {
  bucketClaimDuration,
  captureDeveloperActivationEvent,
  categorizeActivationFailure,
  FAUCET_ACTIVATION_EXPERIMENT_KEY,
  type FaucetActivationVariant,
  type FaucetClaimMethod,
  readFaucetActivationJourney,
  resolveFaucetActivationVariant,
  startFaucetActivationJourney,
  trackDeveloperActivationQuickstart,
  updateFaucetActivationJourney,
} from '../../lib/developer-activation'
import { onPostHogReady } from '../../lib/posthog'

type FaucetActivationContextValue = {
  claimFailed: (method: FaucetClaimMethod, error: unknown) => void
  claimStarted: (method: FaucetClaimMethod) => void
  claimSucceeded: (method: FaucetClaimMethod, receiptCount: number) => void
  hasSuccessfulClaim: boolean
  variant: FaucetActivationVariant
}

const emptyContext: FaucetActivationContextValue = {
  claimFailed: () => {},
  claimStarted: () => {},
  claimSucceeded: () => {},
  hasSuccessfulClaim: false,
  variant: 'control',
}

const FaucetActivationContext = React.createContext<FaucetActivationContextValue>(emptyContext)

export function useFaucetActivation() {
  return React.useContext(FaucetActivationContext)
}

export function FaucetActivationProvider({ children }: React.PropsWithChildren) {
  const e2eVariant = import.meta.env.VITE_E2E === 'true' ? ('guided_handoff' as const) : null
  const [variant, setVariant] = React.useState<FaucetActivationVariant>(e2eVariant ?? 'control')
  const [hasSuccessfulClaim, setHasSuccessfulClaim] = React.useState(false)
  const variantRef = React.useRef<FaucetActivationVariant>(e2eVariant ?? 'control')
  const variantLockedRef = React.useRef(Boolean(e2eVariant))
  const viewedRef = React.useRef(false)
  const claimStartedAtRef = React.useRef<Partial<Record<FaucetClaimMethod, number>>>({})

  const trackView = React.useCallback((assignedVariant: FaucetActivationVariant) => {
    if (viewedRef.current) return
    viewedRef.current = true
    captureDeveloperActivationEvent('faucet_viewed', assignedVariant, {})
  }, [])

  React.useEffect(() => {
    const existingJourney = readFaucetActivationJourney()
    if (existingJourney) {
      variantRef.current = existingJourney.experimentVariant
      variantLockedRef.current = true
      setVariant(existingJourney.experimentVariant)
      setHasSuccessfulClaim(true)
      trackView(existingJourney.experimentVariant)
      return
    }

    if (e2eVariant) {
      trackView(e2eVariant)
      return
    }

    let unsubscribeFeatureFlags: (() => void) | undefined
    const unsubscribeReady = onPostHogReady((posthog) => {
      unsubscribeFeatureFlags?.()
      unsubscribeFeatureFlags = posthog.onFeatureFlags((_flags, _variants, context) => {
        if (variantLockedRef.current) return
        const assignedVariant = context.errorsLoading
          ? 'control'
          : resolveFaucetActivationVariant(posthog.getFeatureFlag(FAUCET_ACTIVATION_EXPERIMENT_KEY))
        variantRef.current = assignedVariant
        setVariant(assignedVariant)
        trackView(assignedVariant)
      })
    })

    return () => {
      unsubscribeFeatureFlags?.()
      unsubscribeReady()
    }
  }, [e2eVariant, trackView])

  const claimStarted = React.useCallback(
    (method: FaucetClaimMethod) => {
      const assignedVariant = variantRef.current
      variantLockedRef.current = true
      claimStartedAtRef.current[method] = Date.now()
      trackView(assignedVariant)
      captureDeveloperActivationEvent('faucet_claim_started', assignedVariant, {
        claim_method: method,
      })
    },
    [trackView],
  )

  const claimSucceeded = React.useCallback((method: FaucetClaimMethod, receiptCount: number) => {
    const now = Date.now()
    const assignedVariant = variantRef.current
    const startedAt = claimStartedAtRef.current[method]
    captureDeveloperActivationEvent('faucet_claim_succeeded', assignedVariant, {
      claim_duration_bucket: bucketClaimDuration(
        startedAt === undefined ? undefined : now - startedAt,
      ),
      claim_method: method,
      receipt_count: receiptCount,
    })
    startFaucetActivationJourney(method, assignedVariant, now)
    setHasSuccessfulClaim(true)
  }, [])

  const claimFailed = React.useCallback((method: FaucetClaimMethod, error: unknown) => {
    const now = Date.now()
    const startedAt = claimStartedAtRef.current[method]
    captureDeveloperActivationEvent('faucet_claim_failed', variantRef.current, {
      claim_duration_bucket: bucketClaimDuration(
        startedAt === undefined ? undefined : now - startedAt,
      ),
      claim_method: method,
      failure_category: categorizeActivationFailure(error),
    })
  }, [])

  const value = React.useMemo(
    () => ({ claimFailed, claimStarted, claimSucceeded, hasSuccessfulClaim, variant }),
    [claimFailed, claimStarted, claimSucceeded, hasSuccessfulClaim, variant],
  )

  return (
    <FaucetActivationContext.Provider value={value}>{children}</FaucetActivationContext.Provider>
  )
}

export function FaucetActivationHandoff() {
  const { hasSuccessfulClaim, variant } = useFaucetActivation()
  if (!hasSuccessfulClaim || variant !== 'guided_handoff') return null

  const destination = '/docs/guide/payments/send-a-payment#send-payment-demo'
  return (
    <aside className="mt-6 rounded-2xl border border-gray4 bg-gray1 p-6" aria-live="polite">
      <h2 className="font-medium text-[18px] text-gray12">Send your first testnet payment</h2>
      <ol className="mt-3 list-decimal space-y-1 ps-5 text-[14px] text-gray10">
        <li>Open the payment quickstart.</li>
        <li>Send an AlphaUSD testnet payment.</li>
        <li>Confirm delivery from the transaction receipt.</li>
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <a
          className="rounded-full bg-accent px-4 py-2 font-medium text-[14px] text-white"
          href={destination}
          onClick={() => updateFaucetActivationJourney({ handoffClicked: true })}
        >
          Send your first testnet payment
        </a>
        <a className="text-[14px] text-accent hover:underline" href="/docs">
          Browse the docs
        </a>
      </div>
    </aside>
  )
}

export function DeveloperActivationQuickstartTracker() {
  React.useEffect(() => {
    trackDeveloperActivationQuickstart()
  }, [])
  return null
}

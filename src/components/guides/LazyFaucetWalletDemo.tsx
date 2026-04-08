'use client'
import { lazy, Suspense } from 'react'

const FaucetWalletDemo = lazy(() => import('./FaucetWalletDemo'))

function Placeholder() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray6 border-dashed text-[14px] text-gray9">
      Loading demo…
    </div>
  )
}

export function LazyFundWallet() {
  return (
    <Suspense fallback={<Placeholder />}>
      <FaucetWalletDemo variant="wallet" />
    </Suspense>
  )
}

export function LazyFundAddress() {
  return (
    <Suspense fallback={<Placeholder />}>
      <FaucetWalletDemo variant="address" />
    </Suspense>
  )
}

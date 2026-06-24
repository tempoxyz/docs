'use client'

import TokensShowcase from './TokensShowcase'
import TransactionsShowcase from './TransactionsShowcase'

export default function HomeShowcases() {
  return (
    <>
      <div id="tokens" className="mt-[140px] scroll-mt-12">
        <TokensShowcase />
      </div>
      <div id="transactions" className="-mt-px scroll-mt-12">
        <TransactionsShowcase />
      </div>
    </>
  )
}

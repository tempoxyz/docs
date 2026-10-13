'use client'

import * as ui from './HomeShowcases.recipes'
import TokensShowcase from './TokensShowcase'
import TransactionsShowcase from './TransactionsShowcase'

export default function HomeShowcases() {
  return (
    <>
      <div id="tokens" {...ui.homeShowcasesLayout()}>
        <TokensShowcase />
      </div>
      <div id="transactions" {...ui.homeShowcasesLayout2()}>
        <TransactionsShowcase />
      </div>
    </>
  )
}

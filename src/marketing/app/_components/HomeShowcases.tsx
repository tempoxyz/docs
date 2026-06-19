'use client'

import { useState } from 'react'
import type { ShowcaseMode } from './ModeToggle'
import TokensShowcase from './TokensShowcase'
import TransactionsShowcase from './TransactionsShowcase'

export default function HomeShowcases() {
  const [mode, setMode] = useState<ShowcaseMode>('visual')

  return (
    <>
      <div id="tokens" className="mt-[140px] scroll-mt-12">
        <TokensShowcase mode={mode} setMode={setMode} />
      </div>
      <div id="transactions" className="-mt-px scroll-mt-12">
        <TransactionsShowcase mode={mode} setMode={setMode} />
      </div>
    </>
  )
}

'use client'

import { Fragment, useState } from 'react'
import FeatureDiagram from '../diagrams/_components/FeatureDiagram'
import type { FeatureDiagramSpec } from '../diagrams/_lib/featureDiagram'
import Button from './Button'
import CodeWindow, { type CodeVariant } from './CodeWindow'
import EdgeMarkers from './EdgeMarkers'
import ModeToggle, { type ShowcaseMode } from './ModeToggle'
import { panelFadeClass } from './panelFade'
import Reveal from './Reveal'
import {
  feeSponsorCodeVariants,
  feeTokenCodeVariants,
  paymentLaneCodeVariants,
} from './transactionCodeVariants'

const VISUAL_HEIGHT = 'lg:h-[424px]'
const CODE_HEIGHT = 'max-h-[390px]'
const DIAGRAM_CONTAINER = 'p-6 lg:min-h-0 lg:p-10'
const SHOWCASE_HEIGHT = 'lg:min-h-[560px]'

type Row = {
  title: string
  desc: string
  href: string
  spec: FeatureDiagramSpec
  panelTitle: string
  variants: CodeVariant[]
}

const rows: Row[] = [
  {
    title: 'Pay fees in stablecoins',
    desc: 'Users can pay blockchain fees using any stablecoin they choose.',
    href: '/docs/guide/payments/pay-fees-in-any-stablecoin',
    spec: {
      kind: 'feeamm',
      user: { accent: 0, label: 'USER', detail: 'SELECTS FEE TOKEN' },
      selectedToken: { accent: 0, symbol: 'USDC' },
      receivedToken: { accent: 1, symbol: 'USDT' },
      ammLabel: 'FEE AMM',
      validator: { accent: 1, label: 'VALIDATOR', detail: 'RECEIVES USDT' },
    },
    panelTitle: 'fee-token.ts',
    variants: feeTokenCodeVariants,
  },
  {
    title: 'Predictable fees',
    desc: 'Dedicated payment lanes keep payment and payout fees predictable.',
    href: '/docs/protocol/blockspace/payment-lane-specification#motivation',
    spec: {
      kind: 'blockspace',
      payments: [
        { accent: 3, label: 'PAYMENT', detail: 'FEE $0.001' },
        { accent: 1, label: 'PAYOUT', detail: 'FEE $0.001' },
      ],
      general: { accent: 0, label: 'AIRDROP / TRADE', detail: 'FEE $0.01' },
      paymentLaneLabel: 'PAYMENT BLOCKSPACE',
      generalLabel: 'GENERAL BLOCKSPACE',
    },
    panelTitle: 'payment-lane.ts',
    variants: paymentLaneCodeVariants,
  },
  {
    title: 'Fee sponsorship',
    desc: 'Apps and agents can pay on behalf of users.',
    href: '/docs/guide/payments/sponsor-user-fees',
    spec: {
      kind: 'sponsor',
      user: { accent: 0, label: 'USER', detail: 'SENDS TX' },
      sponsor: { accent: 1, label: 'APP', detail: 'FEE PAYER' },
      txLabel: 'TEMPO TX',
      actionLabel: 'PAYMENT',
      gasLabel: 'APP',
      hubLabel: 'EXECUTES',
      caption: 'FEE PAYER BALANCE IS DEBITED',
    },
    panelTitle: 'sponsor.ts',
    variants: feeSponsorCodeVariants,
  },
] satisfies Row[]

function VisualMock({ active }: { active: Row }) {
  return (
    // Bleed over the visual column padding so the diagram sets the full frame.
    <div className={`${VISUAL_HEIGHT} lg:-mx-10`}>
      <FeatureDiagram spec={active.spec} containerClassName={DIAGRAM_CONTAINER} />
    </div>
  )
}

export default function TransactionsShowcase() {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<ShowcaseMode>('visual')
  const selectRow = (index: number) => {
    if (index !== active) {
      setActive(index)
    }
  }

  return (
    <section>
      <Reveal className={`relative border border-line lg:flex ${SHOWCASE_HEIGHT} lg:items-stretch`}>
        <EdgeMarkers wideOnly />
        <div className="flex flex-col justify-center bg-surface-shell p-7 lg:w-1/2 lg:p-12">
          <h2 className="max-w-[520px] font-sans text-[clamp(1.5rem,5vw,2.5rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased">
            Flexible fees for apps using stablecoins.
          </h2>
          <div className="-mx-7 mt-8 border-line border-y lg:-mx-12">
            {rows.map((row, i) => (
              <button
                key={row.title}
                type="button"
                onMouseEnter={() => selectRow(i)}
                onFocus={() => selectRow(i)}
                onClick={() => selectRow(i)}
                aria-pressed={active === i}
                className={`group flex w-full items-start justify-between gap-6 border-line border-b px-7 py-5 text-left last:border-b-0 lg:px-12 ${
                  active === i ? 'text-foreground' : 'text-foreground/55 hover:text-foreground/80'
                }`}
              >
                <span>
                  <span className="block font-sans text-[20px] leading-[1.2] tracking-[0]">
                    {row.title}
                  </span>
                  <span className="mt-2 block max-w-[420px] font-sans text-[14px] text-foreground/55 leading-[1.45] tracking-[0] group-hover:text-foreground/65">
                    {row.desc}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`mt-1.5 size-2 shrink-0 ${active === i ? 'bg-foreground' : 'bg-foreground/25'}`}
                />
              </button>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            <Button href="/docs/protocol/transactions" variant="primary">
              Explore transactions
            </Button>
            <Button href="/docs/protocol/transactions/spec-tempo-transaction" arrow>
              Read docs
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center border-line border-t p-6 pt-18 lg:w-1/2 lg:border-t-0 lg:border-l lg:p-10 lg:pt-18">
          <div className="absolute top-6 right-6 z-20 lg:top-8 lg:right-10">
            <ModeToggle mode={mode} setMode={setMode} />
          </div>
          <div className="grid w-full max-w-[560px] grid-cols-1">
            {rows.map((row, i) => (
              <Fragment key={row.title}>
                <div
                  inert={!(i === active && mode === 'visual')}
                  className={panelFadeClass(i === active && mode === 'visual')}
                >
                  <VisualMock active={row} />
                </div>
                <div
                  inert={!(i === active && mode === 'code')}
                  className={`${panelFadeClass(i === active && mode === 'code')} pb-16`}
                >
                  <CodeWindow
                    title={row.panelTitle}
                    variants={row.variants}
                    heightClassName={CODE_HEIGHT}
                  />
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

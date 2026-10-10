'use client'

import { Fragment, useState } from 'react'
import { cx as composeStyles } from 'zyzz'
import FeatureDiagram from '../diagrams/_components/FeatureDiagram'
import type { FeatureDiagramSpec } from '../diagrams/_lib/featureDiagram'
import Button from './Button'
import CodeWindow, { type CodeVariant } from './CodeWindow'
import EdgeMarkers from './EdgeMarkers'
import ModeToggle, { type ShowcaseMode } from './ModeToggle'
import { panelFadeClass } from './panelFade'
import Reveal from './Reveal'
import * as ui from './TransactionsShowcase.recipes'
import {
  feeSponsorCodeVariants,
  feeTokenCodeVariants,
  paymentLaneCodeVariants,
} from './transactionCodeVariants'

const VISUAL_HEIGHT = 'lg:h-[424px]'
const CODE_HEIGHT = 'max-h-[390px]'
const DIAGRAM_CONTAINER = ui.transactionsShowcaseStateState().className
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
        { accent: 3, label: 'PAYMENT', detail: '<$0.001 average fee' },
        { accent: 1, label: 'PAYOUT', detail: '<$0.001 average fee' },
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
    <div className={`${VISUAL_HEIGHT} ${ui.visualMockLayout().className} `}>
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
      <Reveal className={` ${ui.reveal().className} ${SHOWCASE_HEIGHT} ${ui.reveal2().className} `}>
        <EdgeMarkers wideOnly />
        <div {...ui.transactionsShowcaseLayout()}>
          <h2 {...ui.transactionsShowcaseHeading()}>Flexible fees for apps using stablecoins.</h2>
          <div {...ui.transactionsShowcaseLayout2()}>
            {rows.map((row, i) => (
              <button
                key={row.title}
                type="button"
                onMouseEnter={() => selectRow(i)}
                onFocus={() => selectRow(i)}
                onClick={() => selectRow(i)}
                aria-pressed={active === i}
                {...composeStyles(
                  ui.transactionsShowcaseButton({ className: 'group' }),
                  !!(active === i) && ui.transactionsShowcaseButton2(),
                  !(active === i) && ui.transactionsShowcaseButton3(),
                )}
              >
                <span>
                  <span {...ui.transactionsShowcaseText()}>{row.title}</span>
                  <span {...ui.transactionsShowcaseText2()}>{row.desc}</span>
                </span>
                <span
                  aria-hidden="true"
                  {...composeStyles(
                    ui.transactionsShowcaseText3(),
                    !!(active === i) && ui.transactionsShowcaseText4(),
                    !(active === i) && ui.transactionsShowcaseText5(),
                  )}
                />
              </button>
            ))}
          </div>
          <div {...ui.transactionsShowcaseLayout3()}>
            <Button href="/docs/protocol/transactions" variant="primary">
              Explore transactions
            </Button>
            <Button href="/docs/protocol/transactions/spec-tempo-transaction" arrow>
              Read docs
            </Button>
          </div>
        </div>

        <div {...ui.transactionsShowcaseLayout4()}>
          <div {...ui.transactionsShowcaseLayout5()}>
            <ModeToggle mode={mode} setMode={setMode} />
          </div>
          <div {...ui.transactionsShowcaseLayout6()}>
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
                  className={`${panelFadeClass(i === active && mode === 'code')} ${ui.transactionsShowcaseLayout7().className} `}
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

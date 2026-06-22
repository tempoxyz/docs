'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import Button from '../../_components/Button'
import CodeWindow, { type CodeVariant } from '../../_components/CodeWindow'
import EdgeMarkers from '../../_components/EdgeMarkers'
import ModeToggle, { type ShowcaseMode } from '../../_components/ModeToggle'
import { colorForIndex } from '../../_components/palette'
import Reveal from '../../_components/Reveal'
import {
  accessKeyCodeVariants,
  batchingCodeVariants,
  feeSponsorCodeVariants,
  feeTokenCodeVariants,
  parallelCodeVariants,
  paymentLaneCodeVariants,
  schedulingCodeVariants,
} from '../../_components/transactionCodeVariants'
import FeatureDiagram from '../../diagrams/_components/FeatureDiagram'
import type { FeatureDiagramSpec } from '../../diagrams/_lib/featureDiagram'
import FeatureFaq, { type FaqItem } from './FeatureFaq'

type TransactionPrimitive = {
  title: string
  desc: string
  href: string
  panelTitle: string
  spec: FeatureDiagramSpec
  variants: CodeVariant[]
}

type PrimitiveGroup = {
  id: string
  title: string
  desc: string
  ctas: { label: string; href: string; primary?: boolean }[]
  items: TransactionPrimitive[]
}

const feeItems: TransactionPrimitive[] = [
  {
    title: 'Pay fees in stablecoins',
    desc: 'Users can pay blockchain fees using any stablecoin they choose.',
    href: '/docs/guide/payments/pay-fees-in-any-stablecoin',
    panelTitle: 'fee-token.ts',
    spec: {
      kind: 'feeamm',
      user: { accent: 0, label: 'USER', detail: 'SELECTS FEE TOKEN' },
      selectedToken: { accent: 0, symbol: 'USDC' },
      receivedToken: { accent: 1, symbol: 'USDT' },
      ammLabel: 'FEE AMM',
      validator: { accent: 1, label: 'VALIDATOR', detail: 'RECEIVES USDT' },
    },
    variants: feeTokenCodeVariants,
  },
  {
    title: 'Predictable fees',
    desc: 'Dedicated payment lanes keep payment and payout fees predictable.',
    href: '/docs/protocol/blockspace/payment-lane-specification#motivation',
    panelTitle: 'payment-lanes.ts',
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
    variants: paymentLaneCodeVariants,
  },
  {
    title: 'Fee sponsorship',
    desc: 'Apps and agents can pay on behalf of users.',
    href: '/docs/guide/payments/sponsor-user-fees',
    panelTitle: 'sponsor-fees.ts',
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
    variants: feeSponsorCodeVariants,
  },
]

const flexibilityItems: TransactionPrimitive[] = [
  {
    title: 'Batching',
    desc: 'Bundle multiple calls into one atomic transaction.',
    href: '/docs/protocol/transactions#batch-calls',
    panelTitle: 'batch.ts',
    spec: {
      kind: 'batch',
      batchLabel: 'BATCH',
      calls: [
        { accent: 0, label: 'APPROVE' },
        { accent: 1, label: 'SWAP' },
        { accent: 2, label: 'TRANSFER' },
      ],
      sealLabel: 'ONE SIGNATURE',
      openLabel: 'OPEN',
      closeLabel: 'CLOSE',
      hubLabel: 'EXECUTES',
      caption: 'ALL CALLS LAND OR NONE DO',
    },
    variants: batchingCodeVariants,
  },
  {
    title: 'Parallelization',
    desc: 'Nonce keys let independent transactions execute at the same time.',
    href: '/docs/protocol/transactions#concurrent-transactions',
    panelTitle: 'parallel.ts',
    spec: {
      kind: 'lanes',
      txs: [
        { accent: 0, label: 'PAYMENT A', detail: 'TOUCHES ACCT A' },
        { accent: 1, label: 'PAYMENT B', detail: 'TOUCHES ACCT B' },
        { accent: 2, label: 'PAYOUT', detail: 'TOUCHES ACCT C' },
      ],
      blockLabel: 'ONE BLOCK',
      blockSub: 'EXECUTED IN PARALLEL',
    },
    variants: parallelCodeVariants,
  },
  {
    title: 'Scheduling',
    desc: 'Transactions can be valid only inside a defined execution window.',
    href: '/docs/protocol/transactions#scheduled-transactions',
    panelTitle: 'schedule.ts',
    spec: {
      kind: 'batch',
      batchLabel: 'SIGNED TX',
      calls: [
        { accent: 1, label: 'PAYROLL' },
        { accent: 2, label: 'INVOICE' },
      ],
      sealLabel: 'SIGNED NOW',
      openLabel: 'VALID AFTER',
      closeLabel: 'VALID BEFORE',
      hubLabel: 'EXECUTES',
      caption: 'THE NETWORK HONORS THE TIME WINDOW',
    },
    variants: schedulingCodeVariants,
  },
]

const accessKeysSpec: FeatureDiagramSpec = {
  kind: 'keys',
  account: 1,
  accountLabel: 'ACCOUNT',
  accountSub: 'ROOT · PASSKEY',
  keys: [
    { accent: 0, cap: 0.55, name: 'APP KEY', scope: 'PAYMENTS · ≤ $500/DAY · 7D' },
    { accent: 2, cap: 0.32, name: 'AGENT KEY', scope: 'CHECKOUT · ≤ $100/DAY' },
    { accent: 3, cap: 0, name: 'OLD KEY', scope: 'REVOKED · INSTANTLY', revoked: true },
  ],
}

const accessKeyItems = [
  {
    title: 'Scoped signing',
    desc: 'Delegate one flow without delegating the account.',
    href: '/docs/protocol/transactions/AccountKeychain#call-scope-enforcement',
  },
  {
    title: 'Spend limits',
    desc: 'Cap what a key can move before it ever signs.',
    href: '/docs/protocol/transactions/AccountKeychain#spending-limit-enforcement',
  },
  {
    title: 'Revocation',
    desc: 'Turn off old keys without rotating the root.',
    href: '/docs/protocol/transactions/AccountKeychain#key-revocation',
  },
]

const CODE_WINDOW_HEIGHT = 'max-h-[412px] lg:max-h-[440px]'

const groups: PrimitiveGroup[] = [
  {
    id: 'fees',
    title: 'Flexible fees for apps using stablecoins.',
    desc: 'Pay fees in supported stablecoins, keep payment costs predictable with dedicated blockspace, and sponsor fees for users.',
    ctas: [
      { label: 'Explore transactions', href: '/docs/protocol/transactions', primary: true },
      { label: 'Read docs', href: '/docs/protocol/transactions/spec-tempo-transaction' },
    ],
    items: feeItems,
  },
  {
    id: 'flexibility',
    title: 'Transaction controls for production throughput.',
    desc: 'Batch calls, parallelize independent transactions, and schedule execution windows for high-volume services.',
    ctas: [
      { label: 'Explore transactions', href: '/docs/protocol/transactions', primary: true },
      { label: 'Read docs', href: '/docs/protocol/transactions/spec-tempo-transaction' },
    ],
    items: flexibilityItems,
  },
]

const TRANSACTION_FAQS: FaqItem[] = [
  {
    question: 'What is a Tempo Transaction?',
    answer: [
      'A Tempo Transaction is the ',
      {
        text: 'native transaction type',
        href: '/docs/protocol/transactions/spec-tempo-transaction#transaction-type',
      },
      ' for payments on Tempo. It combines ',
      {
        text: 'batching, fee tokens, fee sponsorship, scheduling, access keys, and nonce keys',
        href: '/docs/protocol/transactions#properties',
      },
      ' without requiring separate paymasters, relayers, or account layers.',
    ],
  },
  {
    question: 'Do users need to hold a gas token?',
    answer: [
      'No. Users can pay fees with ',
      {
        text: 'configurable fee tokens',
        href: '/docs/protocol/transactions#configurable-fee-tokens',
      },
      ', or an app can ',
      {
        text: 'sponsor the fee',
        href: '/docs/protocol/transactions#fee-sponsorship',
      },
      ' with a fee-payer signature.',
    ],
  },
  {
    question: 'How is fee sponsorship different from a paymaster?',
    answer: [
      'Fee sponsorship is part of the transaction itself. In the ',
      {
        text: 'fee sponsorship flow',
        href: '/docs/protocol/fees/spec-fee#fee-sponsorship-flow',
      },
      ', the user signs the action, the sponsor signs the fee-payer portion, and the protocol validates the ',
      {
        text: 'fee payer signature',
        href: '/docs/protocol/transactions/spec-tempo-transaction#fee-payer-signature-details',
      },
      ' before debiting the sponsor for fees.',
    ],
  },
  {
    question: 'How does parallelization work?',
    answer: [
      {
        text: 'Nonce keys',
        href: '/docs/protocol/transactions/spec-tempo-transaction#parallelizable-nonces',
      },
      ' let ',
      {
        text: 'concurrent transactions',
        href: '/docs/protocol/transactions#concurrent-transactions',
      },
      ' advance separately, so one pending transaction does not block unrelated work from the same account.',
    ],
  },
  {
    question: 'Can transactions be scheduled?',
    answer: [
      'Yes. A transaction can include ',
      {
        text: 'validAfter and validBefore',
        href: '/docs/protocol/transactions#scheduled-transactions',
      },
      ' fields, and ',
      {
        text: 'time window validation',
        href: '/docs/protocol/transactions#scheduled-transactions',
      },
      ' makes it executable only inside a defined time window.',
    ],
  },
  {
    question: 'What are access keys for?',
    answer: [
      {
        text: 'Access keys',
        href: '/docs/protocol/transactions/spec-tempo-transaction#access-keys',
      },
      ' let users delegate scoped signing authority to apps or agents. Keys can be limited by ',
      {
        text: 'scope',
        href: '/docs/protocol/transactions/AccountKeychain',
      },
      ', ',
      {
        text: 'spending amount',
        href: '/docs/protocol/transactions/AccountKeychain',
      },
      ', and ',
      {
        text: 'expiry',
        href: '/docs/protocol/transactions/AccountKeychain',
      },
      ', then revoked without rotating the root account key.',
    ],
  },
]

function AccessKeysSection() {
  const [mode, setMode] = useState<ShowcaseMode>('visual')

  return (
    <section id="access-keys" className="mt-[140px] scroll-mt-12">
      <Reveal className="relative border-line border-t">
        <EdgeMarkers wideOnly />
        {/* Alternated layout: visual on the left, content on the right. */}
        <div className="grid border-line border-b lg:grid-cols-2">
          <div className="relative border-line border-b lg:min-h-0 lg:border-r lg:border-b-0">
            <div className="absolute right-5 bottom-5 z-20 lg:right-8 lg:bottom-8">
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
            <div className="grid grid-cols-1 lg:absolute lg:inset-0 lg:min-h-0">
              <div
                inert={mode !== 'visual'}
                className={`grid lg:h-full lg:min-h-0 ${mode === 'visual' ? '[grid-area:1/1]' : 'hidden'}`}
              >
                <FeatureDiagram spec={accessKeysSpec} />
              </div>
              <div
                inert={mode !== 'code'}
                className={`flex min-h-[520px] items-center justify-center p-6 pb-20 lg:h-full lg:min-h-0 lg:p-10 lg:pb-24 ${mode === 'code' ? '[grid-area:1/1]' : 'hidden'}`}
              >
                <div className="w-full max-w-[600px]">
                  <CodeWindow
                    title="access-keys.ts"
                    variants={accessKeyCodeVariants}
                    heightClassName={CODE_WINDOW_HEIGHT}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-shell">
            <div className="px-5 py-14 lg:px-12 lg:py-20">
              <h2 className="max-w-[560px] text-balance font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
                Set spending limits using access keys.
              </h2>
              <p className="mt-5 max-w-[540px] font-sans text-[16px] text-foreground/50 leading-[1.5] tracking-[0]">
                Authorize scoped keys with spending limits and expiry so apps and agents can move
                approved funds without repeated user prompts.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <Button
                  href="/docs/protocol/transactions/spec-tempo-transaction#access-keys"
                  variant="primary"
                >
                  Access keys
                </Button>
                <Button href="/docs/protocol/transactions/AccountKeychain" arrow>
                  Read docs
                </Button>
              </div>
            </div>

            <div className="grid border-line border-t sm:grid-cols-3 lg:grid-cols-1">
              {accessKeyItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group border-line border-b px-5 py-6 transition-colors last:border-b-0 hover:bg-surface-block sm:border-r sm:last:border-r-0 lg:border-r-0 lg:px-12"
                >
                  <h3 className="font-sans text-[18px] text-foreground leading-[1.2] tracking-[0]">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-sans text-[14px] text-foreground/45 leading-[1.45] tracking-[0] group-hover:text-foreground/55">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function PrimitiveGroupSection({ group, index }: { group: PrimitiveGroup; index: number }) {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<ShowcaseMode>('visual')

  const selectItem = (index: number) => {
    if (index !== active) setActive(index)
  }

  return (
    <section id={group.id} className={`${index === 0 ? '' : 'mt-[140px]'} scroll-mt-12`}>
      <Reveal className="relative border-line border-y">
        <EdgeMarkers wideOnly />
        <div className="flex flex-col items-center px-5 py-14 text-center lg:py-20">
          <h2 className="text-balance font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
            {group.title}
          </h2>
          <p className="mt-5 max-w-[560px] text-balance font-sans text-[16px] text-foreground/50 leading-[1.5] tracking-[0] lg:text-[18px]">
            {group.desc}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {group.ctas.map((cta) => (
              <Button
                key={cta.label}
                href={cta.href}
                variant={cta.primary ? 'primary' : 'secondary'}
                arrow={!cta.primary}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Mirrors the SDK paired-grid: primitive cards on the left drive the
            shared diagram/code panel on the right. The dotted icons tie each
            card to its accent color in the diagram. */}
        <div className="grid border-line border-t bg-surface-shell lg:grid-cols-2">
          <ul className="grid border-line border-b lg:border-r lg:border-b-0">
            {group.items.map((item, i) => (
              <li key={item.title} className="border-line border-b last:border-b-0">
                <Link
                  href={item.href}
                  onMouseEnter={() => selectItem(i)}
                  onFocus={() => selectItem(i)}
                  onClick={() => selectItem(i)}
                  className={`group flex h-full w-full flex-col gap-3 p-7 text-left transition-colors lg:p-8 ${
                    active === i
                      ? 'bg-surface-block text-foreground'
                      : 'text-foreground/55 hover:bg-surface-block hover:text-foreground/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="size-4 shrink-0"
                      style={{
                        backgroundImage: `radial-gradient(circle, ${colorForIndex(i)} 1px, transparent 1.4px)`,
                        backgroundSize: '5px 5px',
                      }}
                    />
                    <span className="font-sans text-[20px] leading-[1.2] tracking-[0] lg:text-[24px]">
                      {item.title}
                    </span>
                  </span>
                  <span className="max-w-[480px] font-sans text-[16px] text-foreground/45 leading-[1.4] tracking-[0] group-hover:text-foreground/55">
                    {item.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative lg:min-h-[520px]">
            <div className="absolute right-5 bottom-5 z-20 lg:right-8 lg:bottom-8">
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
            <div className="grid grid-cols-1 lg:absolute lg:inset-0 lg:min-h-0">
              {group.items.map((item, i) => (
                <Fragment key={item.title}>
                  <div
                    inert={!(i === active && mode === 'visual')}
                    className={`grid lg:h-full lg:min-h-0 ${i === active && mode === 'visual' ? '[grid-area:1/1]' : 'hidden'}`}
                  >
                    <FeatureDiagram spec={item.spec} />
                  </div>
                  <div
                    inert={!(i === active && mode === 'code')}
                    className={`flex min-h-[460px] items-center justify-center p-6 pb-20 lg:h-full lg:min-h-0 lg:p-10 lg:pb-24 ${i === active && mode === 'code' ? '[grid-area:1/1]' : 'hidden'}`}
                  >
                    <div className="w-full max-w-[560px]">
                      <CodeWindow
                        title={item.panelTitle}
                        variants={item.variants}
                        heightClassName={CODE_WINDOW_HEIGHT}
                      />
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default function TransactionsSections() {
  return (
    <>
      <PrimitiveGroupSection group={groups[0]} index={0} />
      <AccessKeysSection />
      <PrimitiveGroupSection group={groups[1]} index={1} />
      <FeatureFaq
        title="Tempo Transactions FAQ."
        intro="The main mechanics behind native payment transactions, from stablecoin fees to delegated signing."
        items={TRANSACTION_FAQS}
      />
    </>
  )
}

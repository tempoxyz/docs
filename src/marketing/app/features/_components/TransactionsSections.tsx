'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import { cx as composeStyles } from 'zyzz'
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
import * as ui from './TransactionsSections.recipes'

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
        { accent: 3, label: 'PAYMENT', detail: '<$0.001 average fee' },
        { accent: 1, label: 'PAYOUT', detail: '<$0.001 average fee' },
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
    <section id="access-keys" {...ui.accessKeysSectionSection()}>
      <Reveal className={ui.reveal().className}>
        <EdgeMarkers wideOnly />
        {/* Alternated layout: visual on the left, content on the right. */}
        <div {...ui.accessKeysSectionLayout()}>
          <div {...ui.accessKeysSectionLayout2()}>
            <div {...ui.accessKeysSectionLayout3()}>
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
            <div {...ui.accessKeysSectionLayout4()}>
              <div
                inert={mode !== 'visual'}
                {...composeStyles(
                  ui.accessKeysSectionLayout5(),
                  !!(mode === 'visual') && ui.accessKeysSectionLayout6(),
                  !(mode === 'visual') && ui.accessKeysSectionLayout7(),
                )}
              >
                <FeatureDiagram spec={accessKeysSpec} />
              </div>
              <div
                inert={mode !== 'code'}
                {...composeStyles(
                  ui.accessKeysSectionLayout8(),
                  !!(mode === 'code') && ui.accessKeysSectionLayout6(),
                  !(mode === 'code') && ui.accessKeysSectionLayout7(),
                )}
              >
                <div {...ui.accessKeysSectionLayout9()}>
                  <CodeWindow
                    title="access-keys.ts"
                    variants={accessKeyCodeVariants}
                    heightClassName={CODE_WINDOW_HEIGHT}
                  />
                </div>
              </div>
            </div>
          </div>

          <div {...ui.accessKeysSectionLayout10()}>
            <div {...ui.accessKeysSectionLayout11()}>
              <h2 {...ui.accessKeysSectionHeading()}>Set spending limits using access keys.</h2>
              <p {...ui.accessKeysSectionDescription()}>
                Authorize scoped keys with spending limits and expiry so apps and agents can move
                approved funds without repeated user prompts.
              </p>
              <div {...ui.accessKeysSectionLayout12()}>
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

            <div {...ui.accessKeysSectionLayout13()}>
              {accessKeyItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={ui.link({ className: 'group' }).className}
                >
                  <h3 {...ui.accessKeysSectionHeading2()}>{item.title}</h3>
                  <p {...ui.accessKeysSectionDescription2()}>{item.desc}</p>
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
    <section
      id={group.id}
      {...composeStyles(
        !(index === 0) && ui.primitiveGroupSectionSection(),
        ui.primitiveGroupSectionSection2(),
      )}
    >
      <Reveal className={ui.reveal2().className}>
        <EdgeMarkers wideOnly />
        <div {...ui.primitiveGroupSectionLayout()}>
          <h2 {...ui.primitiveGroupSectionHeading()}>{group.title}</h2>
          <p {...ui.primitiveGroupSectionDescription()}>{group.desc}</p>
          <div {...ui.primitiveGroupSectionLayout2()}>
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
        <div {...ui.primitiveGroupSectionLayout3()}>
          <ul {...ui.primitiveGroupSectionList()}>
            {group.items.map((item, i) => (
              <li key={item.title} {...ui.primitiveGroupSectionItem()}>
                <Link
                  href={item.href}
                  onMouseEnter={() => selectItem(i)}
                  onFocus={() => selectItem(i)}
                  onClick={() => selectItem(i)}
                  className={
                    composeStyles(
                      ui.link2({ className: 'group' }),
                      !!(active === i) && ui.link3(),
                      !(active === i) && ui.link4(),
                    ).className
                  }
                >
                  <span {...ui.primitiveGroupSectionText()}>
                    <span
                      aria-hidden="true"
                      {...ui.primitiveGroupSectionTextAppearance({
                        value0: `radial-gradient(circle, ${colorForIndex(i)} 1px, transparent 1.4px)`,
                        className: ui.primitiveGroupSectionText2().className,
                      })}
                    />
                    <span {...ui.primitiveGroupSectionText3()}>{item.title}</span>
                  </span>
                  <span {...ui.primitiveGroupSectionText4()}>{item.desc}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div {...ui.primitiveGroupSectionLayout4()}>
            <div {...ui.accessKeysSectionLayout3()}>
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
            <div {...ui.accessKeysSectionLayout4()}>
              {group.items.map((item, i) => (
                <Fragment key={item.title}>
                  <div
                    inert={!(i === active && mode === 'visual')}
                    {...composeStyles(
                      ui.accessKeysSectionLayout5(),
                      !!(i === active && mode === 'visual') && ui.accessKeysSectionLayout6(),
                      !(i === active && mode === 'visual') && ui.accessKeysSectionLayout7(),
                    )}
                  >
                    <FeatureDiagram spec={item.spec} />
                  </div>
                  <div
                    inert={!(i === active && mode === 'code')}
                    {...composeStyles(
                      ui.primitiveGroupSectionLayout5(),
                      !!(i === active && mode === 'code') && ui.accessKeysSectionLayout6(),
                      !(i === active && mode === 'code') && ui.accessKeysSectionLayout7(),
                    )}
                  >
                    <div {...ui.primitiveGroupSectionLayout6()}>
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

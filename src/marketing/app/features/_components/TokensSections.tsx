'use client'

import { useState } from 'react'
import Button from '../../_components/Button'
import CodeWindow, { type CodeVariant } from '../../_components/CodeWindow'
import EdgeMarkers from '../../_components/EdgeMarkers'
import ModeToggle, { type ShowcaseMode } from '../../_components/ModeToggle'
import { colorForIndex } from '../../_components/palette'
import Reveal from '../../_components/Reveal'
import {
  feeTokenCodeVariants,
  paymentLaneCodeVariants,
} from '../../_components/transactionCodeVariants'
import FeatureDiagram from '../../diagrams/_components/FeatureDiagram'
import type { FeatureDiagramSpec } from '../../diagrams/_lib/featureDiagram'
import FeatureFaq, { type FaqItem } from './FeatureFaq'

type FeaturePoint = {
  title: string
  desc: string
  panelTitle?: string
  variants?: CodeVariant[]
  spec?: FeatureDiagramSpec
}

type Story = {
  id: string
  title: string
  copy: string
  ctas: { label: string; href: string; primary?: boolean }[]
  points: FeaturePoint[]
  panelTitle: string
  variants: CodeVariant[]
  // The hero diagram for this story. Stories without one fall back to the
  // default placeholder until a semantically apt diagram is built.
  spec?: FeatureDiagramSpec
}

const CODE_WINDOW_HEIGHT = 'max-h-[392px] lg:max-h-[440px]'

const dexCodeVariants: CodeVariant[] = [
  {
    lang: 'TypeScript',
    code: [
      'import { parseUnits } from "viem";',
      'import { client } from "./viem.config";',
      '',
      'const usdc = "0x20c0000000000000000000000000000000000001";',
      'const usdt = "0x20c0000000000000000000000000000000000002";',
      'const amountIn = parseUnits("100", 6);',
      'const minAmountOut = parseUnits("99.50", 6);',
      '',
      'const { receipt } = await client.dex.sellSync({',
      '  tokenIn: usdc,',
      '  tokenOut: usdt,',
      '  amountIn,',
      '  minAmountOut,',
      '});',
    ],
    highlight: ['client.dex.sellSync'],
  },
  {
    lang: 'Solidity',
    code: [
      'IStablecoinDex dex = IStablecoinDex(',
      '    0xdec0000000000000000000000000000000000000',
      ');',
      '',
      'uint128 amountIn = 100e6;',
      'uint128 quote = dex.quoteSwapExactAmountIn(',
      '    USDC,',
      '    USDT,',
      '    amountIn',
      ');',
      '',
      'uint128 minOut = (quote * 995) / 1000;',
      'uint128 amountOut = dex.swapExactAmountIn(',
      '    USDC,',
      '    USDT,',
      '    amountIn,',
      '    minOut',
      ');',
    ],
    highlight: ['quoteSwapExactAmountIn', 'swapExactAmountIn'],
  },
  {
    lang: 'CLI',
    code: [
      'DEX=0xdec0000000000000000000000000000000000000',
      'AMOUNT_IN=100000000',
      'MIN_USDT_OUT=99500000',
      '',
      'cast send "$DEX" \\',
      '  "swapExactAmountIn(address,address,uint128,uint128)(uint128)" \\',
      '  "$USDC" "$USDT" "$AMOUNT_IN" "$MIN_USDT_OUT" \\',
      '  --tempo.fee-token "$USDC" \\',
      '  --rpc-url "$TEMPO_RPC_URL" \\',
      '  --private-key "$PRIVATE_KEY"',
    ],
    highlight: ['swapExactAmountIn', '--tempo.fee-token'],
  },
]

const memoCodeVariants: CodeVariant[] = [
  {
    lang: 'TypeScript',
    code: [
      'import { parseUnits, stringToHex, pad } from "viem";',
      'import { client } from "./tempo";',
      '',
      '// A 32-byte reference travels with the transfer',
      'const memo = pad(stringToHex("INV-4021"), { size: 32 });',
      '',
      'const { receipt } = await client.token.transferSync({',
      '  token: usdc,',
      '  to: merchant,',
      '  amount: parseUnits("100", 6),',
      '  memo,',
      '});',
    ],
    highlight: ['memo,'],
  },
  {
    lang: 'Rust',
    code: [
      'use alloy::primitives::{B256, U256};',
      'use tempo_alloy::contracts::precompiles::ITIP20;',
      '',
      'let memo = B256::right_padding_from(b"INV-4021");',
      'let token = ITIP20::new(usdc, provider);',
      '',
      'token',
      '    .transferWithMemo(merchant, U256::from(100_000_000), memo)',
      '    .send()',
      '    .await?;',
    ],
    highlight: ['transferWithMemo', 'memo'],
  },
  {
    lang: 'CLI',
    code: [
      'MEMO=$(cast format-bytes32-string "INV-4021")',
      '',
      'cast send "$USDC" \\',
      '  "transferWithMemo(address,uint256,bytes32)" \\',
      '  "$MERCHANT" 100000000 "$MEMO" \\',
      '  --rpc-url "$TEMPO_RPC_URL" \\',
      '  --private-key "$PRIVATE_KEY"',
    ],
    highlight: ['transferWithMemo', 'MEMO'],
  },
]

const feeTokenSpec: FeatureDiagramSpec = {
  kind: 'feeamm',
  user: { accent: 0, label: 'USER', detail: 'SELECTS FEE TOKEN' },
  selectedToken: { accent: 0, symbol: 'USDC' },
  receivedToken: { accent: 1, symbol: 'USDT' },
  ammLabel: 'FEE AMM',
  validator: { accent: 1, label: 'VALIDATOR', detail: 'RECEIVES USDT' },
}

const paymentLaneSpec: FeatureDiagramSpec = {
  kind: 'blockspace',
  payments: [
    { accent: 3, label: 'PAYMENT', detail: 'FEE $0.001' },
    { accent: 1, label: 'PAYOUT', detail: 'FEE $0.001' },
  ],
  general: { accent: 0, label: 'AIRDROP / TRADE', detail: 'FEE $0.01' },
  paymentLaneLabel: 'PAYMENT BLOCKSPACE',
  generalLabel: 'GENERAL BLOCKSPACE',
}

const transferMemoSpec: FeatureDiagramSpec = {
  kind: 'memo',
  paymentLabel: 'PAYMENT',
  amount: '100.00 USDC',
  amountAccent: 2,
  memoLabel: 'MEMO',
  memoValue: 'INV-4021',
  memoAccent: 0,
  explorerLabel: 'EXPLORER',
  fields: [
    { label: 'TX', barW: 92 },
    { label: 'FROM / TO', barW: 64 },
    { label: 'AMOUNT', value: '100.00 USDC' },
    { label: 'MEMO', value: 'INV-4021', highlight: true },
  ],
  caption: 'RECONCILIATION NATIVE TO THE TOKEN',
}

const virtualAddressCodeVariants: CodeVariant[] = [
  {
    lang: 'Derive',
    code: [
      'import { concatHex, getAddress, parseUnits } from "viem";',
      'import { client } from "./viem.config";',
      '',
      'const masterId = "0x2612766c";',
      'const magic = "0xfdfdfdfdfdfdfdfdfdfd";',
      'const userTag = "0x000000000001";',
      '',
      'const virtualAddress = getAddress(',
      '  concatHex([masterId, magic, userTag]),',
      ');',
      '',
      'await client.token.transferSync({',
      '  token: pathUsd,',
      '  to: virtualAddress,',
      '  amount: parseUnits("100", 6),',
      '});',
    ],
    highlight: ['concatHex([masterId, magic, userTag])', 'to: virtualAddress'],
  },
  {
    lang: 'Attribute',
    code: [
      '// The trailing 6 bytes are your routing key',
      `const userTag = \`0x\${virtualAddress.slice(-12)}\`;`,
      '',
      'await db.deposits.create({',
      '  data: {',
      '    userTag,',
      '    customerId: customers.byTag[userTag],',
      '    txHash: receipt.transactionHash,',
      '  },',
      '});',
    ],
    highlight: ['userTag', 'customers.byTag[userTag]'],
  },
  {
    lang: 'Balance',
    code: [
      'const masterBalance = await client.token.balanceOf({',
      '  token: pathUsd,',
      '  owner: masterWallet,',
      '});',
      '',
      'const virtualBalance = await client.token.balanceOf({',
      '  token: pathUsd,',
      '  owner: virtualAddress,',
      '});',
      '',
      '// virtualBalance stays 0; funds settle on master',
    ],
    highlight: ['masterWallet', 'virtualBalance stays 0'],
  },
]

const policyCodeVariants: CodeVariant[] = [
  {
    lang: 'Whitelist',
    code: [
      'uint64 policyId = tip403Registry.createPolicyWithAccounts(',
      '    admin,',
      '    ITIP403Registry.PolicyType.WHITELIST,',
      '    allowedHolders',
      ');',
      '',
      'tip20.changeTransferPolicyId(policyId);',
    ],
    highlight: ['PolicyType.WHITELIST', 'changeTransferPolicyId'],
  },
  {
    lang: 'Blocklist',
    code: [
      'uint64 policyId = tip403Registry.createPolicyWithAccounts(',
      '    admin,',
      '    ITIP403Registry.PolicyType.BLACKLIST,',
      '    blockedAddresses',
      ');',
      '',
      'tip20.changeTransferPolicyId(policyId);',
    ],
    highlight: ['PolicyType.BLACKLIST', 'changeTransferPolicyId'],
  },
  {
    lang: 'Roles',
    code: [
      'bytes32 pauseRole = tip20.PAUSE_ROLE();',
      '',
      'tip20.grantRole(pauseRole, complianceOps);',
      'tip20.pause();',
      'tip20.unpause();',
    ],
    highlight: ['grantRole', 'pause()'],
  },
]

const STORIES: Story[] = [
  {
    id: 'dex',
    title: 'Optimized for onchain liquidity.',
    copy: 'A stablecoin DEX is enshrined in the protocol. TIP-20 stablecoins trade against shared order-book liquidity, with no contract to deploy.',
    spec: {
      kind: 'dex',
      input: { accent: 0, label: 'USDC', detail: 'ANY TIP-20' },
      resolver: { accent: 2, label: 'pathUSD', detail: 'QUOTE TOKEN' },
      output: { accent: 1, label: 'USDT', detail: 'USD STABLECOIN' },
      asks: [0.45, 0.7, 0.95],
      bids: [0.9, 0.65, 0.4],
      bookLabel: 'ENSHRINED DEX',
      caption: 'REAL ORDER BOOK · PRICE-TIME PRIORITY · NO POOL',
    },
    ctas: [
      { label: 'Explore the DEX', href: '/docs/protocol/exchange', primary: true },
      { label: 'Read the spec', href: '/docs/protocol/exchange/spec' },
    ],
    panelTitle: 'stablecoin-swap',
    variants: dexCodeVariants,
    points: [
      {
        title: 'Native stablecoin DEX',
        desc: 'An enshrined orderbook lets every TIP-20 trade natively, with price-time priority and no pool contract to deploy.',
      },
      {
        title: 'Shared liquidity',
        desc: 'Trade between USD stablecoins through protocol-level order books, so markets can tap existing liquidity.',
      },
    ],
  },
  {
    id: 'standard',
    title: 'A stablecoin-native token standard.',
    copy: 'TIP-20 is the native token standard for stablecoins. Fee payment, payment lanes, and reconciliation are part of the token, not bolted on.',
    spec: feeTokenSpec,
    ctas: [
      { label: 'Explore TIP-20', href: '/docs/protocol/tip20/overview', primary: true },
      { label: 'Issue a token', href: '/docs/guide/issuance/create-a-stablecoin' },
    ],
    panelTitle: 'fee-token.ts',
    variants: feeTokenCodeVariants,
    points: [
      {
        title: 'Pay fees in any stablecoin',
        desc: 'USD-denominated TIP-20 tokens can pay transaction fees directly, no native gas token required.',
        spec: feeTokenSpec,
        panelTitle: 'fee-token.ts',
        variants: feeTokenCodeVariants,
      },
      {
        title: 'Dedicated payment lanes',
        desc: 'Reserved blockspace keeps transfer fees sub-cent and predictable under load.',
        spec: paymentLaneSpec,
        panelTitle: 'payment-lanes.ts',
        variants: paymentLaneCodeVariants,
      },
      {
        title: 'Transfer memos',
        desc: 'Attach 32-byte references to payments for invoice matching and reconciliation.',
        spec: transferMemoSpec,
        panelTitle: 'memo.ts',
        variants: memoCodeVariants,
      },
    ],
  },
  {
    id: 'virtual-addresses',
    title: 'Virtual addresses, native to TIP-20.',
    copy: 'Give every customer, merchant, or invoice a unique deposit address without managing another wallet. TIP-20 transfers credit the registered master wallet at the protocol layer.',
    spec: {
      kind: 'forward',
      dest: 1,
      destLabel: 'MASTER WALLET',
      destSub: 'ONE ADDRESS · NO SWEEPS',
      sources: [
        { accent: 0, label: 'CUSTOMER A', detail: 'VADDR · AUTO-FWD' },
        { accent: 2, label: 'CUSTOMER B', detail: 'VADDR · AUTO-FWD' },
        { accent: 3, label: 'CUSTOMER C', detail: 'VADDR · AUTO-FWD' },
      ],
    },
    ctas: [
      {
        label: 'Explore virtual addresses',
        href: '/docs/protocol/tip20/virtual-addresses',
        primary: true,
      },
    ],
    panelTitle: 'virtual-address.ts',
    variants: virtualAddressCodeVariants,
    points: [
      {
        title: 'Unique deposit endpoints',
        desc: 'Each virtual address can represent a customer, merchant, corridor, or payment flow.',
      },
      {
        title: 'Protocol-level crediting',
        desc: 'Funds sent to a virtual address are credited directly to the registered master wallet.',
      },
      {
        title: 'No sweep operations',
        desc: 'Operators avoid separate sweep transactions, stranded balances, and extra wallet infrastructure.',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Enforce policies at the token level.',
    copy: 'Attach issuer rules to a TIP-20 token so every transfer is checked before it settles.',
    spec: {
      kind: 'gate',
      dest: 1,
      destLabel: 'TOKEN',
      destSub: 'ISSUER POLICY',
      sources: [
        { accent: 0, label: 'ALLOWED HOLDER', detail: 'ON WHITELIST' },
        { accent: 2, label: 'APPROVED TRANSFER', detail: 'POLICY OK' },
        { accent: 3, label: 'BLOCKED ADDRESS', detail: 'ON BLACKLIST', blocked: true },
      ],
    },
    ctas: [{ label: 'Read the spec', href: '/docs/protocol/tip403/overview', primary: true }],
    panelTitle: 'token-policy.ts',
    variants: policyCodeVariants,
    points: [
      {
        title: 'Whitelist holders',
        desc: "Allow transfers only when senders and recipients satisfy the issuer's holder policy.",
      },
      {
        title: 'Block risky addresses',
        desc: 'Reject sanctioned, compromised, or restricted addresses before funds can move.',
      },
      {
        title: 'Control issuer roles',
        desc: 'Use admin and pause roles as operational guardrails for policy changes and emergency stops.',
      },
    ],
  },
]

const TOKEN_FAQS: FaqItem[] = [
  {
    question: 'What is TIP-20?',
    answer: [
      "TIP-20 is Tempo's ",
      {
        text: 'native token standard',
        href: '/docs/protocol/tip20/overview#tip-20-token-standard',
      },
      ' for stablecoins. It keeps familiar token operations, then adds ',
      {
        text: 'payment-specific primitives',
        href: '/docs/protocol/tip20/overview#benefits--features-of-tip-20-tokens',
      },
      ' like fee payment, memos, issuer controls, policy checks, virtual addresses, and payment lanes.',
    ],
  },
  {
    question: 'How is TIP-20 different from ERC-20?',
    answer: [
      'ERC-20 gives apps a generic token interface. TIP-20 makes stablecoin payments first-class by building in ',
      {
        text: 'payment metadata',
        href: '/docs/protocol/tip20/overview#transfer-memos',
      },
      ', ',
      {
        text: 'compliance policies',
        href: '/docs/protocol/tip20/overview#tip-403-transfer-policies',
      },
      ', ',
      {
        text: 'fee handling',
        href: '/docs/protocol/tip20/overview#pay-fees-in-any-stablecoin',
      },
      ', and ',
      {
        text: 'predictable payment fees',
        href: '/docs/protocol/tip20/overview#get-predictable-payment-fees',
      },
      ' instead of making every token rebuild them.',
    ],
  },
  {
    question: 'Can users pay network fees with TIP-20 tokens?',
    answer: [
      'Yes. Apps can ',
      {
        text: 'pass a feeToken',
        href: '/docs/guide/payments/pay-fees-in-any-stablecoin#quick-snippet',
      },
      " when sending a transaction, and Tempo's ",
      {
        text: 'Fee AMM',
        href: '/docs/protocol/fees/fee-amm#fee-amm-overview',
      },
      ' handles conversion for validators behind the scenes.',
    ],
  },
  {
    question: 'What are payment lanes?',
    answer: [
      {
        text: 'Payment lanes',
        href: '/docs/protocol/blockspace/payment-lane-specification#payment-lane-specification',
      },
      ' reserve blockspace for ',
      {
        text: 'eligible TIP-20 transfers',
        href: '/docs/protocol/blockspace/payment-lane-specification#1-transaction-classification',
      },
      ', which keeps ordinary payment traffic predictable even when general-purpose activity spikes.',
    ],
  },
  {
    question: 'What are virtual addresses for?',
    answer: [
      'Virtual addresses let an operator issue ',
      {
        text: 'unique deposit addresses',
        href: '/docs/protocol/tip20/virtual-addresses#why-this-feature-exists',
      },
      ' for customers, invoices, or partners while ',
      {
        text: 'funds route to one master account',
        href: '/docs/protocol/tip20/virtual-addresses#what-happens-when-someone-sends-funds',
      },
      ' during the TIP-20 transfer.',
    ],
  },
  {
    question: 'How do compliance policies work?',
    answer: [
      'TIP-20 tokens can use ',
      {
        text: 'TIP-403 policies',
        href: '/docs/protocol/tip403/spec#usage-with-tip-20-tokens',
      },
      ' to enforce issuer rules before transfers settle. Policies can enforce ',
      {
        text: 'sender, recipient, and token rules',
        href: '/docs/protocol/tip403/spec#authorization-logic',
      },
      ' for compliance.',
    ],
  },
]

function StoryPointsList({
  activeIndex = 0,
  onSelect,
  points,
  selectable = false,
}: {
  activeIndex?: number
  onSelect?: (index: number) => void
  points: FeaturePoint[]
  selectable?: boolean
}) {
  const pointGridClass = points.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'

  return (
    <ul className={`grid border-line border-t ${pointGridClass} lg:grid-cols-1`}>
      {points.map((point, i) => {
        const content = (
          <>
            <span
              aria-hidden
              className="mt-0.5 size-5 shrink-0"
              style={{
                backgroundImage: `radial-gradient(circle, ${colorForIndex(i)} 1px, transparent 1.4px)`,
                backgroundSize: '5px 5px',
              }}
            />
            <span>
              <h3 className="font-sans text-[18px] text-foreground leading-[1.2] tracking-[0]">
                {point.title}
              </h3>
              <p
                className={`mt-2 font-sans text-[14px] leading-[1.45] tracking-[0] ${
                  selectable && activeIndex === i
                    ? 'text-foreground/55'
                    : 'text-foreground/45 group-hover:text-foreground/55'
                }`}
              >
                {point.desc}
              </p>
            </span>
          </>
        )

        return (
          <li
            key={point.title}
            className="border-line border-b last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0 lg:border-r-0 lg:border-b lg:last:border-b-0"
          >
            {selectable ? (
              <button
                type="button"
                onMouseEnter={() => onSelect?.(i)}
                onFocus={() => onSelect?.(i)}
                onClick={() => onSelect?.(i)}
                aria-pressed={activeIndex === i}
                className={`group flex h-full w-full items-start gap-4 px-5 py-6 text-left transition-colors lg:px-12 ${
                  activeIndex === i ? 'bg-surface-block' : 'hover:bg-surface-block'
                }`}
              >
                {content}
              </button>
            ) : (
              <div className="flex items-start gap-4 px-5 py-6 lg:px-12">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function StorySection({ story, index }: { story: Story; index: number }) {
  const [mode, setMode] = useState<ShowcaseMode>('visual')
  const [activePointIndex, setActivePointIndex] = useState(0)

  const pointsArePanels = story.points.every(
    (point) => point.spec && point.panelTitle && point.variants,
  )
  const activePoint = pointsArePanels ? story.points[activePointIndex] : undefined
  const panelSpec = activePoint?.spec ?? story.spec
  const panelTitle = activePoint?.panelTitle ?? story.panelTitle
  const panelVariants = activePoint?.variants ?? story.variants

  return (
    <section id={story.id} className={`${index === 0 ? '' : 'mt-[140px]'} scroll-mt-12`}>
      <Reveal className="relative border-line border-t">
        <EdgeMarkers wideOnly />
        <div className="grid border-line border-b bg-surface-shell lg:grid-cols-2">
          <div className="flex flex-col border-line border-b text-left lg:border-r lg:border-b-0">
            <div className="flex flex-1 flex-col justify-center px-5 py-14 lg:px-12 lg:py-20">
              <h2 className="max-w-[620px] text-balance font-sans text-[clamp(1.5rem,5vw,2.5rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
                {story.title}
              </h2>
              <p className="mt-6 max-w-[620px] text-balance font-sans text-[16px] text-foreground/50 leading-[1.5] tracking-[0]">
                {story.copy}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-2.5">
                {story.ctas.map((cta) => (
                  <Button
                    key={cta.label}
                    href={cta.href}
                    variant={cta.primary ? 'primary' : 'secondary'}
                  >
                    {cta.label}
                  </Button>
                ))}
              </div>
            </div>

            <StoryPointsList
              activeIndex={activePointIndex}
              onSelect={setActivePointIndex}
              points={story.points}
              selectable={pointsArePanels}
            />
          </div>

          <div className="relative lg:min-h-[620px]">
            <div className="absolute right-5 bottom-5 z-20 lg:right-8 lg:bottom-8">
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
            <div className="grid grid-cols-1 lg:absolute lg:inset-0 lg:min-h-0">
              <div
                inert={mode !== 'visual'}
                className={`grid lg:h-full lg:min-h-0 ${mode === 'visual' ? '[grid-area:1/1]' : 'hidden'}`}
              >
                <FeatureDiagram spec={panelSpec} />
              </div>
              <div
                inert={mode !== 'code'}
                className={`flex min-h-[420px] items-center justify-center p-6 pb-20 lg:h-full lg:min-h-0 lg:p-10 lg:pb-24 ${mode === 'code' ? '[grid-area:1/1]' : 'hidden'}`}
              >
                <div className="w-full max-w-[560px]">
                  <CodeWindow
                    key={panelTitle}
                    title={panelTitle}
                    variants={panelVariants}
                    heightClassName={CODE_WINDOW_HEIGHT}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default function TokensSections() {
  return (
    <>
      {STORIES.map((story, i) => (
        <StorySection key={story.id} story={story} index={i} />
      ))}
      <FeatureFaq
        title="TIP-20 Tokens FAQ."
        intro="Short answers for the parts developers usually want to know before issuing or accepting stablecoins on Tempo."
        items={TOKEN_FAQS}
      />
    </>
  )
}

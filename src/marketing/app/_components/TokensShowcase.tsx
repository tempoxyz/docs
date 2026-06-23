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
    title: 'Plugged into liquidity by default',
    desc: 'TIP-20 tokens are tradable on an enshrined DEX with efficient liquidity.',
    href: '/docs/guide/stablecoin-dex/executing-swaps',
    spec: {
      kind: 'dex',
      input: { accent: 1, label: 'USDC', detail: '' },
      resolver: { accent: 2, label: 'pathUSD', detail: 'QUOTE TOKEN' },
      output: { accent: 2, label: 'USDT', detail: '' },
      asks: [0.45, 0.7, 0.95],
      bids: [0.9, 0.65, 0.4],
      bookLabel: 'ENSHRINED DEX',
      caption: '',
    },
    panelTitle: 'stablecoin-swap',
    variants: [
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
    ],
  },
  {
    title: 'Policies enforce compliance',
    desc: 'Policies can enforce sender, recipient, and token rules for compliance.',
    href: '/docs/guide/issuance/manage-stablecoin#configure-transfer-policies',
    spec: {
      kind: 'gate',
      dest: 1,
      destLabel: 'demoUSD',
      destSub: 'TIP-403 POLICY',
      sources: [
        { accent: 0, label: 'ALLOWED SENDER', detail: 'ON WHITELIST' },
        { accent: 2, label: 'APPROVED PAYEE', detail: 'POLICY OK' },
        { accent: 3, label: 'BLOCKED ADDRESS', detail: 'ON BLACKLIST', blocked: true },
      ],
    },
    panelTitle: 'policy',
    variants: [
      {
        lang: 'TypeScript',
        code: [
          'import { client } from "./tempo";',
          '',
          '// One registry entry, enforced on every transfer',
          'const { policyId } = await client.policy.createSync({',
          '  type: "blacklist",',
          '  addresses: [blocked],',
          '});',
          '',
          'await client.token.changeTransferPolicySync({',
          '  token: demoUsd,',
          '  policyId,',
          '});',
        ],
        highlight: ['client.policy.createSync', 'changeTransferPolicySync'],
      },
      {
        lang: 'Rust',
        code: [
          'use tempo_alloy::contracts::precompiles::{ITIP20, ITIP403Registry};',
          '',
          'let registry = ITIP403Registry::new(TIP403_REGISTRY, provider);',
          'let policy_id = registry',
          '    .createPolicyWithAccounts(admin, PolicyType::BLACKLIST, vec![blocked])',
          '    .send()',
          '    .await?;',
          '',
          'let token = ITIP20::new(demo_usd, provider);',
          'token.changeTransferPolicyId(policy_id).send().await?;',
        ],
        highlight: ['createPolicyWithAccounts', 'changeTransferPolicyId'],
      },
      {
        lang: 'CLI',
        code: [
          'cast send 0x403c000000000000000000000000000000000000 \\',
          '  "createPolicyWithAccounts(address,uint8,address[])" \\',
          '  "$ADMIN" 1 "[$BLOCKED]" \\',
          '  --tempo.fee-token 0x20c0000000000000000000000000000000000001 \\',
          '  --rpc-url "$TEMPO_RPC_URL" \\',
          '  --private-key "$PRIVATE_KEY"',
          '',
          'cast send "$DEMO_USD" "changeTransferPolicyId(uint64)" "$POLICY_ID" \\',
          '  --tempo.fee-token 0x20c0000000000000000000000000000000000001 \\',
          '  --rpc-url "$TEMPO_RPC_URL" \\',
          '  --private-key "$PRIVATE_KEY"',
        ],
        highlight: ['createPolicyWithAccounts', 'changeTransferPolicyId'],
      },
    ],
  },
  {
    title: 'Optional memos for reconciliation',
    desc: 'Attach invoice IDs to transfers and reconcile payments onchain.',
    href: '/docs/guide/payments/transfer-memos',
    spec: {
      kind: 'memo',
      paymentLabel: 'PAYMENT',
      amount: '125.00 demoUSD',
      amountAccent: 2,
      memoLabel: 'MEMO',
      memoValue: 'INV-12345',
      memoAccent: 0,
      explorerLabel: 'EXPLORER',
      fields: [
        { label: 'TX', barW: 92 },
        { label: 'FROM / TO', barW: 64 },
        { label: 'AMOUNT', value: '125.00' },
        { label: 'MEMO', value: 'INV-12345', highlight: true },
      ],
      caption: 'RECONCILE BY REFERENCE ONCHAIN',
    },
    panelTitle: 'memo',
    variants: [
      {
        lang: 'TypeScript',
        code: [
          'import { parseUnits, stringToHex, pad } from "viem";',
          'import { client } from "./tempo";',
          '',
          '// A 32-byte reference travels with the transfer',
          'const memo = pad(stringToHex("INV-12345"), { size: 32 });',
          '',
          'const { receipt } = await client.token.transferSync({',
          '  token: demoUsd,',
          '  to: merchant,',
          '  amount: parseUnits("125", 6),',
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
          'let memo = B256::right_padding_from(b"INV-12345");',
          'let token = ITIP20::new(demo_usd, provider);',
          '',
          'token',
          '    .transferWithMemo(merchant, U256::from(125_000_000), memo)',
          '    .send()',
          '    .await?;',
        ],
        highlight: ['transferWithMemo', 'memo'],
      },
      {
        lang: 'CLI',
        code: [
          'MEMO=$(cast format-bytes32-string "INV-12345")',
          '',
          'cast send "$DEMO_USD" \\',
          '  "transferWithMemo(address,uint256,bytes32)" \\',
          '  "$MERCHANT" 125000000 "$MEMO" \\',
          '  --rpc-url "$TEMPO_RPC_URL" \\',
          '  --private-key "$PRIVATE_KEY"',
        ],
        highlight: ['transferWithMemo', 'MEMO'],
      },
    ],
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

export default function TokensShowcase() {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<ShowcaseMode>('visual')
  const selectRow = (index: number) => {
    if (index !== active) {
      setActive(index)
    }
  }

  return (
    <section>
      {/* Mirror of TransactionsShowcase: content column first in the DOM so
          mobile stacks heading-first, reversed on desktop so the visual sits
          on the left. */}
      <Reveal
        className={`relative border border-line lg:flex ${SHOWCASE_HEIGHT} lg:flex-row-reverse lg:items-stretch`}
      >
        <EdgeMarkers wideOnly />
        <div className="flex flex-col justify-center bg-surface-shell p-7 lg:w-1/2 lg:p-12">
          <h2 className="max-w-[520px] font-sans text-[clamp(1.5rem,5vw,2.5rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased">
            Stablecoin-native tokens.
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
                  <span className="mt-2 block max-w-[560px] font-sans text-[14px] text-foreground/55 leading-[1.45] tracking-[0] group-hover:text-foreground/65">
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
            <Button href="/docs/protocol/tip20/overview" variant="primary">
              Explore TIP-20
            </Button>
            <Button href="/docs/guide/issuance/create-a-stablecoin" arrow>
              Create a stablecoin
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center border-line border-t p-6 pt-18 lg:w-1/2 lg:border-t-0 lg:border-r lg:p-10 lg:pt-18">
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

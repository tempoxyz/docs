'use client'

import { useState } from 'react'
import Button from '../../_components/Button'
import CodeWindow, { type CodeVariant } from '../../_components/CodeWindow'
import EdgeMarkers from '../../_components/EdgeMarkers'
import ModeToggle, { type ShowcaseMode } from '../../_components/ModeToggle'
import Reveal from '../../_components/Reveal'
import { accessKeyCodeVariants } from '../../_components/transactionCodeVariants'
import FeatureFaq, { type FaqItem } from './FeatureFaq'

const CODE_WINDOW_HEIGHT = 'h-[420px] max-h-[420px] lg:h-[460px] lg:max-h-[460px]'

const receivePolicyCodeVariants: CodeVariant[] = [
  {
    lang: 'TypeScript',
    code: [
      'import { client } from "./viem.config";',
      '',
      'const policy = await client.receivePolicy.create({',
      '  account: merchantAccount,',
      '  allowedHolders: [customerAllowlist],',
      '  approvedTransfers: [checkoutPolicy],',
      '  blockedAddresses: [sanctionsList],',
      '});',
      '',
      'await client.account.setReceivePolicy(policy.id);',
    ],
    highlight: [
      'client.receivePolicy.create({',
      'allowedHolders: [customerAllowlist]',
      'approvedTransfers: [checkoutPolicy]',
      'blockedAddresses: [sanctionsList]',
      'client.account.setReceivePolicy(policy.id)',
    ],
  },
  {
    lang: 'CLI',
    code: [
      'cast send $RECEIVE_POLICY_REGISTRY \\',
      '  "setPolicy(address,uint64)" \\',
      '  "$MERCHANT_ACCOUNT" \\',
      '  "$POLICY_ID" \\',
      '  --rpc-url "$TEMPO_RPC_URL" \\',
      '  --private-key "$ADMIN_KEY"',
      '',
      'cast call $RECEIVE_POLICY_REGISTRY \\',
      '  "check(address,address,address)(bool)" \\',
      '  "$TOKEN" "$SENDER" "$MERCHANT_ACCOUNT"',
    ],
    highlight: [
      'setPolicy(address,uint64)',
      '"$MERCHANT_ACCOUNT"',
      '"$POLICY_ID"',
      'check(address,address,address)(bool)',
    ],
  },
]

type Capability = {
  title: string
  desc: string
  href: string
  accent: string
}

type AccountFeature = {
  id: string
  kicker: string
  title: string
  desc: string
  href: string
  cta: string
  points: Capability[]
  diagram: 'keys' | 'access' | 'policies' | 'virtual'
}

const accountFeatures: AccountFeature[] = [
  {
    id: 'key-types',
    kicker: 'KEY TYPES',
    title: 'Flexible auth without changing the address.',
    desc: 'Tempo accounts keep ordinary EVM addresses while adding native signing paths for root keys, passkeys, admin access keys, and app-owned infrastructure.',
    href: '/docs/guide/accounts',
    cta: 'Read the account guide',
    diagram: 'keys',
    points: [
      {
        title: 'Root keys',
        desc: 'Full account control stays anchored to the address.',
        href: '/docs/protocol/accounts#key-model',
        accent: 'bg-[#73A0FF]',
      },
      {
        title: 'Passkeys',
        desc: 'Use device-native signing for passwordless wallet experiences.',
        href: '/docs/guide/accounts',
        accent: 'bg-[#C084FC]',
      },
      {
        title: 'Admin access keys',
        desc: 'Let a previously authorized device add or revoke account keys.',
        href: '/docs/guide/accounts/use-access-keys',
        accent: 'bg-[#6EE7B7]',
      },
    ],
  },
  {
    id: 'access-keys',
    kicker: 'ACCESS KEYS',
    title: 'Delegate only the permissions a product needs.',
    desc: 'Access keys let wallets, apps, and agents sign constrained actions with expiry, revocation, and periodic spend limits enforced before execution.',
    href: '/docs/guide/accounts/use-access-keys',
    cta: 'Use access keys',
    diagram: 'access',
    points: [
      {
        title: 'Periodic spend limits',
        desc: 'Cap a key by day, week, or session window before it ever signs.',
        href: '/docs/protocol/transactions/AccountKeychain#spending-limit-enforcement',
        accent: 'bg-[#C084FC]',
      },
      {
        title: 'Call scopes',
        desc: 'Constrain a key to payment, payout, checkout, or app-specific calls.',
        href: '/docs/protocol/transactions/AccountKeychain#call-scope-enforcement',
        accent: 'bg-[#6EE7B7]',
      },
      {
        title: 'Instant revocation',
        desc: 'Disable an app or old device without rotating the root key.',
        href: '/docs/protocol/transactions/AccountKeychain#key-revocation',
        accent: 'bg-[#737373]',
      },
    ],
  },
  {
    id: 'receive-policies',
    kicker: 'RECEIVE POLICIES',
    title: 'Use TIP-403 policies at the account boundary.',
    desc: 'Receive policies give accounts token, sender, and content controls for inbound transfers, deposits, and recovery-sensitive flows.',
    href: '/docs/guide/payments/configure-receive-policies',
    cta: 'Configure receive policies',
    diagram: 'policies',
    points: [
      {
        title: 'Token rules',
        desc: 'Accept only the stablecoins or assets the account is configured to receive.',
        href: '/docs/guide/payments/configure-receive-policies',
        accent: 'bg-[#6EE7B7]',
      },
      {
        title: 'Sender rules',
        desc: 'Limit inbound funds to known processors, users, or settlement partners.',
        href: '/docs/protocol/tip403/receive-policies',
        accent: 'bg-[#73A0FF]',
      },
      {
        title: 'Content policies',
        desc: 'Attach TIP-403 policy IDs to account flows instead of baking controls into every app.',
        href: '/docs/protocol/tip403/spec',
        accent: 'bg-[#C084FC]',
      },
    ],
  },
  {
    id: 'virtual-addresses',
    kicker: 'VIRTUAL ADDRESSES',
    title: 'Private deposit attribution without new accounts.',
    desc: 'Virtual addresses let products issue per-customer or per-invoice deposit addresses while funds resolve back to the master account.',
    href: '/docs/guide/payments/virtual-addresses',
    cta: 'Use virtual addresses',
    diagram: 'virtual',
    points: [
      {
        title: 'Deposit aliases',
        desc: 'Generate many addresses for routing without creating permanent account state.',
        href: '/docs/guide/payments/virtual-addresses',
        accent: 'bg-[#F97316]',
      },
      {
        title: 'Privacy-preserving routing',
        desc: 'Separate public deposit handles from treasury and settlement accounts.',
        href: '/docs/protocol/tip20/virtual-addresses',
        accent: 'bg-[#C084FC]',
      },
      {
        title: 'Master settlement',
        desc: 'Attribute deposits while keeping balances and policy decisions on the master account.',
        href: '/docs/guide/payments/virtual-addresses',
        accent: 'bg-[#6EE7B7]',
      },
    ],
  },
]

const ACCOUNT_FAQS: FaqItem[] = [
  {
    question: 'Are Tempo accounts smart contracts?',
    answer: [
      'No. Tempo accounts use ordinary EVM addresses. Account behavior is extended by protocol rules, precompiles, and Tempo Transaction validation rather than requiring every account to deploy contract code. Read the ',
      { text: 'protocol account model', href: '/docs/protocol/accounts' },
      ' for the exact mechanics.',
    ],
  },
  {
    question: 'What are access keys for?',
    answer: [
      'Access keys let an account delegate constrained signing authority to a device, app, agent, or session. They can carry expiry, spending limits, and call scopes, so products can avoid using a root key for every action.',
    ],
  },
  {
    question: 'When should I use virtual addresses?',
    answer: [
      'Use virtual addresses when you need many deposit addresses for users, customers, or invoices but want funds to resolve to one registered account without creating permanent state for every deposit address.',
    ],
  },
  {
    question: 'How do receive policies differ from token controls?',
    answer: [
      'Receive policies are account-level controls for what an address accepts. Token roles and token policies are issuer-level controls. Many products use both: issuer controls for asset governance, receive policies for account-specific risk and routing.',
    ],
  },
]

function AccessKeyDiagram() {
  return (
    <div className="relative grid gap-4 overflow-hidden border-line border-t bg-surface-shell p-5 pb-20 lg:block lg:min-h-[560px] lg:border-t-0 lg:border-l lg:p-0">
      <svg
        aria-labelledby="accounts-access-lines-title"
        className="absolute inset-0 z-0 hidden size-full text-foreground lg:block"
        role="img"
        viewBox="0 0 720 520"
      >
        <title id="accounts-access-lines-title">Scoped access key relationships</title>
        <path
          d="M212 238 C300 238 332 118 458 118"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#C084FC]/80"
        />
        <path
          d="M212 256 C306 256 354 256 458 256"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#6EE7B7]/75"
        />
        <path
          d="M212 274 C302 274 350 394 458 394"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 11"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-foreground/12"
        />
      </svg>

      <div className="relative z-10 w-full border border-foreground/14 bg-surface-shell px-5 py-5 lg:absolute lg:top-1/2 lg:left-[6%] lg:w-[170px] lg:-translate-y-1/2">
        <span aria-hidden className="block h-1 w-10 bg-[#73A0FF]" />
        <div className="mt-5 font-mono text-[12px] text-foreground tracking-[0.28em]">ACCOUNT</div>
        <div className="mt-2 font-mono text-[10px] text-foreground/35 tracking-[0.22em]">
          ROOT · PASSKEY
        </div>
      </div>

      <div className="relative z-10 w-full border border-foreground/18 bg-surface-shell px-5 py-4 lg:absolute lg:top-[15%] lg:right-[8%] lg:w-[250px]">
        <div className="font-mono text-[12px] text-foreground tracking-[0.28em]">APP KEY</div>
        <div className="mt-4 h-1.5 bg-foreground/8">
          <div className="h-full w-[56%] bg-[#C084FC]" />
        </div>
        <div className="mt-3 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          PAYMENTS · ≤ $500/DAY · 7D
        </div>
      </div>

      <div className="relative z-10 w-full border border-foreground/18 bg-surface-shell px-5 py-4 lg:absolute lg:top-[39%] lg:right-[8%] lg:w-[250px]">
        <div className="font-mono text-[12px] text-foreground tracking-[0.28em]">AGENT KEY</div>
        <div className="mt-4 h-1.5 bg-foreground/8">
          <div className="h-full w-[36%] bg-[#6EE7B7]" />
        </div>
        <div className="mt-3 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          CHECKOUT · ≤ $100/DAY
        </div>
      </div>

      <div className="relative z-10 w-full border border-foreground/10 bg-surface-shell px-5 py-4 opacity-42 lg:absolute lg:right-[8%] lg:bottom-[16%] lg:w-[250px]">
        <div className="font-mono text-[12px] text-foreground tracking-[0.28em]">OLD KEY</div>
        <div className="mt-4 h-1.5 bg-foreground/8" />
        <div className="mt-3 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          REVOKED · INSTANTLY
        </div>
      </div>

      <div className="absolute top-[58%] left-[33%] z-10 hidden items-center gap-2 lg:flex">
        <span className="font-mono text-[10px] text-foreground/35 tracking-[0.2em]">REVOKED</span>
        <span aria-hidden className="text-[30px] text-foreground/45 leading-none">
          ×
        </span>
      </div>
    </div>
  )
}

function AccessKeysPanel() {
  const [mode, setMode] = useState<ShowcaseMode>('visual')

  return (
    <div className="relative">
      <div className="absolute right-5 bottom-5 z-20 lg:right-7 lg:bottom-7">
        <ModeToggle mode={mode} setMode={setMode} />
      </div>
      {mode === 'visual' ? (
        <AccessKeyDiagram />
      ) : (
        <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden border-line border-t bg-surface-shell p-6 pb-20 lg:min-h-[560px] lg:border-t-0 lg:border-l lg:p-10 lg:pb-24">
          <div className="w-full max-w-[600px]">
            <CodeWindow
              title="access-keys.ts"
              variants={accessKeyCodeVariants}
              heightClassName={CODE_WINDOW_HEIGHT}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function KeyTypesDiagram() {
  return (
    <div className="relative grid gap-4 overflow-hidden border-line border-t p-5 lg:block lg:min-h-[540px] lg:border-t-0 lg:border-l lg:p-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden opacity-35 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px] lg:block"
      />
      <svg
        aria-labelledby="accounts-key-types-title"
        className="absolute inset-0 z-0 hidden size-full text-foreground lg:block"
        role="img"
        viewBox="0 0 720 520"
      >
        <title id="accounts-key-types-title">Root, passkey, and admin access key paths</title>
        <path
          d="M286 136 C356 136 390 206 452 244"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-foreground/16"
        />
        <path
          d="M286 256 C356 256 388 256 452 256"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#C084FC]/75"
        />
        <path
          d="M286 376 C356 376 390 306 452 268"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#6EE7B7]/70"
        />
      </svg>
      <div className="relative z-10 w-full border border-foreground/22 bg-surface-shell px-5 py-5 shadow-[0_18px_70px_rgba(0,0,0,0.12)] lg:absolute lg:top-1/2 lg:right-[8%] lg:w-[230px] lg:-translate-y-1/2 lg:shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="font-mono text-[11px] text-foreground/45 tracking-[0.26em]">ACCOUNT</div>
        <div className="mt-2 font-sans text-[26px] text-foreground tracking-[0]">0xA11c...09</div>
      </div>
      {[
        ['ROOT KEY', 'FULL CONTROL', 'lg:top-[13%] lg:left-[7%]', 'bg-[#73A0FF]'],
        ['PASSKEY', 'USER DEVICE', 'lg:top-[40%] lg:left-[7%]', 'bg-[#C084FC]'],
        ['ADMIN KEY', 'KEY MANAGEMENT', 'lg:bottom-[13%] lg:left-[7%]', 'bg-[#6EE7B7]'],
      ].map(([label, detail, position, accent]) => (
        <div
          key={label}
          className={`relative z-10 w-full border border-foreground/14 bg-surface-shell px-4 py-4 lg:absolute lg:w-[200px] ${position}`}
        >
          <span aria-hidden className={`block h-1 w-10 ${accent}`} />
          <div className="mt-5 font-mono text-[10px] text-foreground/38 tracking-[0.24em]">
            {detail}
          </div>
          <div className="mt-2 font-sans text-[15px] text-foreground tracking-[0]">{label}</div>
        </div>
      ))}
      <div className="absolute right-[8%] bottom-[20%] hidden max-w-[170px] font-mono text-[10px] text-foreground/30 tracking-[0.22em] lg:block">
        FLEXIBLE AUTH · SAME ADDRESS
      </div>
    </div>
  )
}

function PoliciesDiagram() {
  return (
    <div className="relative grid gap-4 overflow-hidden border-line border-t bg-surface-shell p-5 pb-20 lg:block lg:min-h-[560px] lg:border-t-0 lg:border-l lg:p-0">
      <svg
        aria-labelledby="accounts-policy-lines-title"
        className="absolute inset-0 z-0 hidden size-full text-foreground lg:block"
        role="img"
        viewBox="0 0 720 520"
      >
        <title id="accounts-policy-lines-title">Receive policy check flow</title>
        <path
          d="M252 150 C330 150 376 256 468 256"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#C084FC]/80"
        />
        <path
          d="M252 256 C334 256 382 256 468 256"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#6EE7B7]/75"
        />
        <path
          d="M252 362 C326 362 374 278 468 256"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 11"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-foreground/12"
        />
        <path
          d="M340 118 V384"
          fill="none"
          stroke="currentColor"
          strokeDasharray="6 8"
          strokeWidth="1.4"
          className="text-foreground/13"
        />
      </svg>

      <div className="relative z-10 w-full border border-foreground/14 bg-surface-shell px-5 py-4 lg:absolute lg:top-[15%] lg:left-[5%] lg:w-[245px]">
        <div className="font-mono text-[11px] text-foreground tracking-[0.28em]">
          ALLOWED HOLDER
        </div>
        <div className="mt-4 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          ON WHITELIST
        </div>
      </div>

      <div className="relative z-10 w-full border border-foreground/18 bg-surface-shell px-5 py-4 lg:absolute lg:top-[39%] lg:left-[5%] lg:w-[245px]">
        <div className="font-mono text-[11px] text-foreground tracking-[0.28em]">
          APPROVED TRANSFER
        </div>
        <div className="mt-4 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          POLICY OK
        </div>
      </div>

      <div className="relative z-10 w-full border border-foreground/10 bg-surface-shell px-5 py-4 opacity-42 lg:absolute lg:bottom-[15%] lg:left-[5%] lg:w-[245px]">
        <div className="font-mono text-[11px] text-foreground tracking-[0.28em]">
          BLOCKED ADDRESS
        </div>
        <div className="mt-4 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          ON BLACKLIST
        </div>
      </div>

      <div className="absolute top-[8%] left-[33%] z-10 hidden font-mono text-[10px] text-foreground/35 tracking-[0.2em] lg:block">
        POLICY CHECK
      </div>

      <div className="absolute top-[56%] left-[32%] z-10 hidden items-center gap-2 lg:flex">
        <span aria-hidden className="text-[30px] text-foreground/45 leading-none">
          ×
        </span>
        <span className="font-mono text-[10px] text-foreground/35 tracking-[0.2em]">BLOCKED</span>
      </div>

      <div className="relative z-10 w-full border border-foreground/18 bg-surface-shell px-5 py-5 lg:absolute lg:top-[30%] lg:right-[9%] lg:w-[175px]">
        <span aria-hidden className="block h-1 w-10 bg-[#73A0FF]" />
        <div className="mt-5 font-mono text-[12px] text-foreground tracking-[0.28em]">TOKEN</div>
        <div className="mt-3 font-mono text-[10px] text-foreground/35 tracking-[0.17em]">
          ISSUER POLICY
        </div>
      </div>
    </div>
  )
}

function ReceivePoliciesPanel() {
  const [mode, setMode] = useState<ShowcaseMode>('visual')

  return (
    <div className="relative">
      <div className="absolute right-5 bottom-5 z-20 lg:right-7 lg:bottom-7">
        <ModeToggle mode={mode} setMode={setMode} />
      </div>
      {mode === 'visual' ? (
        <PoliciesDiagram />
      ) : (
        <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden border-line border-t bg-surface-shell p-6 pb-20 lg:min-h-[560px] lg:border-t-0 lg:border-l lg:p-10 lg:pb-24">
          <div className="w-full max-w-[600px]">
            <CodeWindow
              title="receive-policy.ts"
              variants={receivePolicyCodeVariants}
              heightClassName={CODE_WINDOW_HEIGHT}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function VirtualAddressDiagram() {
  return (
    <div className="relative grid gap-4 overflow-hidden border-line border-t p-5 lg:block lg:min-h-[540px] lg:border-t-0 lg:border-l lg:p-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden opacity-35 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px] lg:block"
      />
      <svg
        aria-labelledby="accounts-virtual-address-title"
        className="absolute inset-0 z-0 hidden size-full text-foreground lg:block"
        role="img"
        viewBox="0 0 720 520"
      >
        <title id="accounts-virtual-address-title">
          Virtual addresses resolving to a master account
        </title>
        <path
          d="M180 128 C330 128 382 246 494 260"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#F97316]/75"
        />
        <path
          d="M180 260 C318 260 382 260 494 260"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#C084FC]/70"
        />
        <path
          d="M180 392 C330 392 382 274 494 260"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-[#6EE7B7]/70"
        />
      </svg>
      {[
        ['INV-1042', 'DEPOSIT ALIAS', 'lg:top-[18%] lg:left-[8%]'],
        ['USER-83', 'CUSTOMER TAG', 'lg:top-[45%] lg:left-[8%]'],
        ['PAYOUT-7', 'ROUTING KEY', 'lg:bottom-[18%] lg:left-[8%]'],
      ].map(([label, detail, position]) => (
        <div
          key={label}
          className={`relative z-10 w-full border border-foreground/14 bg-surface-shell px-4 py-4 lg:absolute lg:w-[170px] ${position}`}
        >
          <div className="font-mono text-[10px] text-foreground/38 tracking-[0.24em]">{detail}</div>
          <div className="mt-2 font-sans text-[16px] text-foreground tracking-[0]">{label}</div>
        </div>
      ))}
      <div className="relative z-10 w-full border border-foreground/22 bg-surface-shell px-5 py-5 shadow-[0_18px_70px_rgba(0,0,0,0.12)] lg:absolute lg:top-1/2 lg:right-[9%] lg:w-[230px] lg:-translate-y-1/2 lg:shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
        <div className="font-mono text-[11px] text-foreground/40 tracking-[0.26em]">
          MASTER ACCOUNT
        </div>
        <div className="mt-2 font-sans text-[24px] text-foreground tracking-[0]">0xA11c...09</div>
        <div className="mt-4 font-mono text-[11px] text-foreground/35 tracking-[0.22em]">
          BALANCE · POLICY · SETTLEMENT
        </div>
      </div>
    </div>
  )
}

function AccountFeatureDiagram({ kind }: { kind: AccountFeature['diagram'] }) {
  if (kind === 'keys') return <KeyTypesDiagram />
  if (kind === 'access') return <AccessKeyDiagram />
  if (kind === 'policies') return <PoliciesDiagram />
  return <VirtualAddressDiagram />
}

function AccountFeatureSection({ feature, index }: { feature: AccountFeature; index: number }) {
  const visualFirst = index % 2 === 1

  const copy = (
    <div className="relative flex flex-col justify-center border-line border-b px-5 py-14 lg:border-b-0 lg:px-12 lg:py-20">
      <p className="font-mono text-[12px] text-foreground/35 tracking-[0.16em]">{feature.kicker}</p>
      <h2 className="mt-4 max-w-[560px] text-balance font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
        {feature.title}
      </h2>
      <p className="mt-5 max-w-[540px] font-sans text-[16px] text-foreground/50 leading-[1.55] tracking-[0]">
        {feature.desc}
      </p>
      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Button href={feature.href} variant="primary">
          {feature.cta}
        </Button>
      </div>
    </div>
  )

  const diagram =
    feature.diagram === 'access' ? (
      <AccessKeysPanel />
    ) : feature.diagram === 'policies' ? (
      <ReceivePoliciesPanel />
    ) : (
      <AccountFeatureDiagram kind={feature.diagram} />
    )

  return (
    <section id={feature.id} className={`${index === 0 ? '' : 'mt-[140px]'} scroll-mt-12`}>
      <Reveal className="relative border-line border-y">
        <EdgeMarkers wideOnly />
        <div className="grid lg:grid-cols-2">
          <div className={`order-1 ${visualFirst ? 'lg:order-2' : 'lg:order-1'}`}>{copy}</div>
          <div className={`order-2 ${visualFirst ? 'lg:order-1' : 'lg:order-2'}`}>{diagram}</div>
        </div>
        <div className="grid border-line border-t sm:grid-cols-3">
          {feature.points.map((point) => (
            <a
              key={point.title}
              href={point.href}
              className="group border-line border-b px-5 py-7 transition-colors hover:bg-surface-block sm:border-r sm:border-b-0 sm:last:border-r-0 lg:px-8"
            >
              <span className={`block size-2.5 ${point.accent}`} />
              <h3 className="mt-6 font-sans text-[19px] text-foreground leading-[1.15] tracking-[0]">
                {point.title}
              </h3>
              <p className="mt-3 max-w-[360px] font-sans text-[14px] text-foreground/50 leading-[1.5] tracking-[0]">
                {point.desc}
              </p>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

export default function AccountsSections() {
  return (
    <>
      {accountFeatures.map((feature, index) => (
        <AccountFeatureSection key={feature.id} feature={feature} index={index} />
      ))}
      <FeatureFaq
        title="Tempo Accounts FAQ."
        intro="How native account controls fit into wallets, payment apps, and hosted account infrastructure."
        items={ACCOUNT_FAQS}
      />
    </>
  )
}

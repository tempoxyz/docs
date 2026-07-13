'use client'

import Button from '../../_components/Button'
import CodeWindow, { type CodeVariant } from '../../_components/CodeWindow'
import EdgeMarkers from '../../_components/EdgeMarkers'
import Reveal from '../../_components/Reveal'
import FeatureFaq, { type FaqItem } from './FeatureFaq'

type Capability = {
  title: string
  desc: string
  href: string
  accent: string
}

const accountCodeVariants: CodeVariant[] = [
  {
    lang: 'Access key',
    code: [
      'import { Account, Actions, Expiry } from "viem/tempo";',
      'import { generatePrivateKey } from "viem/accounts";',
      '',
      'const sessionKey = Account.fromP256(generatePrivateKey(), {',
      '  access: rootAccount,',
      '});',
      '',
      'const authorization = await Actions.accessKey.signAuthorization(client, {',
      '  accessKey: sessionKey,',
      '  expiry: Expiry.days(7),',
      '  spendingLimit: { token: usdc, amount: 100_000_000n },',
      '});',
    ],
    highlight: ['Account.fromP256', 'Expiry.days(7)', 'spendingLimit'],
  },
  {
    lang: 'Virtual address',
    code: [
      'import { getVirtualAddress } from "viem/tempo";',
      '',
      'const depositAddress = getVirtualAddress({',
      '  master: treasuryAccount,',
      '  salt: customerId,',
      '});',
      '',
      '// Customer funds arrive at a unique address.',
      '// TIP-20 resolution forwards them to treasuryAccount.',
    ],
    highlight: ['getVirtualAddress', 'treasuryAccount', 'customerId'],
  },
  {
    lang: 'Receive policy',
    code: [
      'await client.receivePolicy.setPolicy({',
      '  account: merchant,',
      '  acceptedTokens: [usdc, usdt],',
      '  allowedSenders: [processor],',
      '  recovery: complianceOps,',
      '});',
    ],
    highlight: ['acceptedTokens', 'allowedSenders', 'recovery'],
  },
]

const capabilities: Capability[] = [
  {
    title: 'Root keys and passkeys',
    desc: 'Keep ordinary EVM addresses while adding modern signing paths for wallets, devices, and recovery.',
    href: '/docs/protocol/accounts#key-model',
    accent: 'bg-[#7C5CFF]',
  },
  {
    title: 'Scoped access keys',
    desc: 'Authorize sessions, agents, and apps with spending limits, expiry, and call scopes.',
    href: '/docs/guide/tempo-transaction#access-keys',
    accent: 'bg-[#16A34A]',
  },
  {
    title: 'Virtual addresses',
    desc: 'Issue per-customer deposit addresses that resolve back to a master account.',
    href: '/docs/guide/payments/virtual-addresses',
    accent: 'bg-[#F97316]',
  },
  {
    title: 'Receive policies',
    desc: 'Define token and sender controls for inbound transfers, mints, and recovery flows.',
    href: '/docs/guide/payments/configure-receive-policies',
    accent: 'bg-[#0891B2]',
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

function AccountModelDiagram() {
  const nodes = [
    { label: 'ROOT KEY', detail: 'FULL CONTROL', className: 'left-[8%] top-[12%]' },
    { label: 'PASSKEY', detail: 'USER DEVICE', className: 'left-[8%] top-[38%]' },
    { label: 'ACCESS KEY', detail: 'SCOPED SESSION', className: 'left-[8%] top-[64%]' },
    { label: 'VIRTUAL ADDRESS', detail: 'DEPOSIT ALIAS', className: 'right-[7%] top-[16%]' },
    { label: 'RECEIVE POLICY', detail: 'TOKEN + SENDER', className: 'right-[7%] top-[46%]' },
    { label: 'FEE TOKEN', detail: 'STABLECOIN FEES', className: 'right-[7%] top-[70%]' },
  ]

  return (
    <div className="relative overflow-hidden border-line border-b bg-surface-block lg:min-h-[620px] lg:border-r lg:border-b-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative grid gap-4 p-5 py-12 lg:hidden">
        <div className="border border-foreground/20 bg-surface-shell shadow-2xl">
          <div className="border-line border-b px-5 py-4">
            <div className="font-mono text-[11px] text-foreground/45 tracking-[0.12em]">
              ACCOUNT
            </div>
            <div className="mt-1 font-sans text-[24px] text-foreground tracking-[0]">
              0xA11c...09
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-line">
            <div className="px-4 py-4">
              <div className="font-mono text-[10px] text-foreground/35 tracking-[0.12em]">
                SIG
              </div>
              <div className="mt-1 text-[14px] text-foreground/70">P256</div>
            </div>
            <div className="px-4 py-4">
              <div className="font-mono text-[10px] text-foreground/35 tracking-[0.12em]">
                FEE
              </div>
              <div className="mt-1 text-[14px] text-foreground/70">USDC</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {nodes.map((node) => (
            <div key={node.label} className="border border-line bg-surface-shell px-3 py-3 shadow-lg">
              <div className="font-mono text-[9px] text-foreground/40 tracking-[0.12em]">
                {node.detail}
              </div>
              <div className="mt-1 font-sans text-[14px] text-foreground leading-[1.2] tracking-[0]">
                {node.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <svg aria-hidden className="absolute inset-0 hidden size-full lg:block" viewBox="0 0 760 560">
        <path
          d="M190 116 C290 116 310 252 380 252"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/18"
        />
        <path
          d="M190 264 C276 264 306 276 380 276"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/18"
        />
        <path
          d="M190 408 C290 408 310 304 380 304"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/18"
        />
        <path
          d="M570 124 C470 124 456 246 380 252"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/18"
        />
        <path
          d="M570 294 C482 294 456 282 380 276"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/18"
        />
        <path
          d="M570 424 C470 424 456 304 380 304"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/18"
        />
      </svg>

      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 hidden w-[210px] border border-foreground/20 bg-surface-shell shadow-2xl lg:block">
        <div className="border-line border-b px-5 py-4">
          <div className="font-mono text-[11px] text-foreground/45 tracking-[0.12em]">
            ACCOUNT
          </div>
          <div className="mt-1 font-sans text-[24px] text-foreground tracking-[0]">
            0xA11c...09
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line">
          <div className="px-4 py-4">
            <div className="font-mono text-[10px] text-foreground/35 tracking-[0.12em]">SIG</div>
            <div className="mt-1 text-[14px] text-foreground/70">P256</div>
          </div>
          <div className="px-4 py-4">
            <div className="font-mono text-[10px] text-foreground/35 tracking-[0.12em]">FEE</div>
            <div className="mt-1 text-[14px] text-foreground/70">USDC</div>
          </div>
        </div>
      </div>

      {nodes.map((node) => (
        <div
          key={node.label}
          className={`absolute hidden w-[154px] border border-line bg-surface-shell px-4 py-3 shadow-lg lg:block ${node.className}`}
        >
          <div className="font-mono text-[10px] text-foreground/40 tracking-[0.12em]">
            {node.detail}
          </div>
          <div className="mt-1 font-sans text-[15px] text-foreground tracking-[0]">
            {node.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function IntroSection() {
  return (
    <section className="border-line border-t">
      <Reveal className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <AccountModelDiagram />
        <div className="relative flex flex-col justify-center px-5 py-14 lg:px-12 lg:py-20">
          <EdgeMarkers wideOnly />
          <p className="font-mono text-[12px] text-foreground/35 tracking-[0.16em]">
            ACCOUNT MODEL
          </p>
          <h2 className="mt-4 max-w-[540px] text-balance font-sans text-[clamp(2rem,6vw,3.25rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
            One address, multiple controls.
          </h2>
          <p className="mt-5 max-w-[560px] font-sans text-[16px] text-foreground/50 leading-[1.55] tracking-[0]">
            Tempo accounts keep the operational simplicity of EVM addresses while adding native
            account controls for signing, delegation, inbound funds, deposit attribution, and fee
            payment.
          </p>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Button href="/docs/guide/accounts" variant="primary">
              Start with accounts
            </Button>
            <Button href="/docs/protocol/accounts" arrow>
              Protocol model
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function CapabilitySection() {
  return (
    <section id="capabilities" className="scroll-mt-12 border-line border-t">
      <Reveal className="grid border-line border-b lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-line border-b px-5 py-14 lg:border-r lg:border-b-0 lg:px-12 lg:py-20">
          <p className="font-mono text-[12px] text-foreground/35 tracking-[0.16em]">
            CAPABILITIES
          </p>
          <h2 className="mt-4 max-w-[460px] text-balance font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
            Account primitives for payment products.
          </h2>
          <p className="mt-5 max-w-[500px] font-sans text-[16px] text-foreground/50 leading-[1.55] tracking-[0]">
            Use the same account surface for consumer wallets, merchant accounts, treasury flows,
            hosted products, and agent-driven payments.
          </p>
        </div>
        <div className="grid sm:grid-cols-2">
          {capabilities.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group min-h-[260px] border-line border-b px-5 py-8 transition-colors hover:bg-surface-block sm:border-r sm:even:border-r-0 lg:px-8"
            >
              <span className={`block size-2.5 ${item.accent}`} />
              <h3 className="mt-7 font-sans text-[22px] text-foreground leading-[1.15] tracking-[0]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[360px] font-sans text-[15px] text-foreground/50 leading-[1.5] tracking-[0]">
                {item.desc}
              </p>
              <span className="mt-6 inline-flex font-sans text-[14px] text-foreground/45 transition-colors group-hover:text-foreground">
                Read more
              </span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

function CodeSection() {
  return (
    <section id="examples" className="mt-[140px] scroll-mt-12">
      <Reveal className="relative border-line border-t">
        <EdgeMarkers wideOnly />
        <div className="grid border-line border-b lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center border-line border-b px-5 py-14 lg:border-r lg:border-b-0 lg:px-12 lg:py-20">
            <p className="font-mono text-[12px] text-foreground/35 tracking-[0.16em]">
              IMPLEMENTATION
            </p>
            <h2 className="mt-4 max-w-[520px] text-balance font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
              Compose keys, aliases, and policies.
            </h2>
            <p className="mt-5 max-w-[500px] font-sans text-[16px] text-foreground/50 leading-[1.55] tracking-[0]">
              Accounts become a reusable infrastructure layer: sign with root keys, delegate to
              scoped keys, route deposits through virtual addresses, and enforce receive rules.
            </p>
            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
              <Button href="/docs/guide/accounts" variant="primary">
                Account guide
              </Button>
              <Button href="/docs/protocol/transactions/AccountKeychain" arrow>
                Keychain spec
              </Button>
            </div>
          </div>
          <div className="bg-surface-block p-5 lg:p-10">
            <CodeWindow
              title="account-primitives.ts"
              variants={accountCodeVariants}
              heightClassName="min-h-[420px] lg:min-h-[500px]"
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default function AccountsSections() {
  return (
    <>
      <IntroSection />
      <CapabilitySection />
      <CodeSection />
      <FeatureFaq
        title="Tempo Accounts FAQ."
        intro="How native account controls fit into wallets, payment apps, and hosted account infrastructure."
        items={ACCOUNT_FAQS}
      />
    </>
  )
}

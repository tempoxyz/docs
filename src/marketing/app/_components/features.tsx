import type { ReactNode } from 'react'

export type FeatureItemData = {
  label: string
  desc: string
  // When present, the row becomes interactive: hovering previews this snippet
  // in the opposite half and clicking pins it.
  code?: string[]
  // Substrings of `code` to emphasize with a boxed container.
  highlight?: string[]
}

export type Feature = {
  // Stable feature key used by feature-page routing and section selection.
  slug: string
  title: string
  // Muted by default; wrap keywords in <span className="text-foreground"> to highlight.
  description: ReactNode
  items: FeatureItemData[]
  // Extra capabilities shown only on the dedicated feature page, where
  // there's room to feature the full set. The homepage row stays curated.
  extraItems?: FeatureItemData[]
  readLabel: string
  readHref: string
  heroActions?: {
    label: string
    href: string
    primary?: boolean
  }[]
}

const featurePrecedence: Record<string, number> = {
  tokens: 0,
  transactions: 1,
}

export const features: Feature[] = [
  {
    slug: 'transactions',
    title: 'Tempo Transactions',
    description: (
      <>
        Tempo Transactions let apps <span className="text-foreground">batch</span>,{' '}
        <span className="text-foreground">sponsor</span>,{' '}
        <span className="text-foreground">schedule</span>, and{' '}
        <span className="text-foreground">parallelize</span> payments through a native transaction
        type.
      </>
    ),
    items: [
      {
        label: 'Batch calls',
        desc: 'Bundle multiple payments into a single transaction',
        code: [
          'import { client } from "./viem.config";',
          '',
          '// Calls execute atomically in one tx',
          'const receipt = await client.sendTransactionSync({',
          '  calls: [',
          '    { to: usdc, data: transferData(alice, 10n) },',
          '    { to: usdc, data: transferData(bob, 25n) },',
          '  ],',
          '});',
        ],
        highlight: [
          '{ to: usdc, data: transferData(alice, 10n) }',
          '{ to: usdc, data: transferData(bob, 25n) }',
        ],
      },
      {
        label: 'Fee Sponsorship',
        desc: 'Sponsor fees so users do not need to hold gas',
        code: [
          'import { parseUnits } from "viem";',
          'import { client } from "./viem.config";',
          '',
          '// App pays gas via a fee-payer signature',
          'const { receipt } = await client.token.transferSync({',
          '  token: usdc,',
          '  to: alice,',
          '  amount: parseUnits("10", 6),',
          '  feePayer: sponsor,',
          '});',
        ],
        highlight: ['feePayer: sponsor'],
      },
      {
        label: 'Concurrent Transactions',
        desc: 'Run parallel payment flows without nonce bottlenecks',
        code: [
          'import { client } from "./viem.config";',
          '',
          '// 2D nonce keys separate independent flows',
          'const opts = { token: usdc, nonceKey: 7 };',
          '',
          'const [a, b] = await Promise.all([',
          '  client.token.transferSync({ ...opts, to: alice, amount }),',
          '  client.token.transferSync({ ...opts, to: bob, amount }),',
          ']);',
        ],
        highlight: ['nonceKey: 7'],
      },
      {
        label: 'Scheduled Transactions',
        desc: 'Sign now, execute within a defined time window',
        code: [
          'import { client } from "./viem.config";',
          '',
          'const now = Math.floor(Date.now() / 1000);',
          '',
          '// Valid only inside this time window',
          'const receipt = await client.sendTransactionSync({',
          '  to: usdc,',
          '  data: transferData(alice, 10n),',
          '  validAfter: now,',
          '  validBefore: now + 3600,',
          '});',
        ],
        highlight: ['validAfter: now', 'validBefore: now + 3600'],
      },
    ],
    extraItems: [
      {
        label: 'Configurable fee tokens',
        desc: 'Pay network fees in any USD stablecoin, auto-converted by the Fee AMM.',
        code: [
          'import { parseUnits } from "viem";',
          'import { client } from "./viem.config";',
          '',
          '// Pay the network fee in any TIP-20 stablecoin',
          'const { receipt } = await client.token.transferSync({',
          '  token: usdc,',
          '  to: alice,',
          '  amount: parseUnits("100", 6),',
          '  feeToken: eurc,',
          '});',
        ],
        highlight: ['feeToken: eurc'],
      },
      {
        label: 'Access keys',
        desc: 'Delegate signing to scoped keys with spending limits and expiry.',
        code: [
          'import { generatePrivateKey } from "viem/accounts";',
          'import { Account, Actions, Expiry } from "viem/tempo";',
          'import { client } from "./viem.config";',
          '',
          '// Authorize a scoped key to sign transactions',
          'const accessKey = Account.fromP256(generatePrivateKey(), {',
          '  access: client.account,',
          '});',
          '',
          'const auth = await Actions.accessKey.signAuthorization(',
          '  client,',
          '  { accessKey, expiry: Expiry.days(7) },',
          ');',
        ],
        highlight: ['Actions.accessKey.signAuthorization'],
      },
    ],
    readLabel: 'Read transaction docs',
    readHref: '/docs/protocol/transactions',
    heroActions: [
      {
        label: 'Accept payments',
        href: '/docs/guide/payments/accept-a-payment',
        primary: true,
      },
      {
        label: 'Send payments',
        href: '/docs/guide/payments/send-a-payment',
      },
      {
        label: 'Transaction guide',
        href: '/docs/guide/tempo-transaction',
      },
    ],
  },
  {
    slug: 'tokens',
    title: 'TIP-20 Tokens',
    description: (
      <>
        TIP-20 gives stablecoins the primitives needed for payments:{' '}
        <span className="text-foreground">fees</span>,{' '}
        <span className="text-foreground">memos</span>,{' '}
        <span className="text-foreground">lanes</span>,{' '}
        <span className="text-foreground">policies</span>,{' '}
        <span className="text-foreground">rewards</span>, and{' '}
        <span className="text-foreground">issuer controls</span>.
      </>
    ),
    items: [
      {
        label: 'Stablecoin fees',
        desc: 'Pay network fees directly in supported stablecoins.',
        code: [
          'import { parseUnits } from "viem";',
          'import { client } from "./viem.config";',
          '',
          '// Send alphaUSD, pay the fee in betaUSD',
          'const { receipt } = await client.token.transferSync({',
          '  token: alphaUsd,',
          '  to: alice,',
          '  amount: parseUnits("100", 6),',
          '  feeToken: betaUsd,',
          '});',
        ],
        highlight: ['feeToken: betaUsd'],
      },
      {
        label: 'Transfer memos',
        desc: 'Attach payment references, invoice IDs, or notes.',
        code: [
          'import { parseUnits, stringToHex, pad } from "viem";',
          'import { client } from "./viem.config";',
          '',
          '// Attach a 32-byte invoice reference',
          'const memo = pad(stringToHex("INV-12345"), { size: 32 });',
          '',
          'const { receipt } = await client.token.transferSync({',
          '  token: usdc,',
          '  to: alice,',
          '  amount: parseUnits("100", 6),',
          '  memo,',
          '});',
        ],
        highlight: ['pad(stringToHex("INV-12345"), { size: 32 })', 'memo,'],
      },
      {
        label: 'Payment lanes',
        desc: 'Reserve blockspace for predictable payment execution.',
        code: [
          'import { parseUnits } from "viem";',
          'import { client } from "./viem.config";',
          '',
          '// TIP-20 transfers use the reserved payment',
          '// lane automatically — predictable inclusion',
          'const { receipt } = await client.token.transferSync({',
          '  token: usdc,',
          '  to: alice,',
          '  amount: parseUnits("100", 6),',
          '});',
        ],
        highlight: ['client.token.transferSync'],
      },
      {
        label: 'Issuer controls',
        desc: 'Mint, burn, pause, cap supply, and manage roles.',
        code: [
          'import { parseUnits } from "viem";',
          'import { client } from "./viem.config";',
          '',
          '// Issuer-only supply & emergency controls',
          'await client.token.mintSync({',
          '  token: usdc,',
          '  to: treasury,',
          '  amount: parseUnits("1000000", 6),',
          '});',
          'await client.token.setSupplyCapSync({ token: usdc, supplyCap });',
          'await client.token.pauseSync({ token: usdc });',
        ],
        highlight: [
          'client.token.mintSync',
          'client.token.setSupplyCapSync',
          'client.token.pauseSync',
        ],
      },
    ],
    readLabel: 'Read TIP-20 docs',
    readHref: '/docs/protocol/tip20/overview',
    heroActions: [
      {
        label: 'Create a stablecoin',
        href: '/docs/guide/issuance/create-a-stablecoin',
        primary: true,
      },
      {
        label: 'Issuance guide',
        href: '/docs/guide/issuance',
      },
      {
        label: 'TIP-20 spec',
        href: '/docs/protocol/tip20/spec',
      },
    ],
  },
].sort(
  (a, b) =>
    (featurePrecedence[a.slug] ?? Number.MAX_SAFE_INTEGER) -
    (featurePrecedence[b.slug] ?? Number.MAX_SAFE_INTEGER),
)

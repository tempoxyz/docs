import type { FeatureDiagramSpec } from './featureDiagram'

// Every Tempo feature that needs a diagram, grouped by product area (mirrors the
// site's feature pages and docs). Each entry starts from a hub-and-
// spoke `spec` whose shape roughly matches the feature's meaning — fan-in for
// things that aggregate, fan-out for things that distribute, one-to-one for
// direct flows. These are starting points: we refine each into a purpose-built
// diagram from the playground, one feature at a time.

export type FeatureEntry = {
  // kebab id, stable for linking/iteration.
  id: string
  name: string
  blurb: string
  spec: FeatureDiagramSpec
}

export type FeatureArea = {
  area: string
  blurb: string
  features: FeatureEntry[]
}

const fanOut = (left: number, right: number[]): FeatureDiagramSpec => ({
  kind: 'hub',
  left: [{ accent: left }],
  right: right.map((accent) => ({ accent })),
})

const oneToOne = (left: number, right: number): FeatureDiagramSpec => ({
  kind: 'hub',
  left: [{ accent: left }],
  right: [{ accent: right }],
})

// A policy gate: inbound transfers pass, `blocked` ones are stopped before the
// account. Each source carries a token/sender label and the rule it matched.
const gate = (
  dest: { accent: number; label: string; sub: string },
  sources: { accent: number; label: string; detail: string; blocked?: boolean }[],
): FeatureDiagramSpec => ({
  kind: 'gate',
  sources,
  dest: dest.accent,
  destLabel: dest.label,
  destSub: dest.sub,
})

// Independent transactions on parallel lanes landing together in one block.
const lanes = (
  txs: { accent: number; label: string; detail: string }[],
  blockLabel: string,
  blockSub: string,
): FeatureDiagramSpec => ({ kind: 'lanes', txs, blockLabel, blockSub })

// One account with many nonced txs in flight; a `pending` tx never blocks the
// others from confirming.
const nonces = (
  account: { accent: number; label: string; sub: string },
  txs: { accent: number; label: string; detail: string; pending?: boolean }[],
  note: string,
): FeatureDiagramSpec => ({
  kind: 'nonces',
  account: account.accent,
  accountLabel: account.label,
  accountSub: account.sub,
  txs,
  note,
})

// A block split into a reserved payment lane and a congested general lane.
const blockspace = (
  payments: { accent: number; label: string; detail: string }[],
  general: { accent: number; label: string; detail: string },
  paymentLaneLabel: string,
  generalLabel: string,
): FeatureDiagramSpec => ({
  kind: 'blockspace',
  payments,
  general,
  paymentLaneLabel,
  generalLabel,
})

// A user-selected fee token is converted by the enshrined Fee AMM into the
// validator's preferred token.
type FeeAmmParty = { accent: number; label: string; detail: string }
type FeeAmmToken = { accent: number; symbol: string }
const feeamm = (cfg: {
  user: FeeAmmParty
  selectedToken: FeeAmmToken
  receivedToken: FeeAmmToken
  ammLabel: string
  validator: FeeAmmParty
}): FeatureDiagramSpec => ({ kind: 'feeamm', ...cfg })

// Fee sponsorship: the app signs the transaction as fee payer; the user sends
// it, and Tempo debits the fee payer balance for fees.
type SponsorParty = { accent: number; label: string; detail: string }
const sponsor = (cfg: {
  user: SponsorParty
  sponsor: SponsorParty
  txLabel: string
  actionLabel: string
  gasLabel: string
  hubLabel: string
  caption: string
}): FeatureDiagramSpec => ({ kind: 'sponsor', ...cfg })

// Batch & schedule: many calls bundle into one atomic, single-signature
// transaction (all-or-nothing) that executes inside a scheduled time window.
type BatchCall = { accent: number; label: string }
const batch = (cfg: {
  batchLabel: string
  calls: BatchCall[]
  sealLabel: string
  openLabel: string
  closeLabel: string
  hubLabel: string
  caption: string
}): FeatureDiagramSpec => ({ kind: 'batch', ...cfg })

// Enshrined stablecoin DEX: a token trades natively through a real order book
// and taps protocol-level liquidity with no pool to deploy.
type DexParty = { accent: number; label: string; detail: string }
const dex = (cfg: {
  input: DexParty
  output: DexParty
  asks: number[]
  bids: number[]
  bookLabel: string
  caption: string
}): FeatureDiagramSpec => ({ kind: 'dex', ...cfg })

// Transfer memos: a payment carries a short reference that is recorded on-chain
// with the money, so it surfaces in the transaction record for reconciliation.
type MemoField = { label: string; value?: string; highlight?: boolean; barW?: number }
const memo = (cfg: {
  paymentLabel: string
  amount: string
  amountAccent: number
  memoLabel: string
  memoValue: string
  memoAccent: number
  explorerLabel: string
  fields: MemoField[]
  caption: string
}): FeatureDiagramSpec => ({ kind: 'memo', ...cfg })

// An account delegating to scoped keys, each with a name, scope, and cap (0..1).
const keys = (
  account: { accent: number; label: string; sub: string },
  ks: { accent: number; cap: number; name: string; scope: string; revoked?: boolean }[],
): FeatureDiagramSpec => ({
  kind: 'keys',
  account: account.accent,
  accountLabel: account.label,
  accountSub: account.sub,
  keys: ks,
})

// Deposits land on per-customer virtual addresses, then auto-forward into one
// destination wallet — no sweep transactions.
const forward = (
  dest: { accent: number; label: string; sub: string },
  sources: { accent: number; label: string; detail: string }[],
): FeatureDiagramSpec => ({
  kind: 'forward',
  dest: dest.accent,
  destLabel: dest.label,
  destSub: dest.sub,
  sources,
})

// Many credentials linking to one account, with an optional recovery standby.
const link = (
  account: { accent: number; label: string; sub: string },
  creds: { accent: number; name: string; detail: string; recovery?: boolean }[],
): FeatureDiagramSpec => ({
  kind: 'link',
  account: account.accent,
  accountLabel: account.label,
  accountSub: account.sub,
  credentials: creds,
})

export const FEATURE_CATALOG: FeatureArea[] = [
  {
    area: 'Accounts',
    blurb: 'Self-custodial accounts, scoped keys, and virtual addresses.',
    features: [
      {
        id: 'passkey-accounts',
        name: 'Passkey accounts',
        blurb: 'Self-custody with WebAuthn — no seed phrase.',
        spec: link({ accent: 2, label: 'ACCOUNT', sub: 'SELF-CUSTODY · NO SEED PHRASE' }, [
          { accent: 0, name: 'PASSKEY', detail: 'iPHONE · FACE ID' },
          { accent: 1, name: 'PASSKEY', detail: 'LAPTOP · TOUCH ID' },
          { accent: 3, name: 'PASSKEY', detail: 'SECURITY KEY · FIDO2' },
        ]),
      },
      {
        id: 'access-keys',
        name: 'Access keys',
        blurb: 'Scoped, capped keys for apps and agents.',
        spec: keys({ accent: 1, label: 'ACCOUNT', sub: 'ROOT · PASSKEY' }, [
          { accent: 0, cap: 0.7, name: 'AGENT KEY', scope: 'PAY · ≤ $500/DAY · 7d' },
          { accent: 2, cap: 0.45, name: 'CHECKOUT KEY', scope: 'REFUND · ≤ $2K/DAY · 30d' },
          { accent: 3, cap: 0.2, name: 'BACKUP KEY', scope: 'READ-ONLY · NO EXPIRY' },
        ]),
      },
      {
        id: 'spend-limits',
        name: 'Spend limits & revocation',
        blurb: 'Periodic caps, instant revoke.',
        spec: keys({ accent: 1, label: 'ACCOUNT', sub: 'OWNER' }, [
          { accent: 0, cap: 0.92, name: 'AGENT KEY', scope: 'DAILY · RESETS 00:00 UTC' },
          { accent: 2, cap: 0.5, name: 'PAYROLL KEY', scope: 'WEEKLY · ≤ $10K' },
          { accent: 3, cap: 0, name: 'OLD KEY', scope: 'REVOKED · 2d AGO', revoked: true },
        ]),
      },
      {
        id: 'linking-recovery',
        name: 'Linking & recovery',
        blurb: 'Link credentials, recover without seed phrases.',
        spec: link({ accent: 1, label: 'ACCOUNT', sub: 'ONE IDENTITY' }, [
          { accent: 0, name: 'PASSKEY', detail: 'iPHONE · FACE ID' },
          { accent: 2, name: 'PASSKEY', detail: 'LAPTOP · TOUCH ID' },
          { accent: 3, name: 'RECOVERY', detail: 'GUARDIANS · 3 OF 5', recovery: true },
        ]),
      },
      {
        id: 'virtual-addresses',
        name: 'Virtual addresses',
        blurb: 'One master, many deposit addresses, auto-forwarded.',
        spec: forward({ accent: 1, label: 'MASTER WALLET', sub: 'ONE ADDRESS · NO SWEEPS' }, [
          { accent: 0, label: 'CUSTOMER A', detail: 'VADDR · AUTO-FWD' },
          { accent: 2, label: 'CUSTOMER B', detail: 'VADDR · AUTO-FWD' },
          { accent: 3, label: 'CUSTOMER C', detail: 'VADDR · AUTO-FWD' },
        ]),
      },
    ],
  },
  {
    area: 'Transactions',
    blurb: 'Parallel throughput, stablecoin fees, and composable flows.',
    features: [
      {
        id: 'parallel-execution',
        name: 'Parallel execution',
        blurb: 'Independent transactions run concurrently.',
        spec: lanes(
          [
            { accent: 0, label: 'SWAP', detail: 'TOUCHES POOL A' },
            { accent: 1, label: 'PAYMENT', detail: 'TOUCHES ACCT B' },
            { accent: 2, label: 'MINT', detail: 'TOUCHES TOKEN C' },
          ],
          'ONE BLOCK',
          'EXECUTED IN PARALLEL',
        ),
      },
      {
        id: 'concurrent-nonces',
        name: 'Concurrent nonces',
        blurb: 'Many transactions per account, no blocking.',
        spec: nonces(
          { accent: 1, label: 'ACCOUNT', sub: 'ONE SIGNER' },
          [
            { accent: 0, label: 'SWAP', detail: 'NONCE 41 · PENDING', pending: true },
            { accent: 2, label: 'PAYMENT', detail: 'NONCE 42 · CONFIRMED' },
            { accent: 3, label: 'TRANSFER', detail: 'NONCE 43 · CONFIRMED' },
          ],
          'NO HEAD-OF-LINE BLOCKING',
        ),
      },
      {
        id: 'payment-lanes',
        name: 'Payment lanes',
        blurb: 'Dedicated blockspace keeps payments sub-cent.',
        spec: blockspace(
          [
            { accent: 3, label: 'PAYMENT', detail: 'FEE $0.001' },
            { accent: 1, label: 'PAYOUT', detail: 'FEE $0.001' },
          ],
          { accent: 0, label: 'AIRDROP / TRADE', detail: 'FEE $0.01' },
          'PAYMENT BLOCKSPACE',
          'GENERAL BLOCKSPACE',
        ),
      },
      {
        id: 'any-stablecoin-fees',
        name: 'Fees in any stablecoin',
        blurb: 'Fee AMM converts fees automatically.',
        spec: feeamm({
          user: { accent: 0, label: 'USER', detail: 'SELECTS FEE TOKEN' },
          selectedToken: { accent: 0, symbol: 'USDC' },
          receivedToken: { accent: 1, symbol: 'USDT' },
          ammLabel: 'FEE AMM',
          validator: { accent: 1, label: 'VALIDATOR', detail: 'RECEIVES USDT' },
        }),
      },
      {
        id: 'fee-sponsorship',
        name: 'Fee sponsorship',
        blurb: 'A fee payer covers gas for users and agents.',
        spec: sponsor({
          user: { accent: 0, label: 'USER', detail: 'SENDS TX' },
          sponsor: { accent: 3, label: 'APP', detail: 'FEE PAYER' },
          txLabel: 'TEMPO TX',
          actionLabel: 'ACTION',
          gasLabel: 'APP',
          hubLabel: 'EXECUTES',
          caption: 'FEE PAYER BALANCE IS DEBITED',
        }),
      },
      {
        id: 'batch-schedule',
        name: 'Batch & schedule',
        blurb: 'Atomic batches and time windows under one signature.',
        spec: batch({
          batchLabel: 'BATCH',
          calls: [
            { accent: 0, label: 'PAYOUT 01' },
            { accent: 1, label: 'PAYOUT 02' },
            { accent: 3, label: 'PAYOUT 03' },
          ],
          sealLabel: 'ONE SIGNATURE · ATOMIC',
          openLabel: 'OPENS',
          closeLabel: 'CLOSES',
          hubLabel: 'EXECUTES',
          caption: 'ALL OR NONE · RUNS INSIDE THE WINDOW',
        }),
      },
    ],
  },
  {
    area: 'Tokens',
    blurb: 'TIP-20 stablecoins, policy, rewards, and the enshrined DEX.',
    features: [
      {
        id: 'tip20-standard',
        name: 'TIP-20 standard',
        blurb: 'Payment-native stablecoin token standard.',
        spec: oneToOne(1, 2),
      },
      {
        id: 'transfer-memos',
        name: 'Transfer memos',
        blurb: '32-byte references for reconciliation.',
        spec: memo({
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
          caption: 'RECORDED ON-CHAIN · RECONCILE BY REFERENCE',
        }),
      },
      {
        id: 'token-policies',
        name: 'Token policies (TIP-403)',
        blurb: 'Shared whitelist / blacklist registry.',
        spec: gate({ accent: 2, label: 'RECIPIENT', sub: 'TIP-403 REGISTRY' }, [
          { accent: 0, label: 'TRANSFER', detail: 'SENDER WHITELISTED' },
          { accent: 1, label: 'TRANSFER', detail: 'BLACKLISTED', blocked: true },
          { accent: 3, label: 'TRANSFER', detail: 'SENDER WHITELISTED' },
        ]),
      },
      {
        id: 'role-controls',
        name: 'Role-based controls',
        blurb: 'Issuer, pause, and burn roles.',
        spec: keys({ accent: 2, label: 'STABLECOIN', sub: 'TIP-20 · ROLE REGISTRY' }, [
          { accent: 0, cap: 1, name: 'ISSUER', scope: 'MINT · MANAGE SUPPLY' },
          { accent: 1, cap: 1, name: 'PAUSER', scope: 'PAUSE · UNPAUSE TRANSFERS' },
          { accent: 3, cap: 1, name: 'BURNER', scope: 'BURN · REDUCE SUPPLY' },
        ]),
      },
      {
        id: 'tip20-rewards',
        name: 'TIP-20 rewards',
        blurb: 'Proportional rewards to holders at scale.',
        spec: fanOut(2, [0, 1, 3]),
      },
      {
        id: 'dex-liquidity',
        name: 'Stablecoin DEX liquidity',
        blurb: 'Enshrined orderbook and shared liquidity.',
        spec: dex({
          input: { accent: 0, label: 'USDC', detail: 'ANY TIP-20' },
          output: { accent: 1, label: 'USDT', detail: 'USD STABLECOIN' },
          asks: [0.45, 0.7, 0.95],
          bids: [0.9, 0.65, 0.4],
          bookLabel: 'ENSHRINED DEX',
          caption: 'REAL ORDER BOOK · PRICE-TIME PRIORITY · NO POOL',
        }),
      },
    ],
  },
]

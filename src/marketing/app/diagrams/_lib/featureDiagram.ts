// The "feature diagram" language: a small vocabulary of SVG shapes that share
// one visual grammar — boxes, the Tempo mark, and animated dotted arcs (the
// `.diagram-flow` stroke in globals.css). Each shape says something different:
//   • hub    — nodes flowing through Tempo (aggregation, parallelism, exchange)
//   • gate   — incoming flows filtered by a policy before they land
// Specs are pure data so each feature instance composes the grammar to mean
// something specific. This directory is meant to be liftable into a standalone
// diagram package later.

// Index into PALETTE (app/_components/palette.ts). Drives a node's accent bar
// and the color of its connecting arc.
export type DiagramNode = {
  accent: number
}

// Many nodes a side flow through the hub. The original placeholder.
export type HubSpec = {
  kind: 'hub'
  left: DiagramNode[]
  right: DiagramNode[]
}

// Inbound transfers on the left try to reach a destination; `blocked` ones are
// stopped at the policy gate, the rest pass through. Each carries a label and a
// detail line (the rule it matched).
export type GateNode = {
  accent: number
  label: string
  detail: string
  blocked?: boolean
}

export type GateSpec = {
  kind: 'gate'
  sources: GateNode[]
  dest: number
  destLabel: string
  destSub: string
}

// An account delegates through its keychain to scoped keys. Each key has a name,
// a scope/expiry line, and a `cap` (0..1) drawn as a spend-limit gauge — what
// makes a key "scoped".
export type KeyNode = {
  accent: number
  cap: number
  name: string
  scope: string
  // A revoked key: its delegation is severed and the card reads as cut off.
  revoked?: boolean
}

export type KeysSpec = {
  kind: 'keys'
  account: number
  accountLabel: string
  accountSub: string
  keys: KeyNode[]
}

// Many credentials link to one account identity. A `recovery` credential is a
// standby path that can restore access — drawn dormant until needed.
export type LinkCredential = {
  accent: number
  name: string
  detail: string
  recovery?: boolean
}

export type LinkSpec = {
  kind: 'link'
  account: number
  accountLabel: string
  accountSub: string
  credentials: LinkCredential[]
}

// Deposits land on per-customer virtual addresses, then auto-forward into one
// destination wallet — no sweep transactions.
export type ForwardNode = {
  accent: number
  label: string
  detail: string
}

export type ForwardSpec = {
  kind: 'forward'
  dest: number
  destLabel: string
  destSub: string
  sources: ForwardNode[]
}

// Independent transactions run concurrently: each touches disjoint state, so
// they ride parallel lanes and land together in one block — no queue, no
// blocking. Each tx has a label and the state it touches (the detail).
export type LaneTx = {
  accent: number
  label: string
  detail: string
}

export type LanesSpec = {
  kind: 'lanes'
  txs: LaneTx[]
  blockLabel: string
  blockSub: string
}

// One account, many transactions in flight at once. Each tx carries a nonce; a
// `pending` tx is still in flight, yet the others around it confirm anyway —
// the signal that there's no head-of-line blocking by nonce order.
export type NonceTx = {
  accent: number
  label: string
  detail: string
  pending?: boolean
}

export type NoncesSpec = {
  kind: 'nonces'
  account: number
  accountLabel: string
  accountSub: string
  txs: NonceTx[]
  note: string
}

// Every block reserves part of its space for payments and leaves the rest for
// general traffic. Payment txs flow into dedicated blockspace with sub-cent
// fees; non-payment activity lands in the general lane at a higher fee.
export type BlockspaceTx = {
  accent: number
  label: string
  detail: string
}

export type BlockspaceSpec = {
  kind: 'blockspace'
  payments: BlockspaceTx[]
  general: BlockspaceTx
  paymentLaneLabel: string
  generalLabel: string
}

// Fees in any stablecoin. The user chooses the fee token, the enshrined Fee AMM
// converts it, and the validator receives their preferred token.
export type FeeAmmParty = {
  accent: number
  label: string
  detail: string
}

export type FeeAmmToken = {
  accent: number
  symbol: string
}

export type FeeAmmSpec = {
  kind: 'feeamm'
  user: FeeAmmParty
  selectedToken: FeeAmmToken
  receivedToken: FeeAmmToken
  ammLabel: string
  validator: FeeAmmParty
}

// Fee sponsorship. A single Tempo Transaction can carry a fee-payer signature
// from the app. The user sends the transaction, Tempo executes the action, and
// the protocol debits the fee from the fee payer balance.
export type SponsorParty = {
  accent: number
  label: string
  detail: string
}

export type SponsorSpec = {
  kind: 'sponsor'
  user: SponsorParty
  sponsor: SponsorParty
  txLabel: string
  actionLabel: string
  gasLabel: string
  hubLabel: string
  caption: string
}

// Batch & schedule. Many calls bundle into one atomic transaction under a single
// signature — all of them land or none do (a payroll run, say). That bundle is
// scheduled: it may only execute inside a future time window. Told abstractly as
// a stack of payouts sealed once, firing inside a window on a timeline.
export type BatchCall = {
  accent: number
  label: string
}

export type BatchSpec = {
  kind: 'batch'
  batchLabel: string
  calls: BatchCall[]
  sealLabel: string
  openLabel: string
  closeLabel: string
  hubLabel: string
  caption: string
}

// Transfer memos. Every payment can carry a short reference (TIP-20's
// transferWithMemo). The reference is recorded on-chain with the money, so it
// shows up in the transaction record — anyone can reconcile by reference, no
// guesswork. Told as a payment carrying a memo that surfaces as a highlighted
// field in a low-fidelity explorer view of the on-chain transaction.
export type MemoField = {
  label: string
  // When set, the field shows this value as text; otherwise it renders as a
  // low-fidelity skeleton bar of width `barW`.
  value?: string
  highlight?: boolean
  barW?: number
}

export type MemoSpec = {
  kind: 'memo'
  paymentLabel: string
  amount: string
  amountAccent: number
  memoLabel: string
  memoValue: string
  memoAccent: number
  explorerLabel: string
  fields: MemoField[]
  caption: string
}

// Enshrined stablecoin DEX. The exchange lives in the protocol — every TIP-20
// trades natively against a real order book (price-time priority), with no pool
// contract to deploy. A token flows in (left), matches through the book (center,
// the Tempo mark sitting on the spread between asks and bids), and taps shared
// protocol liquidity.
export type DexParty = {
  accent: number
  label: string
  detail: string
}

export type DexSpec = {
  kind: 'dex'
  input: DexParty
  resolver?: DexParty
  output: DexParty
  // Relative widths (0..1) of the order-book depth levels, asks above the spread
  // and bids below it.
  asks: number[]
  bids: number[]
  bookLabel: string
  caption: string
}

export type FeatureDiagramSpec =
  | HubSpec
  | GateSpec
  | KeysSpec
  | LinkSpec
  | ForwardSpec
  | LanesSpec
  | NoncesSpec
  | BlockspaceSpec
  | FeeAmmSpec
  | SponsorSpec
  | BatchSpec
  | MemoSpec
  | DexSpec

// Reproduces the original placeholder exactly: three nodes a side, accents
// stepping through the palette.
export const DEFAULT_SPEC: HubSpec = {
  kind: 'hub',
  left: [{ accent: 0 }, { accent: 1 }, { accent: 2 }],
  right: [{ accent: 1 }, { accent: 2 }, { accent: 3 }],
}

// Vertical center (mid-y) of each node box for a given side count, matching the
// 320-tall viewBox. The hub sits at y=160, so a single node aligns dead center
// and the three-node case keeps the original 88 / 160 / 232 rows.
export function rowCenters(count: number): number[] {
  if (count <= 1) return [160]
  if (count === 2) return [88, 232]
  return [88, 160, 232]
}

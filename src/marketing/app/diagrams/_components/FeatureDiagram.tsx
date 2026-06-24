// biome-ignore-all lint/a11y/noSvgWithoutTitle: Feature diagrams are labelled by surrounding page content and exported visually.
// biome-ignore-all lint/suspicious/noArrayIndexKey: Static SVG diagram geometry uses positional keys for repeated primitives.

import { PALETTE } from '../../_components/palette'
import {
  type BatchSpec,
  type BlockspaceSpec,
  type BlockspaceTx,
  DEFAULT_SPEC,
  type DexSpec,
  type FeatureDiagramSpec,
  type FeeAmmSpec,
  type FeeAmmToken,
  type ForwardSpec,
  type GateSpec,
  type HubSpec,
  type KeysSpec,
  type LanesSpec,
  type LinkSpec,
  type MemoSpec,
  type NoncesSpec,
  rowCenters,
  type SponsorSpec,
} from '../_lib/featureDiagram'

const markPath =
  'M5.03996 14.8395H1.03534L4.74694 3.36361H0L1.03534 0H14.2604L13.225 3.36361H8.73202L5.03996 14.8395Z'

const color = (accent: number) => PALETTE[accent % PALETTE.length]

function NodeCard({
  x,
  midY,
  accent,
  faded = false,
}: {
  x: number
  midY: number
  accent: number
  faded?: boolean
}) {
  const boxY = midY - 24
  const detailX = x + 16
  return (
    <g opacity={faded ? 0.55 : 1}>
      <rect
        x={x}
        y={boxY}
        width="96"
        height="48"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <g opacity="0.55">
        <rect x={detailX} y={boxY + 14} width="20" height="4" fill={color(accent)} />
        <rect
          x={detailX}
          y={boxY + 28}
          width="52"
          height="3"
          fill="var(--foreground)"
          opacity="0.22"
        />
        <rect
          x={detailX}
          y={boxY + 39}
          width="38"
          height="3"
          fill="var(--foreground)"
          opacity="0.14"
        />
      </g>
    </g>
  )
}

// The Tempo mark, centered on (cx, cy). Doubles as hub and policy enforcer.
function Mark({ cx = 260, cy = 160 }: { cx?: number; cy?: number }) {
  return (
    <>
      <rect
        x={cx - 12}
        y={cy - 12}
        width="24"
        height="24"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <g
        className="feature-diagram-mark"
        transform={`translate(${cx - 5.7} ${cy - 5.8}) scale(0.78)`}
        filter="url(#feature-diagram-glow)"
      >
        <path d={markPath} fill="var(--foreground)" />
      </g>
    </>
  )
}

const MONO = 'var(--font-jetbrains-mono), ui-monospace, monospace'

function Label({
  x,
  y,
  size = 11,
  opacity = 0.85,
  tracking = 0.08,
  fill = 'var(--foreground)',
  anchor = 'start',
  children,
}: {
  x: number
  y: number
  size?: number
  opacity?: number
  tracking?: number
  fill?: string
  anchor?: 'start' | 'middle' | 'end'
  children: string
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      opacity={opacity}
      letterSpacing={`${tracking}em`}
      textAnchor={anchor}
      data-small-caption={size <= 8.5 ? '' : undefined}
      style={{ fontFamily: MONO }}
    >
      {children}
    </text>
  )
}

function Cross({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M${cx - 5} ${cy - 5}l10 10M${cx + 5} ${cy - 5}l-10 10`}
      stroke="var(--foreground)"
      strokeWidth="1.5"
      opacity="0.5"
    />
  )
}

function Flow({ d, accent, faded = false }: { d: string; accent: number; faded?: boolean }) {
  return (
    <path
      className="diagram-flow"
      d={d}
      stroke={color(accent)}
      strokeWidth="2"
      fill="none"
      opacity={faded ? 0.5 : 1}
    />
  )
}

// ── hub ─────────────────────────────────────────────────────────────────────
function HubShape({ spec }: { spec: HubSpec }) {
  const leftRows = rowCenters(spec.left.length)
  const rightRows = rowCenters(spec.right.length)
  const leftArc = (y: number) => (y === 160 ? 'M160 160H248' : `M160 ${y}C208 ${y} 210 160 248 160`)
  const rightArc = (y: number) =>
    y === 160 ? 'M272 160H360' : `M272 160C310 160 312 ${y} 360 ${y}`
  return (
    <>
      {spec.left.map((n, i) => (
        <NodeCard key={`l${i}`} x={64} midY={leftRows[i]} accent={n.accent} />
      ))}
      {spec.right.map((n, i) => (
        <NodeCard key={`r${i}`} x={360} midY={rightRows[i]} accent={n.accent} />
      ))}
      {spec.left.map((n, i) => (
        <Flow key={`la${i}`} d={leftArc(leftRows[i])} accent={n.accent} />
      ))}
      {spec.right.map((n, i) => (
        <Flow key={`ra${i}`} d={rightArc(rightRows[i])} accent={n.accent} />
      ))}
      <Mark />
    </>
  )
}

// ── gate ────────────────────────────────────────────────────────────────────
// Inbound transfers (left) are screened by a policy gate. Allowed transfers pass
// through to the destination (right); blocked ones stop at the gate with an ✗.
// This is a rule at the edge, not a flow through Tempo — so there's no central
// mark.
const GATE_SRC_X = 24
const GATE_SRC_W = 192
const GATE_SRC_H = 54
const GATE_X = 256
const GATE_DEST_X = 360
const GATE_DEST_W = 136
function GateShape({ spec }: { spec: GateSpec }) {
  const rows = rowCenters(spec.sources.length)
  const srcRight = GATE_SRC_X + GATE_SRC_W
  const destTop = 118
  return (
    <>
      {/* Inbound transfer cards: token / sender + the rule they match. */}
      {spec.sources.map((n, i) => {
        const y = rows[i]
        const top = y - GATE_SRC_H / 2
        const px = GATE_SRC_X + 16
        return (
          <g key={`s${i}`} opacity={n.blocked ? 0.45 : 1}>
            <rect
              x={GATE_SRC_X}
              y={top}
              width={GATE_SRC_W}
              height={GATE_SRC_H}
              rx="2"
              fill="var(--surface-block)"
              stroke="var(--line-strong)"
            />
            <Label x={px} y={top + 22} size={10} tracking={0.13} opacity={0.9}>
              {n.label}
            </Label>
            <Label x={px} y={top + 40} size={8} tracking={0.14} opacity={0.4}>
              {n.detail}
            </Label>
          </g>
        )
      })}

      {/* The destination behind the policy. */}
      <rect
        x={GATE_DEST_X}
        y={destTop}
        width={GATE_DEST_W}
        height="84"
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={GATE_DEST_X + 18} y={destTop + 22} width="20" height="3" fill={color(spec.dest)} />
      <Label x={GATE_DEST_X + 18} y={destTop + 46} size={10.5} tracking={0.13} opacity={0.9}>
        {spec.destLabel}
      </Label>
      <Label x={GATE_DEST_X + 18} y={destTop + 62} size={8} tracking={0.14} opacity={0.38}>
        {spec.destSub}
      </Label>

      {/* The policy check: a dashed gate transfers are screened at. */}
      <line
        x1={GATE_X}
        y1={64}
        x2={GATE_X}
        y2={256}
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <Label x={GATE_X} y={52} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        POLICY CHECK
      </Label>

      {spec.sources.map((n, i) => {
        const y = rows[i]
        if (n.blocked) {
          return (
            <g key={`b${i}`}>
              <path
                d={`M${srcRight} ${y}H${GATE_X - 8}`}
                stroke="var(--line-strong)"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              <Cross cx={GATE_X} cy={y} />
              <Label x={GATE_X + 12} y={y + 3} size={8} tracking={0.16} opacity={0.5}>
                BLOCKED
              </Label>
            </g>
          )
        }
        const d =
          y === 160
            ? `M${srcRight} 160H${GATE_DEST_X}`
            : `M${srcRight} ${y}C${GATE_X - 12} ${y} ${GATE_X + 12} 160 ${GATE_DEST_X} 160`
        return <Flow key={`p${i}`} d={d} accent={n.accent} />
      })}
    </>
  )
}

// ── keys ────────────────────────────────────────────────────────────────────
// A scoped key card: name, a spend-cap gauge filled to `cap`, and a scope/expiry
// line. The gauge + scope are what read as "scoped & capped".
const KEY_X = 292
const KEY_W = 204
const KEY_H = 66
function KeyCard({
  midY,
  accent,
  cap,
  name,
  scope,
  revoked = false,
}: {
  midY: number
  accent: number
  cap: number
  name: string
  scope: string
  revoked?: boolean
}) {
  const top = midY - KEY_H / 2
  const px = KEY_X + 18
  const gaugeW = KEY_W - 36
  const fill = Math.max(0, Math.min(1, cap))
  return (
    <g opacity={revoked ? 0.4 : 1}>
      <rect
        x={KEY_X}
        y={top}
        width={KEY_W}
        height={KEY_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <Label x={px} y={top + 22} size={10.5} tracking={0.14} opacity={0.9}>
        {name}
      </Label>
      <rect x={px} y={top + 32} width={gaugeW} height="4" fill="var(--line-strong)" opacity="0.6" />
      {!revoked && (
        <rect x={px} y={top + 32} width={gaugeW * fill} height="4" fill={color(accent)} />
      )}
      <Label x={px} y={top + 52} size={8} tracking={0.16} opacity={0.38}>
        {scope}
      </Label>
    </g>
  )
}

function KeysShape({ spec }: { spec: KeysSpec }) {
  const rows = rowCenters(spec.keys.length)
  const accX = 24
  const accW = 128
  const accTop = 128
  const accRight = accX + accW
  return (
    <>
      {/* Account: the root authority. It delegates straight to its keys — no hub
          in the middle, since this is an account feature, not a flow through
          Tempo. */}
      <rect
        x={accX}
        y={accTop}
        width={accW}
        height="64"
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={accX + 18} y={accTop + 18} width="20" height="3" fill={color(spec.account)} />
      <Label x={accX + 18} y={accTop + 40} size={10.5} tracking={0.14} opacity={0.9}>
        {spec.accountLabel}
      </Label>
      <Label x={accX + 18} y={accTop + 54} size={8} tracking={0.16} opacity={0.38}>
        {spec.accountSub}
      </Label>

      {spec.keys.map((k, i) => (
        <KeyCard
          key={`k${i}`}
          midY={rows[i]}
          accent={k.accent}
          cap={k.cap}
          name={k.name}
          scope={k.scope}
          revoked={k.revoked}
        />
      ))}

      {spec.keys.map((k, i) => {
        const y = rows[i]
        if (k.revoked) {
          // Severed delegation: a short dim stub ending in an ✗.
          const cutX = accRight + (KEY_X - accRight) * 0.42
          const cutY = 160 + (y - 160) * 0.42
          return (
            <g key={`ka${i}`}>
              <path
                d={`M${accRight} 160L${cutX} ${cutY}`}
                stroke="var(--line-strong)"
                strokeWidth="2"
                strokeDasharray="3 3"
                fill="none"
                opacity="0.5"
              />
              <Cross cx={cutX} cy={cutY} />
              <Label x={cutX - 22} y={cutY - 14} size={8} tracking={0.18} opacity={0.5}>
                REVOKED
              </Label>
            </g>
          )
        }
        const d =
          y === 160
            ? `M${accRight} 160H${KEY_X}`
            : `M${accRight} 160C${accRight + 70} 160 ${KEY_X - 58} ${y} ${KEY_X} ${y}`
        return <Flow key={`ka${i}`} d={d} accent={k.accent} />
      })}
    </>
  )
}

// ── link ────────────────────────────────────────────────────────────────────
// Many credentials converge into one account identity; a recovery credential is
// a dormant standby path.
const CRED_X = 24
const CRED_W = 184
const CRED_H = 54
function CredCard({
  midY,
  name,
  detail,
  recovery = false,
}: {
  midY: number
  name: string
  detail: string
  recovery?: boolean
}) {
  const top = midY - CRED_H / 2
  const px = CRED_X + 16
  return (
    <g opacity={recovery ? 0.75 : 1}>
      <rect
        x={CRED_X}
        y={top}
        width={CRED_W}
        height={CRED_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
        strokeDasharray={recovery ? '4 4' : undefined}
      />
      <Label x={px} y={top + 22} size={10.5} tracking={0.14} opacity={0.9}>
        {name}
      </Label>
      <Label x={px} y={top + 40} size={8} tracking={0.16} opacity={0.38}>
        {detail}
      </Label>
    </g>
  )
}

const LINK_ACC_X = 336
const LINK_ACC_W = 160
function LinkShape({ spec }: { spec: LinkSpec }) {
  const rows = rowCenters(spec.credentials.length)
  const credRight = CRED_X + CRED_W
  const accTop = 122
  return (
    <>
      {/* Account: many credentials, one identity. */}
      <rect
        x={LINK_ACC_X}
        y={accTop}
        width={LINK_ACC_W}
        height="76"
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={LINK_ACC_X + 18} y={accTop + 20} width="20" height="3" fill={color(spec.account)} />
      <Label x={LINK_ACC_X + 18} y={accTop + 44} size={11} tracking={0.14} opacity={0.9}>
        {spec.accountLabel}
      </Label>
      <Label x={LINK_ACC_X + 18} y={accTop + 58} size={8} tracking={0.16} opacity={0.38}>
        {spec.accountSub}
      </Label>

      {spec.credentials.map((c, i) => (
        <CredCard
          key={`c${i}`}
          midY={rows[i]}
          name={c.name}
          detail={c.detail}
          recovery={c.recovery}
        />
      ))}

      {spec.credentials.map((c, i) => {
        const y = rows[i]
        const d =
          y === 160
            ? `M${credRight} 160H${LINK_ACC_X}`
            : `M${credRight} ${y}C${credRight + 58} ${y} ${LINK_ACC_X - 62} 160 ${LINK_ACC_X} 160`
        if (c.recovery) {
          return (
            <path
              key={`ca${i}`}
              d={d}
              stroke="var(--line-strong)"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
              opacity="0.5"
            />
          )
        }
        return <Flow key={`ca${i}`} d={d} accent={c.accent} />
      })}
    </>
  )
}

// ── forward ─────────────────────────────────────────────────────────────────
// Deposits land on per-customer virtual addresses (left) and auto-forward into
// one wallet (right). The inbound stubs + convergence read as "no sweep".
const FWD_SRC_X = 96
const FWD_SRC_W = 172
const FWD_SRC_H = 54
const FWD_DEST_X = 340
const FWD_DEST_W = 156
function ForwardShape({ spec }: { spec: ForwardSpec }) {
  const rows = rowCenters(spec.sources.length)
  const srcRight = FWD_SRC_X + FWD_SRC_W
  const destTop = 120
  return (
    <>
      {/* Destination wallet. */}
      <rect
        x={FWD_DEST_X}
        y={destTop}
        width={FWD_DEST_W}
        height="80"
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={FWD_DEST_X + 18} y={destTop + 20} width="20" height="3" fill={color(spec.dest)} />
      <Label x={FWD_DEST_X + 18} y={destTop + 44} size={10.5} tracking={0.13} opacity={0.9}>
        {spec.destLabel}
      </Label>
      <Label x={FWD_DEST_X + 18} y={destTop + 64} size={8} tracking={0.14} opacity={0.38}>
        {spec.destSub}
      </Label>

      {/* Per-customer virtual addresses. */}
      {spec.sources.map((s, i) => {
        const y = rows[i]
        const top = y - FWD_SRC_H / 2
        const px = FWD_SRC_X + 14
        return (
          <g key={`s${i}`}>
            <rect
              x={FWD_SRC_X}
              y={top}
              width={FWD_SRC_W}
              height={FWD_SRC_H}
              rx="2"
              fill="var(--surface-block)"
              stroke="var(--line-strong)"
            />
            <Label x={px} y={top + 22} size={9.5} tracking={0.12} opacity={0.9}>
              {s.label}
            </Label>
            <Label x={px} y={top + 40} size={8} tracking={0.14} opacity={0.4}>
              {s.detail}
            </Label>
          </g>
        )
      })}

      {/* Inbound deposits landing on each address. */}
      {spec.sources.map((s, i) => (
        <Flow key={`in${i}`} d={`M20 ${rows[i]}H${FWD_SRC_X}`} accent={s.accent} />
      ))}

      {/* Auto-forward into the one wallet. */}
      {spec.sources.map((s, i) => {
        const y = rows[i]
        const d =
          y === 160
            ? `M${srcRight} 160H${FWD_DEST_X}`
            : `M${srcRight} ${y}C${srcRight + 50} ${y} ${FWD_DEST_X - 58} 160 ${FWD_DEST_X} 160`
        return <Flow key={`fw${i}`} d={d} accent={s.accent} />
      })}
    </>
  )
}

// ── lanes ───────────────────────────────────────────────────────────────────
// Independent transactions run concurrently. Each tx (left) touches disjoint
// state, so it rides its own straight lane — parallel, never queued — and all
// lanes land together as packed slots in one block (right). Straight, aligned
// tracks are the signal: side-by-side, not single-file.
const LANE_TX_X = 24
const LANE_TX_W = 188
const LANE_TX_H = 54
const LANE_BLK_X = 372
const LANE_BLK_W = 124
const LANE_BLK_TOP = 64
const LANE_BLK_H = 192
function LanesShape({ spec }: { spec: LanesSpec }) {
  const rows = rowCenters(spec.txs.length)
  const txRight = LANE_TX_X + LANE_TX_W
  const blkBottom = LANE_BLK_TOP + LANE_BLK_H
  const blkCx = LANE_BLK_X + LANE_BLK_W / 2
  return (
    <>
      {/* Independent transactions, each touching disjoint state. */}
      {spec.txs.map((t, i) => {
        const y = rows[i]
        const top = y - LANE_TX_H / 2
        const px = LANE_TX_X + 16
        return (
          <g key={`t${i}`}>
            <rect
              x={LANE_TX_X}
              y={top}
              width={LANE_TX_W}
              height={LANE_TX_H}
              rx="2"
              fill="var(--surface-block)"
              stroke="var(--line-strong)"
            />
            <Label x={px} y={top + 22} size={10.5} tracking={0.13} opacity={0.9}>
              {t.label}
            </Label>
            <Label x={px} y={top + 40} size={8} tracking={0.14} opacity={0.4}>
              {t.detail}
            </Label>
          </g>
        )
      })}

      {/* The block: every lane executes at once and lands here together. */}
      <Label x={blkCx} y={LANE_BLK_TOP - 12} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        {spec.blockLabel}
      </Label>
      <rect
        x={LANE_BLK_X}
        y={LANE_BLK_TOP}
        width={LANE_BLK_W}
        height={LANE_BLK_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      {spec.txs.map((t, i) => {
        const y = rows[i]
        return (
          <g key={`sl${i}`}>
            <rect
              x={LANE_BLK_X + 14}
              y={y - 14}
              width={LANE_BLK_W - 28}
              height="28"
              fill={color(t.accent)}
              opacity="0.2"
            />
            <Label x={LANE_BLK_X + 24} y={y + 4} size={8.5} tracking={0.12} opacity={0.65}>
              {t.label}
            </Label>
          </g>
        )
      })}
      <Label x={blkCx} y={blkBottom + 18} size={8} tracking={0.16} opacity={0.45} anchor="middle">
        {spec.blockSub}
      </Label>

      {/* Parallel lanes: straight + aligned = concurrent, non-blocking. */}
      {spec.txs.map((t, i) => (
        <Flow key={`ln${i}`} d={`M${txRight} ${rows[i]}H${LANE_BLK_X}`} accent={t.accent} />
      ))}
    </>
  )
}

// ── nonces ──────────────────────────────────────────────────────────────────
// One account, many transactions in flight at once. Each tx carries a nonce. A
// `pending` tx (the lowest nonce here) is still in flight, yet the higher
// nonces confirm anyway — on a sequential chain they'd be stuck behind it. That
// contrast is the point: no head-of-line blocking.
const NONCE_X = 296
const NONCE_W = 200
const NONCE_H = 58
function NoncesShape({ spec }: { spec: NoncesSpec }) {
  const rows = rowCenters(spec.txs.length)
  const accX = 24
  const accW = 132
  const accTop = 128
  const accRight = accX + accW
  return (
    <>
      {/* The account: one signer, many txs in flight. */}
      <rect
        x={accX}
        y={accTop}
        width={accW}
        height="64"
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={accX + 18} y={accTop + 18} width="20" height="3" fill={color(spec.account)} />
      <Label x={accX + 18} y={accTop + 40} size={10.5} tracking={0.14} opacity={0.9}>
        {spec.accountLabel}
      </Label>
      <Label x={accX + 18} y={accTop + 54} size={8} tracking={0.16} opacity={0.38}>
        {spec.accountSub}
      </Label>

      {/* Transactions, each with a nonce + a confirmed/pending status dot. */}
      {spec.txs.map((t, i) => {
        const y = rows[i]
        const top = y - NONCE_H / 2
        const px = NONCE_X + 16
        const dotX = NONCE_X + NONCE_W - 18
        return (
          <g key={`tx${i}`} opacity={t.pending ? 0.5 : 1}>
            <rect
              x={NONCE_X}
              y={top}
              width={NONCE_W}
              height={NONCE_H}
              rx="2"
              fill="var(--surface-block)"
              stroke="var(--line-strong)"
              strokeDasharray={t.pending ? '4 4' : undefined}
            />
            <Label x={px} y={top + 24} size={10.5} tracking={0.13} opacity={0.9}>
              {t.label}
            </Label>
            <Label x={px} y={top + 42} size={8} tracking={0.14} opacity={0.42}>
              {t.detail}
            </Label>
            {t.pending ? (
              <circle
                cx={dotX}
                cy={y}
                r="4"
                fill="none"
                stroke={color(t.accent)}
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            ) : (
              <circle cx={dotX} cy={y} r="4" fill={color(t.accent)} />
            )}
          </g>
        )
      })}

      {/* Concurrent paths; the pending one is dormant but never blocks the rest. */}
      {spec.txs.map((t, i) => {
        const y = rows[i]
        const d =
          y === 160
            ? `M${accRight} 160H${NONCE_X}`
            : `M${accRight} 160C${accRight + 70} 160 ${NONCE_X - 58} ${y} ${NONCE_X} ${y}`
        if (t.pending) {
          return (
            <path
              key={`a${i}`}
              d={d}
              stroke="var(--line-strong)"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
              opacity="0.5"
            />
          )
        }
        return <Flow key={`a${i}`} d={d} accent={t.accent} />
      })}
    </>
  )
}

// ── blockspace ──────────────────────────────────────────────────────────────
// Payment lanes: every block is split into dedicated payment blockspace and
// general blockspace. Payment txs flow into the reserved lane with sub-cent
// fees; non-payment traffic lands in general blockspace at a higher fee.
const BS_CARD_X = 24
const BS_CARD_W = 160
const BS_CARD_H = 44
const BS_BLK_X = 312
const BS_BLK_W = 184
const BS_BLK_TOP = 52
const BS_BLK_H = 252
const BS_DIV_Y = BS_BLK_TOP + 142 // payment lane is visibly dedicated.
function bsCard(
  t: { accent: number; label: string; detail: string },
  y: number,
  faded: boolean,
  key: string,
) {
  const top = y - BS_CARD_H / 2
  const px = BS_CARD_X + 14
  return (
    <g key={key} opacity={faded ? 0.5 : 1}>
      <rect
        x={BS_CARD_X}
        y={top}
        width={BS_CARD_W}
        height={BS_CARD_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
        strokeDasharray={faded ? '4 4' : undefined}
      />
      <Label x={px} y={top + 19} size={9.5} tracking={0.13} opacity={0.9}>
        {t.label}
      </Label>
      <Label x={px} y={top + 34} size={7.5} tracking={0.14} opacity={0.4}>
        {t.detail}
      </Label>
    </g>
  )
}
function BlockspaceSlot({
  x,
  y,
  width,
  tx,
}: {
  x: number
  y: number
  width: number
  tx: BlockspaceTx
}) {
  return (
    <g>
      <rect x={x} y={y - 15} width={width} height="30" fill={color(tx.accent)} opacity="0.22" />
      <Label x={x + 10} y={y - 1} size={8.2} tracking={0.1} opacity={0.72}>
        {tx.label}
      </Label>
      <Label x={x + 10} y={y + 11} size={6.6} tracking={0.12} opacity={0.5}>
        {tx.detail}
      </Label>
    </g>
  )
}
function BlockspaceShape({ spec }: { spec: BlockspaceSpec }) {
  const cardRight = BS_CARD_X + BS_CARD_W
  const blkCx = BS_BLK_X + BS_BLK_W / 2
  const slotX = BS_BLK_X + 16
  const slotW = BS_BLK_W - 32
  const payTop = 120
  const payGap = 48
  const payRows = spec.payments.map((_, i) => payTop + i * payGap)
  const generalY = BS_DIV_Y + 60
  const bars = Array.from({ length: 4 }, (_, i) => BS_DIV_Y + 84 + i * 7)
  return (
    <>
      <Label x={blkCx} y={BS_BLK_TOP - 12} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        ONE BLOCK
      </Label>
      <rect
        x={BS_BLK_X}
        y={BS_BLK_TOP}
        width={BS_BLK_W}
        height={BS_BLK_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      {/* The tinted payment band makes the dedicated reservation visible. */}
      <rect
        x={BS_BLK_X}
        y={BS_BLK_TOP}
        width={BS_BLK_W}
        height={BS_DIV_Y - BS_BLK_TOP}
        fill="var(--foreground)"
        opacity="0.025"
      />
      <line
        x1={BS_BLK_X}
        y1={BS_DIV_Y}
        x2={BS_BLK_X + BS_BLK_W}
        y2={BS_DIV_Y}
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      <Label x={slotX} y={BS_BLK_TOP + 24} size={7.2} tracking={0.1} opacity={0.62}>
        {spec.paymentLaneLabel}
      </Label>
      {spec.payments.map((t, i) => (
        <BlockspaceSlot key={`ps${i}`} x={slotX} y={payRows[i]} width={slotW} tx={t} />
      ))}

      <Label x={slotX} y={BS_DIV_Y + 28} size={7.4} tracking={0.14} opacity={0.5}>
        {spec.generalLabel}
      </Label>
      <BlockspaceSlot x={slotX} y={generalY} width={slotW} tx={spec.general} />
      {bars.map((by, i) => (
        <rect
          key={`bar${i}`}
          x={slotX}
          y={by}
          width={slotW}
          height="4"
          fill="var(--foreground)"
          opacity={0.1 + (i % 2) * 0.05}
        />
      ))}

      {/* Inbound examples land in separate parts of the same block. */}
      {spec.payments.map((t, i) => bsCard(t, payRows[i], false, `pc${i}`))}
      {bsCard(spec.general, generalY, true, 'general')}

      {spec.payments.map((t, i) => (
        <Flow key={`pf${i}`} d={`M${cardRight} ${payRows[i]}H${BS_BLK_X}`} accent={t.accent} />
      ))}
      <Flow d={`M${cardRight} ${generalY}H${BS_BLK_X}`} accent={spec.general.accent} faded />

      {/* Tempo draws the line: the protocol enforces the reservation, so the
          mark sits on the divider between the lanes. */}
      <Mark cx={blkCx} cy={BS_DIV_Y} />
    </>
  )
}

// ── feeamm ──────────────────────────────────────────────────────────────────
// Fees in any stablecoin: the user selects a fee token, the Fee AMM converts it,
// and the validator receives the token they accept.
const FA_USER_X = 32
const FA_USER_W = 136
const FA_CARD_TOP = 108
const FA_CARD_H = 104
const FA_AMM_X = 208
const FA_AMM_W = 128
const FA_AMM_TOP = 64
const FA_AMM_H = 192
const FA_MID_Y = 160
const FA_VAL_X = 384
const FA_VAL_W = 110
function FeeTokenBox({
  x,
  y,
  width,
  height,
  token,
}: {
  x: number
  y: number
  width: number
  height: number
  token: FeeAmmToken
}) {
  const labelX = x + 12
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={labelX} y={y + 9} width="20" height="3" fill={color(token.accent)} />
      <Label x={labelX} y={y + 27} size={8.6} tracking={0.08} opacity={0.92}>
        {token.symbol}
      </Label>
    </g>
  )
}
function FeeAmmShape({ spec }: { spec: FeeAmmSpec }) {
  const userRight = FA_USER_X + FA_USER_W
  const ammCx = FA_AMM_X + FA_AMM_W / 2
  const ammRight = FA_AMM_X + FA_AMM_W
  const selectedY = FA_AMM_TOP + 36
  const receivedY = FA_AMM_TOP + 120
  const valTop = FA_CARD_TOP
  const cardLabelX = FA_USER_X + 18
  const valLabelX = FA_VAL_X + 18
  const ammTokenX = ammCx - 43
  const ammTokenW = 86
  const ammTokenH = 38
  return (
    <>
      <rect
        x={FA_USER_X}
        y={FA_CARD_TOP}
        width={FA_USER_W}
        height={FA_CARD_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <Label x={cardLabelX} y={FA_CARD_TOP + 28} size={10} tracking={0.12} opacity={0.92}>
        {spec.user.label}
      </Label>
      <Label x={cardLabelX} y={FA_CARD_TOP + 46} size={7.2} tracking={0.12} opacity={0.42}>
        {spec.user.detail}
      </Label>
      <FeeTokenBox
        x={FA_USER_X + 18}
        y={FA_CARD_TOP + 60}
        width={100}
        height={34}
        token={spec.selectedToken}
      />

      <rect
        x={FA_AMM_X}
        y={FA_AMM_TOP}
        width={FA_AMM_W}
        height={FA_AMM_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <Label x={FA_AMM_X + 18} y={FA_AMM_TOP + 28} size={10} tracking={0.12} opacity={0.92}>
        {spec.ammLabel}
      </Label>

      <rect
        x={FA_VAL_X}
        y={valTop}
        width={FA_VAL_W}
        height={FA_CARD_H}
        rx="2"
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <Label x={valLabelX} y={valTop + 28} size={10} tracking={0.12} opacity={0.92}>
        {spec.validator.label}
      </Label>
      <Label x={valLabelX} y={valTop + 46} size={7.2} tracking={0.12} opacity={0.42}>
        {spec.validator.detail}
      </Label>

      <Flow d={`M${userRight} ${FA_MID_Y}H${FA_AMM_X}`} accent={spec.selectedToken.accent} />
      <Flow
        d={`M${ammCx} ${selectedY + ammTokenH}V${FA_MID_Y - 12}`}
        accent={spec.selectedToken.accent}
      />
      <Flow d={`M${ammCx} ${FA_MID_Y + 12}V${receivedY}`} accent={spec.receivedToken.accent} />
      <Flow d={`M${ammRight} ${FA_MID_Y}H${FA_VAL_X}`} accent={spec.receivedToken.accent} />

      <FeeTokenBox
        x={ammTokenX}
        y={selectedY}
        width={ammTokenW}
        height={ammTokenH}
        token={spec.selectedToken}
      />
      <Mark cx={ammCx} cy={FA_MID_Y} />
      <FeeTokenBox
        x={ammTokenX}
        y={receivedY}
        width={ammTokenW}
        height={ammTokenH}
        token={spec.receivedToken}
      />

      <FeeTokenBox
        x={FA_VAL_X + 18}
        y={valTop + 60}
        width={74}
        height={34}
        token={spec.receivedToken}
      />
    </>
  )
}

// ── sponsor ──────────────────────────────────────────────────────────────────
// Fee sponsorship. The app signs the user's transaction as fee payer, the user
// sends it, and Tempo executes the action while debiting the fee payer balance.
const SP_PARTY_X = 36
const SP_PARTY_W = 148
const SP_PARTY_H = 54
const SP_APP_CY = 92
const SP_USER_CY = 218
const SP_TX_X = 266
const SP_TX_W = 140
const SP_TX_TOP = 74
const SP_TX_H = 172
const SP_HUB_X = 464
const SP_HUB_Y = 160
function SponsorParty({
  cy,
  accent,
  label,
  detail,
}: {
  cy: number
  accent: number
  label: string
  detail: string
}) {
  const top = cy - SP_PARTY_H / 2
  const px = SP_PARTY_X + 16
  return (
    <g>
      <rect
        x={SP_PARTY_X}
        y={top}
        width={SP_PARTY_W}
        height={SP_PARTY_H}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={px} y={top + 15} width="18" height="3" fill={color(accent)} />
      <Label x={px} y={top + 33} size={10} tracking={0.12} opacity={0.9}>
        {label}
      </Label>
      <Label x={px} y={top + 46} size={7.5} tracking={0.13} opacity={0.4}>
        {detail}
      </Label>
    </g>
  )
}
function SponsorShape({ spec }: { spec: SponsorSpec }) {
  const slotX = SP_TX_X + 14
  const slotW = SP_TX_W - 28
  const actionCy = 130
  const feeCy = 184
  const txRight = SP_TX_X + SP_TX_W
  const txCx = SP_TX_X + SP_TX_W / 2
  const partyCx = SP_PARTY_X + SP_PARTY_W / 2
  const partyRight = SP_PARTY_X + SP_PARTY_W
  return (
    <>
      <SponsorParty
        cy={SP_APP_CY}
        accent={spec.sponsor.accent}
        label={spec.sponsor.label}
        detail={spec.sponsor.detail}
      />
      <SponsorParty
        cy={SP_USER_CY}
        accent={spec.user.accent}
        label={spec.user.label}
        detail={spec.user.detail}
      />

      {/* One transaction executes the action and charges the fee payer. */}
      <Label x={txCx} y={SP_TX_TOP - 12} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        {spec.txLabel}
      </Label>
      <rect
        x={SP_TX_X}
        y={SP_TX_TOP}
        width={SP_TX_W}
        height={SP_TX_H}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />

      <rect
        x={slotX}
        y={actionCy - 18}
        width={slotW}
        height="38"
        fill={color(spec.user.accent)}
        opacity="0.2"
      />
      <Label
        x={slotX + slotW / 2}
        y={actionCy - 1}
        size={8.2}
        tracking={0.14}
        opacity={0.74}
        anchor="middle"
      >
        {spec.actionLabel}
      </Label>
      <Label
        x={slotX + slotW / 2}
        y={actionCy + 12}
        size={6.2}
        tracking={0.12}
        opacity={0.5}
        anchor="middle"
      >
        ACTION EXECUTES
      </Label>

      <rect
        x={slotX}
        y={feeCy - 18}
        width={slotW}
        height="38"
        fill={color(spec.sponsor.accent)}
        opacity="0.2"
      />
      <Label
        x={slotX + slotW / 2}
        y={feeCy - 1}
        size={8.2}
        tracking={0.14}
        opacity={0.74}
        anchor="middle"
      >
        {spec.gasLabel}
      </Label>
      <Label
        x={slotX + slotW / 2}
        y={feeCy + 12}
        size={6.2}
        tracking={0.12}
        opacity={0.5}
        anchor="middle"
      >
        COVERS TX FEE
      </Label>

      <Flow
        d={`M${partyCx} ${SP_APP_CY + SP_PARTY_H / 2}V${SP_USER_CY - SP_PARTY_H / 2}`}
        accent={spec.sponsor.accent}
      />
      <Label x={partyCx + 26} y={158} size={6.8} tracking={0.13} opacity={0.52}>
        APP SIGNS TX
      </Label>

      <Flow
        d={`M${partyRight} ${SP_USER_CY}C220 ${SP_USER_CY} 224 ${actionCy} ${SP_TX_X} ${actionCy}`}
        accent={spec.user.accent}
      />
      <Label x={210} y={232} size={7} tracking={0.14} opacity={0.52}>
        USER SENDS
      </Label>

      {/* The assembled transaction executes on Tempo. */}
      <Flow d={`M${txRight} ${SP_HUB_Y}H${SP_HUB_X - 12}`} accent={spec.sponsor.accent} />
      <Mark cx={SP_HUB_X} cy={SP_HUB_Y} />
      <Label x={SP_HUB_X} y={SP_HUB_Y + 30} size={8} tracking={0.18} opacity={0.6} anchor="middle">
        {spec.hubLabel}
      </Label>
      <Label
        x={txCx}
        y={SP_TX_TOP + SP_TX_H + 30}
        size={7.5}
        tracking={0.14}
        opacity={0.45}
        anchor="middle"
      >
        {spec.caption}
      </Label>
    </>
  )
}

// ── batch ────────────────────────────────────────────────────────────────────
// Batch & schedule, told abstractly. A stack of payouts (left) bundle into one
// batch sealed by a single signature — atomic, all-or-nothing. That batch is
// scheduled: it executes on Tempo (the mark) only inside a time window (the
// shaded band on the timeline, right), bounded by an open and a close.
const BT_BOX_X = 40
const BT_BOX_W = 176
const BT_BOX_TOP = 64
const BT_BOX_H = 192
const BT_AXIS_Y = 160
const BT_WIN_OPEN = 322
const BT_WIN_CLOSE = 446
const BT_HUB_X = 384
function BatchShape({ spec }: { spec: BatchSpec }) {
  const boxCx = BT_BOX_X + BT_BOX_W / 2
  const boxRight = BT_BOX_X + BT_BOX_W
  const slotX = BT_BOX_X + 14
  const slotW = BT_BOX_W - 28
  const slotH = 30
  const slotGap = 12
  const n = spec.calls.length
  const stackH = n * slotH + (n - 1) * slotGap
  const stackTop = BT_BOX_TOP + 26
  const sealY = BT_BOX_TOP + BT_BOX_H - 22
  const winTop = 100
  const winBot = 220
  return (
    <>
      {/* The batch: a stack of calls under one signature. */}
      <Label x={boxCx} y={BT_BOX_TOP - 12} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        {spec.batchLabel}
      </Label>
      <rect
        x={BT_BOX_X}
        y={BT_BOX_TOP}
        width={BT_BOX_W}
        height={BT_BOX_H}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      {spec.calls.map((c, i) => {
        const top = stackTop + i * (slotH + slotGap)
        return (
          <g key={`c${i}`}>
            <rect
              x={slotX}
              y={top}
              width={slotW}
              height={slotH}
              fill={color(c.accent)}
              opacity="0.2"
            />
            <Label x={slotX + 12} y={top + slotH / 2 + 4} size={9} tracking={0.13} opacity={0.7}>
              {c.label}
            </Label>
          </g>
        )
      })}
      <line
        x1={slotX}
        y1={stackTop + stackH + 16}
        x2={slotX + slotW}
        y2={stackTop + stackH + 16}
        stroke="var(--line-strong)"
        strokeWidth="1"
        opacity="0.5"
      />
      <Label x={boxCx} y={sealY} size={7.5} tracking={0.14} opacity={0.5} anchor="middle">
        {spec.sealLabel}
      </Label>

      {/* The schedule: a timeline with the execution window. */}
      <line
        x1={BT_BOX_X + BT_BOX_W + 32}
        y1={BT_AXIS_Y}
        x2={500}
        y2={BT_AXIS_Y}
        stroke="var(--line-strong)"
        strokeWidth="1"
        opacity="0.3"
      />
      <rect
        x={BT_WIN_OPEN}
        y={winTop}
        width={BT_WIN_CLOSE - BT_WIN_OPEN}
        height={winBot - winTop}
        fill="var(--foreground)"
        opacity="0.05"
      />
      <line
        x1={BT_WIN_OPEN}
        y1={winTop}
        x2={BT_WIN_OPEN}
        y2={winBot}
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.7"
      />
      <line
        x1={BT_WIN_CLOSE}
        y1={winTop}
        x2={BT_WIN_CLOSE}
        y2={winBot}
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.7"
      />
      <Label
        x={BT_WIN_OPEN}
        y={winTop - 10}
        size={7.5}
        tracking={0.16}
        opacity={0.5}
        anchor="middle"
      >
        {spec.openLabel}
      </Label>
      <Label
        x={BT_WIN_CLOSE}
        y={winTop - 10}
        size={7.5}
        tracking={0.16}
        opacity={0.5}
        anchor="middle"
      >
        {spec.closeLabel}
      </Label>
      <Label x={BT_HUB_X} y={winBot + 22} size={8} tracking={0.18} opacity={0.6} anchor="middle">
        {spec.hubLabel}
      </Label>

      {/* The sealed batch fires inside the window. */}
      <Flow d={`M${boxRight} ${BT_AXIS_Y}H${BT_HUB_X - 12}`} accent={spec.calls[0].accent} />
      <Mark cx={BT_HUB_X} cy={BT_AXIS_Y} />
    </>
  )
}

// ── memo ─────────────────────────────────────────────────────────────────────
// Transfer memos, told abstractly. A payment (left) carries a memo reference.
// The reference is recorded on-chain with the money and surfaces in a low-
// fidelity explorer view of the transaction (right): most fields are skeleton
// bars, but the MEMO field is real and highlighted in the memo accent — the
// reference anyone can reconcile against.
const ME_PAY_X = 40
const ME_PAY_W = 170
const ME_PAY_TOP = 100
const ME_PAY_H = 120
const ME_EXP_X = 300
const ME_EXP_W = 180
const ME_EXP_TOP = 72
const ME_EXP_H = 176
function MemoShape({ spec }: { spec: MemoSpec }) {
  const payCx = ME_PAY_X + ME_PAY_W / 2
  const payRight = ME_PAY_X + ME_PAY_W
  const payPx = ME_PAY_X + 16
  const payInnerW = ME_PAY_W - 32
  const expCx = ME_EXP_X + ME_EXP_W / 2
  const expPx = ME_EXP_X + 16
  const expRight = ME_EXP_X + ME_EXP_W - 16
  const valX = ME_EXP_X + 74
  const n = spec.fields.length
  const rowCy = (i: number) => ME_EXP_TOP + (ME_EXP_H * (i + 0.5)) / n
  return (
    <>
      {/* The payment, carrying its memo reference. */}
      <Label x={payCx} y={ME_PAY_TOP - 12} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        {spec.paymentLabel}
      </Label>
      <rect
        x={ME_PAY_X}
        y={ME_PAY_TOP}
        width={ME_PAY_W}
        height={ME_PAY_H}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={payPx} y={ME_PAY_TOP + 20} width="20" height="3" fill={color(spec.amountAccent)} />
      <Label x={payPx} y={ME_PAY_TOP + 44} size={11} tracking={0.1} opacity={0.92}>
        {spec.amount}
      </Label>
      <line
        x1={payPx}
        y1={ME_PAY_TOP + 56}
        x2={payPx + payInnerW}
        y2={ME_PAY_TOP + 56}
        stroke="var(--line-strong)"
        strokeWidth="1"
        opacity="0.45"
      />
      <Label x={payPx} y={ME_PAY_TOP + 74} size={7.5} tracking={0.16} opacity={0.45}>
        {spec.memoLabel}
      </Label>
      <rect
        x={payPx}
        y={ME_PAY_TOP + 82}
        width={payInnerW}
        height="28"
        fill={color(spec.memoAccent)}
        opacity="0.22"
      />
      <Label x={payPx + 12} y={ME_PAY_TOP + 100} size={10} tracking={0.12} opacity={0.8}>
        {spec.memoValue}
      </Label>

      {/* The reference is recorded on-chain with the money. */}
      <Flow d={`M${payRight} 160H${ME_EXP_X}`} accent={spec.memoAccent} />

      {/* Low-fidelity explorer view of the on-chain transaction. */}
      <Label x={expCx} y={ME_EXP_TOP - 12} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        {spec.explorerLabel}
      </Label>
      <rect
        x={ME_EXP_X}
        y={ME_EXP_TOP}
        width={ME_EXP_W}
        height={ME_EXP_H}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      {spec.fields.slice(1).map((_, i) => {
        const y = ME_EXP_TOP + (ME_EXP_H * (i + 1)) / n
        return (
          <line
            key={`sep${i}`}
            x1={expPx}
            y1={y}
            x2={expRight}
            y2={y}
            stroke="var(--line-strong)"
            strokeWidth="1"
            opacity="0.18"
          />
        )
      })}
      {spec.fields.map((f, i) => {
        const cy = rowCy(i)
        return (
          <g key={`f${i}`}>
            {f.highlight && (
              <rect
                x={ME_EXP_X}
                y={cy - 17}
                width={ME_EXP_W}
                height="34"
                fill={color(spec.memoAccent)}
                opacity="0.16"
              />
            )}
            <Label x={expPx} y={cy + 3.5} size={7} tracking={0.14} opacity={0.4}>
              {f.label}
            </Label>
            {f.value !== undefined ? (
              <Label
                x={valX}
                y={cy + 4}
                size={9.5}
                tracking={0.12}
                opacity={f.highlight ? 0.92 : 0.85}
                fill={f.highlight ? color(spec.memoAccent) : 'var(--foreground)'}
              >
                {f.value}
              </Label>
            ) : (
              <rect
                x={valX}
                y={cy - 3}
                width={f.barW ?? 80}
                height="6"
                fill="var(--foreground)"
                opacity="0.15"
              />
            )}
          </g>
        )
      })}
    </>
  )
}

// ── dex ──────────────────────────────────────────────────────────────────────
// Enshrined stablecoin DEX. A token flows in (left), matches through a real
// order book (center) — asks stacked above the spread, bids below, the Tempo
// mark sitting on the spread as the matching engine — and taps shared
// protocol liquidity. No pool contract to deploy.
const DX_IN_X = 36
const DX_OUT_X = 338
const DX_CARD_W = 146
const DX_CARD_H = 54
const DX_BOOK_X = 206
const DX_BOOK_W = 108
const DX_MID_Y = 160
const DX_ASK_FILL = 'var(--negative)'
const DX_BID_FILL = 'var(--indicator-green)'
const DX_RESOLVER_FILL = 'var(--surface-onyx)'
function DexCard({
  x,
  accent,
  label,
  detail,
}: {
  x: number
  accent: number
  label: string
  detail: string
}) {
  const top = DX_MID_Y - DX_CARD_H / 2
  const px = x + 16
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={DX_CARD_W}
        height={DX_CARD_H}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />
      <rect x={px} y={top + 14} width="18" height="3" fill={color(accent)} />
      <Label x={px} y={top + 32} size={11} tracking={0.1} opacity={0.92}>
        {label}
      </Label>
      {detail && (
        <Label x={px} y={top + 45} size={7.5} tracking={0.13} opacity={0.42}>
          {detail}
        </Label>
      )}
    </g>
  )
}
function DexShape({ spec }: { spec: DexSpec }) {
  const bookCx = DX_BOOK_X + DX_BOOK_W / 2
  const barX = DX_BOOK_X + 16
  const barMaxW = DX_BOOK_W - 32
  const inRight = DX_IN_X + DX_CARD_W
  const outLeft = DX_OUT_X
  const resolverTop = DX_MID_Y - 17
  const resolverH = 34
  return (
    <>
      {/* The token you bring resolves through pathUSD, then routes to the output stablecoin. */}
      <DexCard
        x={DX_IN_X}
        accent={spec.input.accent}
        label={spec.input.label}
        detail={spec.input.detail}
      />
      <DexCard
        x={DX_OUT_X}
        accent={spec.output.accent}
        label={spec.output.label}
        detail={spec.output.detail}
      />

      {/* Trade routes in through the book, resolves to the quote token, then routes out. */}
      <Flow d={`M${inRight} ${DX_MID_Y}H${DX_BOOK_X}`} accent={spec.input.accent} />
      <Flow d={`M${DX_BOOK_X + DX_BOOK_W} ${DX_MID_Y}H${outLeft}`} accent={spec.output.accent} />

      {/* The enshrined order book. */}
      <Label x={bookCx} y={62} size={8} tracking={0.2} opacity={0.5} anchor="middle">
        {spec.bookLabel}
      </Label>
      <rect
        x={DX_BOOK_X}
        y={74}
        width={DX_BOOK_W}
        height={172}
        fill="var(--surface-block)"
        stroke="var(--line-strong)"
      />

      {/* Asks above the spread. */}
      <Label x={barX} y={92} size={6.5} tracking={0.18} opacity={0.4}>
        ASKS
      </Label>
      {spec.asks.map((w, i) => (
        <rect
          key={`a${i}`}
          x={barX}
          y={100 + i * 13}
          width={Math.max(8, w * barMaxW)}
          height="6"
          fill={DX_ASK_FILL}
          opacity="0.5"
        />
      ))}

      {/* The spread, where the matching engine sits. */}
      <line
        x1={DX_BOOK_X}
        y1={DX_MID_Y}
        x2={DX_BOOK_X + DX_BOOK_W}
        y2={DX_MID_Y}
        stroke="var(--line-strong)"
        strokeWidth="1"
        opacity="0.35"
        strokeDasharray="3 3"
      />

      {/* Bids below the spread. */}
      {spec.bids.map((w, i) => (
        <rect
          key={`b${i}`}
          x={barX}
          y={180 + i * 13}
          width={Math.max(8, w * barMaxW)}
          height="6"
          fill={DX_BID_FILL}
          opacity="0.5"
        />
      ))}
      <Label x={barX} y={238} size={6.5} tracking={0.18} opacity={0.4}>
        BIDS
      </Label>

      {spec.resolver ? (
        <g>
          <rect
            x={bookCx - 39}
            y={resolverTop}
            width="78"
            height={resolverH}
            fill="var(--surface-card)"
            stroke="var(--line-strong)"
          />
          <rect
            x={bookCx - 27}
            y={resolverTop + 10}
            width="16"
            height="3"
            fill={DX_RESOLVER_FILL}
          />
          <Label x={bookCx - 27} y={resolverTop + 25} size={9.5} tracking={0.08} opacity={0.92}>
            {spec.resolver.label}
          </Label>
        </g>
      ) : (
        <Mark cx={bookCx} cy={DX_MID_Y} />
      )}
    </>
  )
}

export default function FeatureDiagram({
  spec = DEFAULT_SPEC,
  compact = false,
  hideSmallCaptions = false,
  containerClassName,
}: {
  spec?: FeatureDiagramSpec
  // Tile sizing for the playground grid; default fills the feature-page panel.
  compact?: boolean
  hideSmallCaptions?: boolean
  containerClassName?: string
}) {
  return (
    <div
      className={`relative flex h-full items-center justify-center overflow-hidden bg-surface-shell ${
        compact ? 'p-3' : (containerClassName ?? 'p-6 lg:min-h-[520px] lg:p-10')
      }`}
    >
      <svg
        aria-hidden
        viewBox="0 0 520 320"
        className={
          compact
            ? 'block h-auto w-full'
            : `block h-auto w-full max-w-[560px] lg:h-full lg:min-h-[260px] ${hideSmallCaptions ? 'feature-diagram-hide-small-captions' : ''}`
        }
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="feature-diagram-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {spec.kind === 'gate' ? (
          <GateShape spec={spec} />
        ) : spec.kind === 'keys' ? (
          <KeysShape spec={spec} />
        ) : spec.kind === 'link' ? (
          <LinkShape spec={spec} />
        ) : spec.kind === 'forward' ? (
          <ForwardShape spec={spec} />
        ) : spec.kind === 'lanes' ? (
          <LanesShape spec={spec} />
        ) : spec.kind === 'nonces' ? (
          <NoncesShape spec={spec} />
        ) : spec.kind === 'blockspace' ? (
          <BlockspaceShape spec={spec} />
        ) : spec.kind === 'feeamm' ? (
          <FeeAmmShape spec={spec} />
        ) : spec.kind === 'sponsor' ? (
          <SponsorShape spec={spec} />
        ) : spec.kind === 'batch' ? (
          <BatchShape spec={spec} />
        ) : spec.kind === 'memo' ? (
          <MemoShape spec={spec} />
        ) : spec.kind === 'dex' ? (
          <DexShape spec={spec} />
        ) : (
          <HubShape spec={spec} />
        )}
      </svg>
    </div>
  )
}

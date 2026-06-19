import { clamp01, DOT_ALPHA, GREEN, hash, smoothstep, splat } from './helpers'
import type { DotPattern, LitCell } from './types'

/**
 * Dot patterns for the Libraries & SDKs section. Hovering an SDK row morphs the
 * dot band into that library's pattern; the resting state reuses `buildAmbient`.
 *
 * Each pattern is a pure function of time + grid size returning lit cells. Tune
 * via the `controls` object at the top of each block.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Passkeys · "Passkey scan"
// Concentric fingerprint ridges; a horizontal scan line sweeps top→bottom,
// lighting the ridges green as it passes (biometric auth).
// ═══════════════════════════════════════════════════════════════════════════

const PASSKEY = {
  freq: 0.85, // ridge density
  drift: 1.2, // ridges drift outward at this speed
  squash: 1.9, // horizontal stretch of the ovals
  crest: 0.5, // ridge threshold
  scanSeconds: 3, // time for the scan line to cross the band
  scanBand: 2.4, // scan line thickness (rows)
}

const passkey: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const cx = cols / 2
  const cy = (rows - 1) / 2
  const scanY = ((t / PASSKEY.scanSeconds) % 1) * rows
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dx = (col - cx) / PASSKEY.squash
      const dy = row - cy
      const d = Math.hypot(dx, dy)
      const ridge = Math.cos(d * PASSKEY.freq - t * PASSKEY.drift)
      if (ridge < PASSKEY.crest) continue
      const base = ((ridge - PASSKEY.crest) / (1 - PASSKEY.crest)) * DOT_ALPHA
      const near = clamp01(1 - Math.abs(row - scanY) / PASSKEY.scanBand)
      const color = near > 0.35 ? GREEN : undefined
      cells.push({ col, row, alpha: color ? Math.max(base, near * DOT_ALPHA) : base, color })
    }
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// MPPX · "Request / response"
// Pulsing machine nodes at both edges; white request packets travel right,
// green response packets travel left between them (machine payments over HTTP).
// ═══════════════════════════════════════════════════════════════════════════

const MPPX = {
  packetLen: 3, // packet length (cells)
  gap: 9, // gap between packets
  speed: 12, // travel speed (cells/sec)
  nodeW: 2, // endpoint node width
}

const mppx: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const mid = Math.floor(rows / 2)
  const period = MPPX.packetLen + MPPX.gap
  const lanes = [
    { row: mid - 2, dir: 1, color: undefined as string | undefined },
    { row: mid + 2, dir: -1, color: GREEN },
  ]
  for (const { row, dir, color } of lanes) {
    const phase = (((t * MPPX.speed * dir) % period) + period) % period
    for (let k = -1; k <= Math.ceil(cols / period); k++) {
      const x0 = k * period + phase
      for (let c = 0; c < MPPX.packetLen; c++) {
        splat(cells, x0 + c, row, DOT_ALPHA, cols, rows, color)
      }
    }
  }
  // Endpoint machine nodes at both ends, pulsing on each request.
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 3))
  for (let r = mid - 3; r <= mid + 3; r++) {
    for (let c = 0; c < MPPX.nodeW; c++) {
      cells.push({ col: c, row: r, alpha: pulse * DOT_ALPHA })
      cells.push({ col: cols - 1 - c, row: r, alpha: pulse * DOT_ALPHA })
    }
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// TypeScript SDK · "Order from chaos"
// A field of dots breathes between a scattered cloud and a crisp ordered
// lattice — types bringing structure. At peak order the lattice glows green.
// ═══════════════════════════════════════════════════════════════════════════

const TS = {
  colStep: 3, // lattice column spacing
  rowStep: 2, // lattice row spacing
  scatter: 6, // max displacement in the chaotic state (cells)
  speed: 0.9, // breathing speed
  greenAt: 0.82, // order level (0..1) at which dots turn green
}

const typescript: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const order = smoothstep(0.5 + 0.5 * Math.sin(t * TS.speed)) // 0..1
  for (let row = 1; row < rows; row += TS.rowStep) {
    for (let col = 1; col < cols; col += TS.colStep) {
      const seed = col * 7 + row * 131
      const ang = hash(seed) * Math.PI * 2
      const mag = (0.4 + hash(seed + 1) * 0.6) * TS.scatter * (1 - order)
      const alpha = (0.35 + 0.65 * order) * DOT_ALPHA
      const color = order > TS.greenAt ? GREEN : undefined
      splat(cells, col + Math.cos(ang) * mag, row + Math.sin(ang) * mag, alpha, cols, rows, color)
    }
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Go SDK · "Goroutines"
// Independent token streams flow right at varied speeds (concurrency); a green
// bar periodically sweeps across — a channel select syncing them.
// ═══════════════════════════════════════════════════════════════════════════

const GO = {
  laneGap: 2, // rows between streams
  tokenLen: 2, // token length (cells)
  spacing: 11, // gap between tokens
  baseSpeed: 7, // slowest stream speed
  speedVar: 9, // extra speed range
  syncSeconds: 3.5, // time for the sync bar to cross
}

const go: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  let lane = 0
  for (let row = 0; row < rows; row += GO.laneGap) {
    const speed = GO.baseSpeed + hash(lane + 1) * GO.speedVar
    const phase = (t * speed) % GO.spacing
    for (let k = -1; k <= Math.ceil(cols / GO.spacing); k++) {
      const x0 = k * GO.spacing + phase
      for (let c = 0; c < GO.tokenLen; c++) {
        splat(cells, x0 + c, row, DOT_ALPHA, cols, rows)
      }
    }
    lane += 1
  }
  const sx = ((t / GO.syncSeconds) % 1) * (cols + 4) - 2
  for (let row = 0; row < rows; row++) {
    splat(cells, sx, row, DOT_ALPHA, cols, rows, GREEN)
    splat(cells, sx + 1, row, DOT_ALPHA * 0.6, cols, rows, GREEN)
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Python SDK · "Snake"
// A snake of dots winds across the band on a Lissajous path; head is green,
// the tail fades behind it.
// ═══════════════════════════════════════════════════════════════════════════

const PY = {
  body: 22, // number of segments
  lag: 0.06, // time delay between segments
  ampX: 0.46, // horizontal swing (fraction of width)
  ampY: 0.4, // vertical swing (fraction of height)
  freqX: 0.8,
  freqY: 1.7,
}

const python: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const cx = cols / 2
  const cy = (rows - 1) / 2
  for (let s = 0; s < PY.body; s++) {
    const tt = t - s * PY.lag
    const x = cx + Math.sin(tt * PY.freqX) * cols * PY.ampX
    const y = cy + Math.sin(tt * PY.freqY + 1.3) * rows * PY.ampY
    const alpha = DOT_ALPHA * (1 - (s / PY.body) * 0.85)
    splat(cells, x, y, alpha, cols, rows, s === 0 ? GREEN : undefined)
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Rust SDK · "Signal"
// Two overlapping sine waves of dots sweep across at high frequency — a fast,
// low-level signal. Wave crests flash green.
// ═══════════════════════════════════════════════════════════════════════════

const RUST = {
  freq: 0.45, // primary wavelength
  speed: 6, // primary travel speed
  amp: 0.32, // primary amplitude (fraction of height)
  freq2: 0.9, // secondary (harmonic) wavelength
  speed2: 9, // secondary travel speed
  amp2: 0.16, // secondary amplitude
  crest: 0.93, // |sin| above this lights green
}

const rust: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const cy = (rows - 1) / 2
  for (let col = 0; col < cols; col++) {
    const p1 = col * RUST.freq - t * RUST.speed
    const y1 = cy + Math.sin(p1) * rows * RUST.amp
    const color = Math.abs(Math.sin(p1)) > RUST.crest ? GREEN : undefined
    splat(cells, col, y1, DOT_ALPHA, cols, rows, color)

    const y2 = cy + Math.sin(col * RUST.freq2 - t * RUST.speed2) * rows * RUST.amp2
    splat(cells, col, y2, DOT_ALPHA * 0.4, cols, rows)
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Foundry support · "Forge"
// A hammer rises and falls onto an anvil; each strike throws green sparks that
// arc up and fall back (forging / compiling).
// ═══════════════════════════════════════════════════════════════════════════

const FOUNDRY = {
  beat: 0.9, // seconds between strikes
  sparks: 14, // sparks per strike
  sparkLife: 0.5, // how long sparks live (sec)
  sparkSpread: 12, // horizontal spark velocity
  sparkLift: 10, // upward spark velocity
  gravity: 20, // pulls sparks back down
}

const foundry: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const cx = Math.floor(cols / 2)
  const anvilTop = rows - 4

  // Anvil: flat top tapering into a base.
  const drawRow = (half: number, row: number) => {
    for (let c = -half; c <= half; c++) {
      cells.push({ col: cx + c, row, alpha: DOT_ALPHA })
    }
  }
  drawRow(6, anvilTop)
  drawRow(4, anvilTop + 1)
  drawRow(2, anvilTop + 2)
  drawRow(2, anvilTop + 3)

  // Hammer head: descends to the anvil at mid-beat, then recoils.
  const phase = (t % FOUNDRY.beat) / FOUNDRY.beat
  const drop = phase < 0.5 ? smoothstep(phase / 0.5) : 1 - smoothstep((phase - 0.5) / 0.5)
  const headRow = Math.round(drop * (anvilTop - 2))
  for (let c = -2; c <= 2; c++) {
    cells.push({ col: cx + c, row: headRow, alpha: DOT_ALPHA })
    cells.push({ col: cx + c, row: Math.max(0, headRow - 1), alpha: DOT_ALPHA })
  }

  // Sparks from the most recent impact (impacts land at mid-beat).
  const k = Math.floor(t / FOUNDRY.beat - 0.5)
  const age = t - (k + 0.5) * FOUNDRY.beat
  if (age >= 0 && age < FOUNDRY.sparkLife) {
    const fade = 1 - age / FOUNDRY.sparkLife
    for (let i = 0; i < FOUNDRY.sparks; i++) {
      const vx = (hash(k * 13 + i) - 0.5) * 2 * FOUNDRY.sparkSpread
      const vy = -(0.5 + hash(k * 7 + i) * 0.8) * FOUNDRY.sparkLift
      const x = cx + vx * age
      const y = anvilTop - 2 + vy * age + FOUNDRY.gravity * age * age
      splat(cells, x, y, fade * DOT_ALPHA, cols, rows, GREEN)
    }
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Exports — one entry per SDK row, in order.
// ═══════════════════════════════════════════════════════════════════════════

export const librariesPatterns: DotPattern[] = [
  passkey, // Passkeys
  mppx, // MPPX
  typescript, // TypeScript SDK
  go, // Go SDK
  python, // Python SDK
  rust, // Rust SDK
  foundry, // Foundry support
]

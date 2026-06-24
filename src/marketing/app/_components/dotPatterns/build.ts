import { clamp01, DOT_ALPHA, GREEN, hash, smoothstep, splat } from './helpers'
import type { DotPattern, LitCell } from './types'

/**
 * Dot patterns for the Build section. Hovering a capability row morphs the dot
 * band into that row's pattern; `buildAmbient` is the resting state.
 *
 * Each pattern is a pure function of time + grid size that returns the lit
 * cells. To tinker, edit the `controls` object at the top of each section —
 * the grid is `cols` × `rows` cells and `t` is seconds since the pattern was
 * revealed.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Row 1 · "Assembly"  (Create & Use Stablecoin Accounts)
// Scattered dots stream in, glide together into an account card that travels
// left → right, then disperse as it exits. Staggered cards keep it continuous.
// ═══════════════════════════════════════════════════════════════════════════

const ASSEMBLY = {
  cardW: 12, // card width (cells)
  cardH: 6, // card height (cells)
  crossSeconds: 5, // time for one card to cross the band
  scatter: 5, // how far dots spread out before converging
  cards: 5, // how many cards travel the band at once
  formStart: 0.05, // point in the trip (0..1) where a card starts forming
  formSpan: 0.3, // fraction of the trip the form-up / break-up takes
}

// Card shape as {dc, dr} offsets from its top-left: an outline + a chip.
function makeCard(w: number, h: number): { dc: number; dr: number }[] {
  const cells: { dc: number; dr: number }[] = []
  for (let c = 0; c < w; c++) {
    cells.push({ dc: c, dr: 0 }) // top edge
    cells.push({ dc: c, dr: h - 1 }) // bottom edge
  }
  for (let r = 1; r < h - 1; r++) {
    cells.push({ dc: 0, dr: r }) // left edge
    cells.push({ dc: w - 1, dr: r }) // right edge
  }
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) cells.push({ dc: 2 + c, dr: 2 + r }) // chip
  }
  return cells
}

const cardCells = makeCard(ASSEMBLY.cardW, ASSEMBLY.cardH)

const assembly: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const cardY = Math.floor((rows - ASSEMBLY.cardH) / 2)
  const startX = -ASSEMBLY.cardW - 6 // fully off the left
  const endX = cols + 6 // fully off the right

  for (let inst = 0; inst < ASSEMBLY.cards; inst++) {
    const progress = (t / ASSEMBLY.crossSeconds + inst / ASSEMBLY.cards) % 1
    const cardX = startX + (endX - startX) * progress

    // 0 = scattered, 1 = fully formed. Ramps up after entering, holds across
    // the middle, ramps back down before exiting.
    const formIn = smoothstep(clamp01((progress - ASSEMBLY.formStart) / ASSEMBLY.formSpan))
    const formOut = smoothstep(clamp01((1 - ASSEMBLY.formStart - progress) / ASSEMBLY.formSpan))
    const formed = Math.min(formIn, formOut)
    if (formed <= 0.001) continue

    const scatter = ASSEMBLY.scatter * (1 - formed)
    cardCells.forEach((cell, i) => {
      const angle = hash(i * 1.3 + inst * 11.7) * Math.PI * 2
      const x = cardX + cell.dc + Math.cos(angle) * scatter
      const y = cardY + cell.dr + Math.sin(angle) * scatter
      splat(cells, x, y, formed * DOT_ALPHA, cols, rows)
    })
  }

  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Row 2 · "Globes"  (Issue tokenized assets)
// Small static globes staggered across the band, each emitting expanding
// ripples. Where ripples from neighbours meet (constructive interference) the
// dots light up green.
// ═══════════════════════════════════════════════════════════════════════════

const ISSUANCE = {
  globes: 6, // number of static ripple sources
  orbRadius: 1.4, // size of each globe marker (cells)
  waveFreq: 0.85, // ripple ring density
  waveSpeed: 3, // ripple expansion speed
  falloff: 16, // distance over which a globe's ripples fade (cells)
  crestMin: 0.25, // wave value needed to light a dot
  greenAt: 1.1, // summed wave above this lights green (ripples meeting)
}

// Soft-edged filled disc — the static globe marker.
function fillOrb(cells: LitCell[], cx: number, cy: number, r: number, cols: number, rows: number) {
  for (let row = Math.floor(cy - r - 1); row <= Math.ceil(cy + r + 1); row++) {
    if (row < 0 || row >= rows) continue
    for (let col = Math.floor(cx - r - 1); col <= Math.ceil(cx + r + 1); col++) {
      if (col < 0 || col >= cols) continue
      const d = Math.hypot(col - cx, row - cy)
      const a = (1 - clamp01(d - r)) * DOT_ALPHA
      if (a > 0.01) cells.push({ col, row, alpha: a })
    }
  }
}

const issuance: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []

  const sources: [number, number][] = []
  const slot = cols / ISSUANCE.globes
  for (let i = 0; i < ISSUANCE.globes; i++) {
    // One globe per horizontal slot (keeps them spread, no clumping) but
    // jittered within the slot and free across the full height.
    const cx = slot * (i + 0.15 + hash(i * 5 + 1) * 0.7)
    const cy = rows * (0.12 + hash(i * 3 + 2) * 0.76)
    sources.push([cx, cy])
  }

  // Ripple interference field: sum each source's traveling wave per cell.
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let sum = 0
      for (const [gx, gy] of sources) {
        const d = Math.hypot(col - gx, row - gy)
        const fall = clamp01(1 - d / ISSUANCE.falloff)
        if (fall <= 0) continue
        sum += Math.cos(d * ISSUANCE.waveFreq - t * ISSUANCE.waveSpeed) * fall
      }
      if (sum <= ISSUANCE.crestMin) continue
      const color = sum > ISSUANCE.greenAt ? GREEN : undefined
      const alpha = clamp01((sum - ISSUANCE.crestMin) / 1.3) * DOT_ALPHA
      if (alpha > 0.01) cells.push({ col, row, alpha, color })
    }
  }

  // Static globe markers on top.
  for (const [gx, gy] of sources) {
    fillOrb(cells, gx, gy, ISSUANCE.orbRadius, cols, rows)
  }

  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Row 3 · "Two-way lanes"  (Send & receive payments)
// Stacked lanes of bold dashes; even lanes send right (white), odd lanes
// receive left (green). Fills the band, bidirectional.
// ═══════════════════════════════════════════════════════════════════════════

const PAYMENTS = {
  topOffset: 2, // row of the first lane (balances the top/bottom margin)
  laneGap: 3, // rows between lanes
  dashLen: 4, // dash length (cells)
  dashGap: 7, // gap between dashes (cells)
  speed: 11, // travel speed (cells/sec)
}

const payments: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const period = PAYMENTS.dashLen + PAYMENTS.dashGap
  let lane = 0
  for (let row = PAYMENTS.topOffset; row < rows; row += PAYMENTS.laneGap) {
    const dir = lane % 2 === 0 ? 1 : -1 // even: send →, odd: receive ←
    const color = dir < 0 ? GREEN : undefined
    const phase = (((t * PAYMENTS.speed * dir) % period) + period) % period
    for (let k = -1; k <= Math.ceil(cols / period); k++) {
      const x0 = k * period + phase
      for (let c = 0; c < PAYMENTS.dashLen; c++) {
        splat(cells, x0 + c, row, DOT_ALPHA, cols, rows, color)
      }
    }
    lane += 1
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Row 4 · "Encryption sweep"  (Enable private payments)
// A full ordered grid; a green band sweeps across, scrambling the dots it
// passes (privacy applied), which settle back to order behind it.
// ═══════════════════════════════════════════════════════════════════════════

const PRIVATE = {
  speed: 18, // sweep speed (cells/sec)
  bandWidth: 8, // width of the scramble band (cells)
  base: 0.16, // ordered (clear) opacity
  scrambleSpeed: 14, // flicker speed inside the band
  lockAlpha: 0.95, // brightness of the padlock glyph
  lockMargin: 6, // keep the padlock this many cells from the edges
  lockFade: 5, // cells over which the padlock fades in/out near the margin
}

// Padlock glyph (offsets from top-left): a shackle arch over a body with a
// keyhole. 8 wide × 9 tall — built so it reads clearly at dot scale.
const PADLOCK_W = 8
const PADLOCK_H = 9
const PADLOCK: { dc: number; dr: number }[] = (() => {
  const cells: { dc: number; dr: number }[] = []
  // Shackle: top bar + two legs reaching down into the body.
  for (let c = 2; c <= 5; c++) cells.push({ dc: c, dr: 0 })
  cells.push({ dc: 2, dr: 1 }, { dc: 5, dr: 1 })
  cells.push({ dc: 2, dr: 2 }, { dc: 5, dr: 2 })
  // Body rows 3–8, with a 2×2 keyhole gap in the middle.
  for (let r = 3; r <= 8; r++) {
    for (let c = 0; c <= 7; c++) {
      const keyhole = (c === 3 || c === 4) && (r === 5 || r === 6)
      if (!keyhole) cells.push({ dc: c, dr: r })
    }
  }
  return cells
})()

const privacy: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const span = cols + PRIVATE.bandWidth * 2
  const sweep = ((t * PRIVATE.speed) % span) - PRIVATE.bandWidth
  const tick = Math.floor(t * PRIVATE.scrambleSpeed)

  // The padlock rides the center of the sweep (snapped to whole cells so it
  // stays crisp), but fades out near the edges so its quiet zone never touches
  // them. Only when it's on, a 1-cell quiet zone keeps the shape readable.
  const lockLeft = Math.round(sweep - PADLOCK_W / 2)
  const lockTop = Math.round((rows - PADLOCK_H) / 2)
  const lockFade = clamp01((Math.min(sweep, cols - sweep) - PRIVATE.lockMargin) / PRIVATE.lockFade)
  const showLock = lockFade > 0.01
  const inQuietZone = (col: number, row: number) =>
    showLock &&
    col >= lockLeft - 1 &&
    col <= lockLeft + PADLOCK_W &&
    row >= lockTop - 1 &&
    row <= lockTop + PADLOCK_H

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (inQuietZone(col, row)) {
        cells.push({ col, row, alpha: PRIVATE.base * DOT_ALPHA }) // calm patch
        continue
      }
      const near = clamp01(1 - Math.abs(col - sweep) / PRIVATE.bandWidth)
      if (near <= 0) {
        cells.push({ col, row, alpha: PRIVATE.base * DOT_ALPHA })
      } else {
        // Scrambled: high-frequency per-cell flicker, green at the front.
        const n = hash(col * 13 + row * 7 + tick)
        const alpha = (0.25 + 0.6 * n) * near
        const color = near > 0.5 ? GREEN : undefined
        cells.push({ col, row, alpha, color })
      }
    }
  }

  // Padlock drawn crisply on top of its quiet patch, faded near the edges.
  if (showLock) {
    for (const { dc, dr } of PADLOCK) {
      const col = lockLeft + dc
      const row = lockTop + dr
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        cells.push({ col, row, alpha: PRIVATE.lockAlpha * lockFade })
      }
    }
  }

  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Row 5 · "Swarm"  (Accept agentic payments)
// Autonomous agents wander on smooth paths across the band; when two meet, a
// green handshake dot flashes between them.
// ═══════════════════════════════════════════════════════════════════════════

const AGENTIC = {
  agents: 16, // number of agents
  speed: 0.5, // wander speed
  meetDist: 4, // distance (cells) that triggers a handshake
}

const agentic: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const positions: [number, number][] = []

  for (let i = 0; i < AGENTIC.agents; i++) {
    const fx = 0.5 + hash(i) * 0.8
    const fy = 0.4 + hash(i * 2) * 0.7
    const x = (0.5 + 0.46 * Math.sin(t * AGENTIC.speed * fx + hash(i * 3) * 6.28)) * cols
    const y = (0.5 + 0.42 * Math.cos(t * AGENTIC.speed * fy + hash(i * 5) * 6.28)) * rows
    positions.push([x, y])
    // Bold agent blob.
    splat(cells, x, y, DOT_ALPHA, cols, rows)
    splat(cells, x + 1, y, DOT_ALPHA * 0.7, cols, rows)
    splat(cells, x, y + 1, DOT_ALPHA * 0.7, cols, rows)
  }

  // Handshakes: green dot at the midpoint of any close pair.
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i][0] - positions[j][0]
      const dy = positions[i][1] - positions[j][1]
      const d = Math.hypot(dx, dy)
      if (d >= AGENTIC.meetDist) continue
      const mx = (positions[i][0] + positions[j][0]) / 2
      const my = (positions[i][1] + positions[j][1]) / 2
      splat(cells, mx, my, clamp01(1 - d / AGENTIC.meetDist), cols, rows, GREEN)
    }
  }
  return cells
}

// ═══════════════════════════════════════════════════════════════════════════
// Exports — one entry per capability row, in order.
// ═══════════════════════════════════════════════════════════════════════════

export const buildPatterns: DotPattern[] = [
  assembly, // Create & Use Stablecoin Accounts
  issuance, // Issue tokenized assets
  payments, // Send & receive payments
  privacy, // Enable private payments
  agentic, // Accept agentic payments
]

// Resting state: a sparse field of dots that softly twinkle.
const AMBIENT = {
  density: 0.14, // fraction of cells that participate
  base: 0.18, // resting opacity
  twinkle: 0.12, // opacity swing
  speed: 1.5, // twinkle speed
}

export const buildAmbient: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (hash(col * 31 + row * 17) > AMBIENT.density) continue
      const phase = hash(col * 7 + row * 53) * Math.PI * 2
      const alpha = AMBIENT.base + AMBIENT.twinkle * Math.sin(t * AMBIENT.speed + phase)
      cells.push({ col, row, alpha })
    }
  }
  return cells
}

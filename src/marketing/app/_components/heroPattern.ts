import { clamp01, hash, smoothstep, splat } from './dotPatterns/helpers'
import type { DotPattern, LitCell } from './dotPatterns/types'
import { PALETTE } from './palette'

// Hero ambience: the perf panel's "speed" payment beams, adapted to run along
// the bottom band of the hero grid. Bars enter at the left, race across
// the full width with a bright head and fading tail, and dissolve as they
// exit. Same jittered-clock scheduler as the v2 speed pattern, so arrivals
// feel live while staying deterministic in `t`.

// Each beam keeps one palette color for its whole run; which color is hashed
// from the beam's seed, so the mix reshuffles while staying deterministic.
const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')
const BEAM_COLORS = PALETTE.map(hexToRgb)

const TX = {
  bandRows: 14, // height of the activity band above the grid's bottom edge
  laneGap: 4, // rows between lane tops
  beamRows: 2, // beam height (cells)
  tailLen: 9, // tail length behind the head (cells)
  travelSeconds: 2, // average time for a beam to cross the grid
  period: 1.1, // average seconds between beams per lane
  fadeIn: 0.18, // fraction of the run spent fading in
  fadeOut: 0.25, // fraction of the run spent fading out
  alpha: 0.95, // head brightness
}

// Resting field behind the beams. Kept barely above the base grid so it reads
// as ambient texture, not a second pattern. Each cell breathes on its own slow
// clock — drifting in and out of visibility — so the lit set never settles and
// continuously reshuffles.
const AMBIENT = {
  density: 0.16, // fraction of cells that ever light
  floor: 0.02, // faint resting opacity (≈ base grid)
  peak: 0.2, // brightest a dot gets at its crest
  speed: 0.75, // breathing speed (lower = slower drift)
}

export const heroAmbientPattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (hash(col * 31 + row * 17) > AMBIENT.density) continue
      // Per-cell phase + a slight per-cell frequency jitter so cells fall out
      // of sync and the pattern keeps randomizing instead of pulsing together.
      const phase = hash(col * 7 + row * 53) * Math.PI * 2
      const freq = AMBIENT.speed * (0.6 + hash(col * 5 + row * 3) * 0.8)
      // Sharpened sine: dots sit dark most of the cycle and gently swell up.
      const swell = (Math.sin(t * freq + phase) * 0.5 + 0.5) ** 2
      const alpha = AMBIENT.floor + (AMBIENT.peak - AMBIENT.floor) * swell
      cells.push({ col, row, alpha })
    }
  }
  return cells
}

// Same breathing field as heroAmbientPattern, but each lit point renders as a
// "+" (center plus its four orthogonal neighbours) instead of a single dot. The
// arms sit a touch dimmer than the center so the cross reads as a shape rather
// than five equal dots.
const PLUS_ARM = 0.55 // arm brightness relative to the center

export const heroAmbientPlusPattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const put = (col: number, row: number, alpha: number) => {
    if (alpha <= 0.003 || col < 0 || col >= cols || row < 0 || row >= rows) {
      return
    }
    cells.push({ col, row, alpha })
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (hash(col * 31 + row * 17) > AMBIENT.density) continue
      const phase = hash(col * 7 + row * 53) * Math.PI * 2
      const freq = AMBIENT.speed * (0.6 + hash(col * 5 + row * 3) * 0.8)
      const swell = (Math.sin(t * freq + phase) * 0.5 + 0.5) ** 2
      const alpha = AMBIENT.floor + (AMBIENT.peak - AMBIENT.floor) * swell
      put(col, row, alpha)
      put(col - 1, row, alpha * PLUS_ARM)
      put(col + 1, row, alpha * PLUS_ARM)
      put(col, row - 1, alpha * PLUS_ARM)
      put(col, row + 1, alpha * PLUS_ARM)
    }
  }
  return cells
}

export const heroBeamsPattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []

  const rowStart = Math.max(1, rows - TX.bandRows)

  let lane = 0
  for (let row = rowStart; row + TX.beamRows <= rows; row += TX.laneGap) {
    // Per-lane cadence jitter keeps lanes from firing in lockstep.
    const p = TX.period * (0.7 + hash(lane * 3.7) * 0.6)
    const k = Math.floor(t / p)

    // Recent events only — older beams may still be mid-flight, so look back
    // far enough to cover the longest travel time.
    for (const ki of [k - 2, k - 1, k]) {
      const seed = lane * 131 + ki * 17
      const start = ki * p + hash(seed) * p * 0.4
      const travel = TX.travelSeconds * (0.75 + hash(seed + 1) * 0.4)
      const color = BEAM_COLORS[Math.floor(hash(seed + 2) * BEAM_COLORS.length)]
      const progress = (t - start) / travel
      if (progress <= 0 || progress >= 1) continue

      // Fade in as the beam enters, out as it exits.
      const env =
        smoothstep(clamp01(progress / TX.fadeIn)) * smoothstep(clamp01((1 - progress) / TX.fadeOut))
      if (env <= 0.003) continue

      // The head runs past the right edge so the tail exits fully.
      const headX = progress * (cols + TX.tailLen)

      for (let i = 0; i <= TX.tailLen; i++) {
        const x = headX - i
        if (x < -0.5) break
        const falloff = (1 - i / (TX.tailLen + 1)) ** 1.6
        for (let r = 0; r < TX.beamRows; r++) {
          splat(cells, x, row + r, TX.alpha * env * falloff, cols, rows, color)
        }
      }
    }
    lane += 1
  }

  return cells
}

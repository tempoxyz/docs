import { clamp01, GREEN, hash, smoothstep, splat } from './helpers'
import type { DotPattern, LitCell } from './types'

// Transactions streaking through: green light beams enter at the left of a
// right-anchored band, race left -> right with a bright head and a fading
// tail, and dissolve as they exit. Each lane fires on its own jittered clock
// so arrivals feel live — boom, boom-boom — while staying deterministic in
// `t` (loops and morphs cleanly). Later the hash-based scheduler can be
// swapped for real Tempo transactions without touching the rendering.

const TX = {
  bandCols: 30, // width of the activity band (cells), right-anchored
  rightGap: 5, // desktop gap between the band and the grid's right edge
  // Below this width (i.e. mobile) the right gap pushes the band off the left
  // edge behind the metric text, so we drop it to 0 there.
  narrowCols: 28,
  laneGap: 4, // rows between lane tops
  beamRows: 2, // beam height (cells)
  tailLen: 9, // tail length behind the head (cells)
  travelSeconds: 1, // average time for a beam to cross the band
  period: 0.8, // average seconds between beams per lane
  fadeIn: 0.18, // fraction of the run spent fading in
  fadeOut: 0.25, // fraction of the run spent fading out
  alpha: 0.95, // head brightness
}

export const speedPattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []

  const gap = cols <= TX.narrowCols ? 0 : TX.rightGap
  const bandW = Math.min(TX.bandCols, cols)
  const c0 = Math.max(0, cols - gap - bandW)

  let lane = 0
  for (let row = 1; row + TX.beamRows <= rows; row += TX.laneGap) {
    // Per-lane cadence jitter keeps lanes from firing in lockstep.
    const p = TX.period * (0.7 + hash(lane * 3.7) * 0.6)
    const k = Math.floor(t / p)

    // Recent events only — older beams may still be mid-flight, so look back
    // far enough to cover the longest travel time.
    for (const ki of [k - 2, k - 1, k]) {
      const seed = lane * 131 + ki * 17
      const start = ki * p + hash(seed) * p * 0.4
      const travel = TX.travelSeconds * (0.75 + hash(seed + 1) * 0.4)
      const progress = (t - start) / travel
      if (progress <= 0 || progress >= 1) continue

      // Fade in as the beam enters, out as it exits.
      const env =
        smoothstep(clamp01(progress / TX.fadeIn)) * smoothstep(clamp01((1 - progress) / TX.fadeOut))
      if (env <= 0.003) continue

      // The head runs past the band's right edge so the tail exits fully.
      const headX = c0 + progress * (bandW + TX.tailLen)

      for (let i = 0; i <= TX.tailLen; i++) {
        const x = headX - i
        if (x < c0 - 0.5) break // keep the tail inside the band
        const falloff = (1 - i / (TX.tailLen + 1)) ** 1.6
        for (let r = 0; r < TX.beamRows; r++) {
          splat(cells, x, row + r, TX.alpha * env * falloff, cols, rows, GREEN)
        }
      }
    }
    lane += 1
  }

  return cells
}

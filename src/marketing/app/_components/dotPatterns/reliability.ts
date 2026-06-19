import type { DotPattern, LitCell } from './types'

// A block anchored to the bottom-right of the grid. Its bottom SETTLED_FRACTION
// fills green ("settled"); the rest stays dim ("unsettled"). The green fills
// from the bottom up to the settled line, holds, fades out, then re-fills on a
// loop. The rising edge uses a soft per-row alpha so it glides instead of
// stepping. Tune the constants below to paint it.

const GREEN = '101, 255, 84'
const DIM = '125, 125, 125'
const GREEN_ALPHA = 0.6
const DIM_ALPHA = 0.12
// How many cells the block spans, anchored to the bottom-right corner.
const BLOCK_COLS = 30
const BLOCK_ROWS = 22
// Fraction of the block height (from the bottom) that ends up green.
const SETTLED_FRACTION = 0.92
// Looping fill: fill to the settled line over FILL_SECONDS, hold full for
// HOLD_SECONDS, fade out over FADE_SECONDS, then re-fill.
const FILL_SECONDS = 0.7
const HOLD_SECONDS = 1
const FADE_SECONDS = 0.6
const CYCLE_SECONDS = FILL_SECONDS + HOLD_SECONDS + FADE_SECONDS
const easeOut = (x: number) => 1 - (1 - x) ** 3
const smoothstep = (x: number) => x * x * (3 - 2 * x)

export const reliabilityPattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []

  const c1 = cols - 1
  const c0 = Math.max(0, c1 - BLOCK_COLS + 1)
  const r1 = rows - 1
  const r0 = Math.max(0, r1 - BLOCK_ROWS + 1)
  const blockRows = r1 - r0 + 1

  const settledRows = blockRows * SETTLED_FRACTION
  const phase = t % CYCLE_SECONDS
  let progress = 1
  let fade = 1
  if (phase < FILL_SECONDS) {
    progress = easeOut(phase / FILL_SECONDS)
  } else if (phase >= FILL_SECONDS + HOLD_SECONDS) {
    fade = 1 - smoothstep((phase - FILL_SECONDS - HOLD_SECONDS) / FADE_SECONDS)
  }
  const filledExact = settledRows * progress

  // Dim base for the whole block.
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      cells.push({ col, row, alpha: DIM_ALPHA, color: DIM })
    }
  }

  // Green overlay. `cover` (0..1) gives the leading row a partial alpha so the
  // rising edge glides; `fade` dissolves the field before the loop resets.
  for (let row = r0; row <= r1; row++) {
    const cover = Math.min(Math.max(filledExact - (r1 - row), 0), 1)
    const alpha = GREEN_ALPHA * cover * fade
    if (alpha <= 0.001) continue
    for (let col = c0; col <= c1; col++) {
      cells.push({ col, row, alpha, color: GREEN })
    }
  }

  return cells
}

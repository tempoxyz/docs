import type { DotPattern, LitCell } from './types'

// A growing bar graph: vertical dot bars rise from the bottom, staggered
// left -> right, hold, fade out, then loop. Reads as throughput "growth".
// Bar heights ascend to the right. Tune the constants below.

const BAR_COUNT = 6
const BAR_COLS = 4 // width of each bar
const BAR_GAP = 1 // gap between bars
const RIGHT_GAP_COLS = 5 // gap from the grid's right edge
// Below this width (i.e. mobile) the right gap pushes the bars off the left edge
// behind the metric text, so we drop it to 0 there.
const NARROW_COLS = 28
const ALPHA = 0.8

// Target bar heights as a fraction of the grid height (ascending = growth).
const MIN_HEIGHT = 0.25
const MAX_HEIGHT = 0.95

const GROW_SECONDS = 0.8 // time for one bar to grow to full
const STAGGER_SECONDS = 0.15 // delay between consecutive bars
const HOLD_SECONDS = 0.5
const FADE_SECONDS = 0.6

const easeOut = (x: number) => 1 - (1 - x) ** 3
const smoothstep = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

export const performancePattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []

  const span = BAR_COUNT * BAR_COLS + (BAR_COUNT - 1) * BAR_GAP
  const gap = cols <= NARROW_COLS ? 0 : RIGHT_GAP_COLS
  const x1 = cols - 1 - gap
  const x0 = x1 - span + 1

  const growEnd = (BAR_COUNT - 1) * STAGGER_SECONDS + GROW_SECONDS
  const fadeStart = growEnd + HOLD_SECONDS
  const cycle = fadeStart + FADE_SECONDS
  const tc = t % cycle
  const fade = tc < fadeStart ? 1 : 1 - smoothstep(clamp01((tc - fadeStart) / FADE_SECONDS))

  for (let i = 0; i < BAR_COUNT; i++) {
    const heightFraction = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * (i / (BAR_COUNT - 1))
    const growT = clamp01((tc - i * STAGGER_SECONDS) / GROW_SECONDS)
    const h = heightFraction * rows * easeOut(growT)
    if (h <= 0) continue

    const top = rows - h // float top of the bar; bottom is the grid floor
    const barLeft = x0 + i * (BAR_COLS + BAR_GAP)

    for (let row = Math.floor(top); row < rows; row++) {
      if (row < 0) continue
      // Soft top edge so the bar grows smoothly instead of snapping per row.
      const covY = clamp01(Math.min(row + 1, rows) - Math.max(row, top))
      if (covY <= 0) continue
      const alpha = ALPHA * fade * covY
      if (alpha <= 0.001) continue
      for (let c = 0; c < BAR_COLS; c++) {
        const col = barLeft + c
        if (col < 0 || col >= cols) continue
        cells.push({ col, row, alpha })
      }
    }
  }

  return cells
}

import type { DotPattern, LitCell } from './types'

// A bold static right-pointing arrow (→) drawn in highlighted dots, anchored
// toward the right edge. Used as the illustration on the "next feature" card.
const HEAD = 5 // arrowhead depth (cols) and half-height at its base
const SHAFT = 9 // shaft length, in dots
const THICK = 1 // shaft half-thickness → (2 * THICK + 1) rows tall
const RIGHT_GAP = 5 // dots between the tip and the right edge
const ALPHA = 0.85

export const arrowPattern: DotPattern = ({ cols, rows }) => {
  const cells: LitCell[] = []
  const tip = cols - 1 - RIGHT_GAP
  const mid = Math.floor(rows / 2)

  const add = (col: number, row: number) => {
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      cells.push({ col, row, alpha: ALPHA })
    }
  }

  // Solid arrowhead — a filled triangle with its apex at the tip.
  for (let k = 0; k <= HEAD; k++) {
    const c = tip - k
    for (let r = mid - k; r <= mid + k; r++) add(c, r)
  }

  // Thick shaft running back from behind the head.
  const shaftRight = tip - HEAD - 1
  for (let c = shaftRight - SHAFT + 1; c <= shaftRight; c++) {
    for (let r = mid - THICK; r <= mid + THICK; r++) add(c, r)
  }

  return cells
}

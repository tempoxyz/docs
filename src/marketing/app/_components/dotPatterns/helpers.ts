import type { LitCell } from './types'

// Shared toolkit for the dot patterns: brightness/colors, easing, deterministic
// noise, and sub-cell "splat" rendering so motion glides between cells.

// Brightness of a fully-lit dot (0..1).
export const DOT_ALPHA = 0.7
// "r, g, b" used for green accents.
export const GREEN = '101, 255, 84'

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
export const smoothstep = (x: number) => x * x * (3 - 2 * x)

// Deterministic pseudo-random in [0, 1).
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

// Draw a dot at a fractional (x, y) by spreading its alpha across the four
// surrounding cells, so motion glides instead of snapping cell-to-cell.
export function splat(
  cells: LitCell[],
  x: number,
  y: number,
  alpha: number,
  cols: number,
  rows: number,
  color?: string,
) {
  if (alpha <= 0.003) return
  const c0 = Math.floor(x)
  const r0 = Math.floor(y)
  const fx = x - c0
  const fy = y - r0
  const put = (c: number, r: number, a: number) => {
    if (a > 0.003 && c >= 0 && c < cols && r >= 0 && r < rows) {
      cells.push({ col: c, row: r, alpha: a, color })
    }
  }
  put(c0, r0, alpha * (1 - fx) * (1 - fy))
  put(c0 + 1, r0, alpha * fx * (1 - fy))
  put(c0, r0 + 1, alpha * (1 - fx) * fy)
  put(c0 + 1, r0 + 1, alpha * fx * fy)
}

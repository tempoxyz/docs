import { clamp01, GREEN, smoothstep, splat } from './helpers'
import type { DotPattern, LitCell } from './types'

// Fee comparison across chains, right-anchored: dim white bars (other chains)
// descend left -> right to a tiny green bar (Tempo). The bars rise in with a
// stagger, then a trend line traces down across the bar tops and lands on
// Tempo, which pulses — "fees drop to almost nothing here". Holds, fades,
// loops. Tune the constants below.

const COST = {
  // Relative fee height per chain, tallest -> cheapest. Last entry is Tempo.
  bars: [0.92, 0.64, 0.44, 0.28, 0.1],
  barCols: 4, // width of each bar
  barGap: 2, // gap between bars
  rightGap: 5, // gap from the grid's right edge
  // Below this width (i.e. mobile) the right gap pushes the chart off the left
  // edge behind the metric text, so we drop it to 0 there.
  narrowCols: 28,
  topPad: 4, // rows kept clear above the tallest bar (the line floats here)
  lineLift: 2, // how far the trend line floats above the bar tops (rows)
  growSeconds: 0.5, // time for one bar to rise
  staggerSeconds: 0.12, // delay between consecutive bars
  traceSeconds: 0.9, // time for the trend line to cross the chart
  holdSeconds: 1.2, // dwell with the line landed and Tempo pulsing
  fadeSeconds: 0.6,
  barAlpha: 0.35, // other chains: dim, they're the backdrop
  tempoAlpha: 0.9, // Tempo's bar: bright green
  lineAlpha: 0.8, // trend line head; the trail is dimmer
}

const easeOut = (x: number) => 1 - (1 - x) ** 3

export const costPattern: DotPattern = ({ t, cols, rows }) => {
  const cells: LitCell[] = []
  const n = COST.bars.length

  const span = n * COST.barCols + (n - 1) * COST.barGap
  const gap = cols <= COST.narrowCols ? 0 : COST.rightGap
  const x0 = cols - 1 - gap - span + 1

  const growEnd = (n - 1) * COST.staggerSeconds + COST.growSeconds
  const traceEnd = growEnd + COST.traceSeconds
  const holdEnd = traceEnd + COST.holdSeconds
  const cycle = holdEnd + COST.fadeSeconds
  const tc = t % cycle
  const fade = tc < holdEnd ? 1 : 1 - smoothstep(clamp01((tc - holdEnd) / COST.fadeSeconds))

  const maxH = rows - COST.topPad
  // Tempo pulses once the trend line has landed on it.
  const pulse = 0.75 + 0.25 * Math.sin((tc - traceEnd) * 6)

  // Final bar-top anchors (bar centers) the trend line connects.
  const tops: { x: number; y: number }[] = []

  for (let i = 0; i < n; i++) {
    const isTempo = i === n - 1
    const target = COST.bars[i] * maxH
    const barLeft = x0 + i * (COST.barCols + COST.barGap)
    tops.push({ x: barLeft + (COST.barCols - 1) / 2, y: rows - target })

    const growT = clamp01((tc - i * COST.staggerSeconds) / COST.growSeconds)
    const h = target * easeOut(growT)
    if (h <= 0) continue

    let alpha = isTempo ? COST.tempoAlpha : COST.barAlpha
    if (isTempo && tc > traceEnd) alpha *= pulse

    const top = rows - h
    for (let row = Math.floor(top); row < rows; row++) {
      if (row < 0) continue
      // Soft top edge so the bar rises smoothly instead of snapping per row.
      const covY = clamp01(Math.min(row + 1, rows) - Math.max(row, top))
      const a = alpha * fade * covY
      if (a <= 0.003) continue
      for (let c = 0; c < COST.barCols; c++) {
        const col = barLeft + c
        if (col < 0 || col >= cols) continue
        cells.push({ col, row, alpha: a, color: isTempo ? GREEN : undefined })
      }
    }
  }

  // Trend line: sweeps across the bar tops, dropping segment by segment, and
  // lands on Tempo. Trail stays lit behind the bright head.
  const traceT = smoothstep(clamp01((tc - growEnd) / COST.traceSeconds))
  if (traceT > 0) {
    const xStart = tops[0].x
    const xEnd = tops[n - 1].x
    const headX = xStart + (xEnd - xStart) * traceT

    const yAt = (x: number) => {
      let i = 0
      while (i < n - 2 && x > tops[i + 1].x) i++
      const f = clamp01((x - tops[i].x) / (tops[i + 1].x - tops[i].x))
      return tops[i].y + (tops[i + 1].y - tops[i].y) * f - COST.lineLift
    }

    for (let col = Math.ceil(xStart); col <= Math.floor(headX); col++) {
      splat(cells, col, yAt(col), COST.lineAlpha * 0.5 * fade, cols, rows)
    }

    const landed = traceT >= 1
    const headAlpha = landed ? COST.lineAlpha * pulse : COST.lineAlpha
    splat(cells, headX, yAt(headX), headAlpha * fade, cols, rows, landed ? GREEN : undefined)
  }

  return cells
}

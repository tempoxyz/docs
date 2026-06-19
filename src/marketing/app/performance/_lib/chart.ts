// Minimal SVG chart math shared by the /performance charts: linear scales,
// path builders, and "nice" axis ticks. No rendering — components own that.

export type Scale = (v: number) => number

export const scaleLinear = ([d0, d1]: [number, number], [r0, r1]: [number, number]): Scale => {
  const span = d1 - d0 || 1
  return (v) => r0 + ((v - d0) / span) * (r1 - r0)
}

export const linePath = (points: [number, number][]) =>
  points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')

export const areaPath = (points: [number, number][], baselineY: number) => {
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath(points)} L${last[0].toFixed(2)} ${baselineY.toFixed(2)} L${first[0].toFixed(2)} ${baselineY.toFixed(2)} Z`
}

// Closed band between an upper and lower series sharing x positions.
export const bandPath = (upper: [number, number][], lower: [number, number][]) => {
  const reversed = [...lower].reverse()
  return `${linePath(upper)} ${reversed
    .map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')} Z`
}

// Round-numbered ticks covering [min, max] with roughly `count` steps.
export function ticks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1
  const rawStep = span / count
  const pow = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rawStep) ?? 10 * pow
  const start = Math.ceil(min / step) * step
  const out: number[] = []
  for (let v = start; v <= max + step / 1e6; v += step) out.push(v)
  return out
}

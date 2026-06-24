// biome-ignore-all lint/a11y/noSvgWithoutTitle: The chart SVG is paired with visible axes, labels, and tooltip text.

'use client'

import { useEffect, useState } from 'react'
import { linePath, scaleLinear, ticks } from '../_lib/chart'
import { fmtInt, type PerfRun } from '../_lib/runs'
import ChartTooltip from './ChartTooltip'
import {
  TPS_CHART_DEFAULT_DOMAIN,
  TPS_CHART_DEFAULT_TICKS,
  TPS_CHART_MOBILE_BP,
  TpsChartGrid,
  tpsChartPad,
} from './TpsTrendChartFrame'
import useMeasure from './useMeasure'

// Vercel-hero-style throughput chart: settled TPS per nightly run, drawn with
// a theme-aware gradient stroke (userSpaceOnUse so the dots pick up the local
// gradient color) and a hover crosshair + data card. The line draws itself
// left-to-right on mount, with each dot popping in as the stroke reaches it.

const DRAW_MS = 1600

export default function TpsTrendChart({
  runs,
  height = 360,
}: {
  runs: PerfRun[]
  height?: number
}) {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  // Reduced-motion users start (and stay) fully drawn. The SVG only renders
  // after the container is measured, so this never affects server HTML.
  const [drawn, setDrawn] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  // True once the draw animation has finished — gates the pinned latest-value
  // label so it appears with the final dot but still dims/undims instantly.
  const [intro, setIntro] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const ready = width > 0

  // Flip to the drawn state one frame after first paint so the
  // stroke-dashoffset transition runs.
  useEffect(() => {
    if (!ready || drawn) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setDrawn(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [ready, drawn])

  useEffect(() => {
    if (!drawn || intro) return
    const t = setTimeout(() => setIntro(true), DRAW_MS)
    return () => clearTimeout(t)
  }, [drawn, intro])

  if (runs.length < 2) return null

  const PAD = tpsChartPad(width)
  const mobile = width > 0 && width < TPS_CHART_MOBILE_BP
  const n = runs.length
  const values = runs.map((r) => r.settledTps)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const dynamicYDomain = [min * 0.9, max * 1.06] as [number, number]
  const stableYDomainFits =
    dynamicYDomain[0] >= TPS_CHART_DEFAULT_DOMAIN[0] &&
    dynamicYDomain[1] <= TPS_CHART_DEFAULT_DOMAIN[1]
  const yDomain = stableYDomainFits ? TPS_CHART_DEFAULT_DOMAIN : dynamicYDomain
  const yTicks = stableYDomainFits ? TPS_CHART_DEFAULT_TICKS : ticks(yDomain[0], yDomain[1], 4)

  const xAt = scaleLinear([0, n - 1], [PAD.l, Math.max(width - PAD.r, PAD.l + 1)])
  const yAt = scaleLinear(yDomain, [height - PAD.b, PAD.t])
  const points = values.map((v, i) => [xAt(i), yAt(v)] as [number, number])

  const labelStep = Math.ceil(n / 6)

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round(((px - PAD.l) / (width - PAD.l - PAD.r)) * (n - 1))
    const clamped = Math.min(Math.max(i, 0), n - 1)
    setHover(clamped)
  }

  const active = hover === null ? null : runs[hover]
  const last = n - 1

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} className="block">
          <defs>
            <linearGradient
              id="tps-grad"
              gradientUnits="userSpaceOnUse"
              x1={PAD.l}
              y1="0"
              x2={width - PAD.r}
              y2="0"
            >
              <stop offset="0%" stopColor="var(--performance-tps-start)" />
              <stop offset="55%" stopColor="var(--performance-tps-mid)" />
              <stop offset="100%" stopColor="var(--performance-tps-end)" />
            </linearGradient>
          </defs>

          <TpsChartGrid height={height} width={width} yDomain={yDomain} yTicks={yTicks} />

          {runs.map((r, i) =>
            i === 0 || i === last || i % labelStep === 0 ? (
              <text
                key={r.id}
                x={xAt(i)}
                y={height - 8}
                textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}
                className="fill-foreground/45 font-sans text-[12px]"
              >
                {r.dateLabel}
              </text>
            ) : null,
          )}

          {hover !== null ? (
            <line
              x1={points[hover][0]}
              x2={points[hover][0]}
              y1={PAD.t}
              y2={height - PAD.b}
              stroke="var(--line-strong)"
            />
          ) : null}

          <path
            d={linePath(points)}
            fill="none"
            stroke="url(#tps-grad)"
            strokeWidth="2"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={drawn ? 0 : 1}
            style={{
              transition: `stroke-dashoffset ${DRAW_MS}ms ease-in`,
            }}
          />

          {points.map(([x, y], i) => (
            <circle
              key={runs[i].id}
              cx={x}
              cy={y}
              r={hover === i ? 5 : 3}
              fill="url(#tps-grad)"
              stroke="var(--surface-page)"
              strokeWidth="2"
              style={{
                opacity: drawn ? 1 : 0,
                // sqrt inverts the stroke's roughly-quadratic ease-in, so each
                // dot still appears right as the stroke tip reaches it. The
                // radius eases separately (no delay) for hover emphasis.
                transition: `opacity 250ms ease-out ${Math.sqrt(i / (n - 1)) * DRAW_MS}ms, r 200ms ease-out`,
              }}
            />
          ))}

          {/* Latest value, pinned beside the line's end on desktop (fades in
              with the final dot, dims while a hover comparison is open). Hidden
              on mobile, where the gutter is collapsed so the line goes wide. */}
          {mobile ? null : (
            <text
              x={points[last][0] + 14}
              y={points[last][1] + 4}
              fill="var(--performance-tps-end)"
              className="font-mono text-[11px] motion-reduce:transition-none"
              style={{
                opacity: intro ? 1 : 0,
                transition: 'opacity 250ms ease-out',
              }}
            >
              {fmtInt(runs[last].settledTps)}
            </text>
          )}

          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      ) : null}

      {active && hover !== null ? (
        <ChartTooltip x={points[hover][0]} width={width}>
          <p className="whitespace-nowrap font-mono text-[11px] text-foreground/40">
            {active.dateLabel} · {active.timeLabel}
          </p>
          <p className="mt-1 whitespace-nowrap font-mono text-[13px] text-foreground">
            {fmtInt(active.settledTps)}{' '}
            <span className="text-foreground/40">transactions per second</span>
          </p>
        </ChartTooltip>
      ) : null}
    </div>
  )
}

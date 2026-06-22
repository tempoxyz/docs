// biome-ignore-all lint/a11y/noSvgWithoutTitle: The chart SVG is decorative and described by nearby labels.

'use client'

import { useEffect, useState } from 'react'
import { linePath, scaleLinear } from '../_lib/chart'
import { fmtInt, type PerfRun } from '../_lib/runs'
import useMeasure from './useMeasure'

// The payment-lanes story, told with real data: the chart is split into two
// always-visible bands. General blockspace carries the actual settled-TPS
// series from the nightly feed (tens of thousands of TPS); the dedicated
// payment lane below has tiny sub-cent fee movement, with pulses flowing along it.

// No y-axis on this chart, so the bands run flush to the container's left
// edge; the right padding is the lane for the pinned end labels. On mobile that
// lane is collapsed and the end values move into the zone header rows instead.
const PAD = { l: 0, r: 150, t: 20, b: 24 }
const MOBILE_BP = 480
const H = 300
const DIVIDER = 190
const FEE_Y = (DIVIDER + H - PAD.b) / 2 + 6
const DRAW_MS = 900

export default function PaymentLanes({ runs }: { runs: PerfRun[] }) {
  const { ref, width } = useMeasure<HTMLDivElement>()
  // Draws the load line once the chart is properly on screen.
  const [drawn, setDrawn] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const el = ref.current
    if (!el || drawn) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDrawn(true)
          io.disconnect()
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, drawn])

  const mobile = width > 0 && width < MOBILE_BP
  const padR = mobile ? 12 : PAD.r
  const endX = Math.max(width - padR, PAD.l + 1)

  // Real settled TPS per nightly run, scaled into the general blockspace zone.
  const values = runs.map((r) => r.settledTps)
  const hasData = values.length >= 2
  const min = hasData ? Math.min(...values) : 0
  const max = hasData ? Math.max(...values) : 1
  const xAt = scaleLinear([0, Math.max(values.length - 1, 1)], [PAD.l, endX])
  const yAt = scaleLinear([min * 0.92, max * 1.08], [DIVIDER - 14, PAD.t + 34])
  const loadPts = values.map((v, i) => [xAt(i), yAt(v)] as [number, number])
  const loadEndY = hasData ? loadPts[loadPts.length - 1][1] : 0
  const feePointCount = Math.max(values.length, 16)
  const feeXAt = scaleLinear([0, feePointCount - 1], [PAD.l, endX])
  const feePts = Array.from(
    { length: feePointCount },
    (_, i) =>
      [feeXAt(i), FEE_Y + Math.sin(i * 1.7) * 1.15 + Math.sin(i * 0.55) * 0.55] as [number, number],
  )
  const feeEndY = feePts[feePts.length - 1]?.[1] ?? FEE_Y

  return (
    <div ref={ref} className="relative w-full" style={{ height: H }}>
      {width > 0 ? (
        <svg width={width} height={H} className="block" aria-hidden>
          {/* General blockspace zone, carrying the benchmark load. */}
          <rect
            x={PAD.l}
            y={PAD.t}
            width={endX - PAD.l}
            height={DIVIDER - PAD.t}
            fill="var(--background)"
            className="zone-breathe motion-reduce:animate-none"
          />
          <text
            x={PAD.l + 12}
            y={PAD.t + 18}
            className="fill-foreground/35 font-mono text-[10px] tracking-wider"
          >
            GENERAL BLOCKSPACE · SHARED LOAD
          </text>

          {/* Dedicated payment lane zone. */}
          <rect
            x={PAD.l}
            y={DIVIDER}
            width={endX - PAD.l}
            height={H - PAD.b - DIVIDER}
            fill="var(--indicator-green)"
            opacity="0.05"
          />
          <text
            x={PAD.l + 12}
            y={DIVIDER + 20}
            fill="var(--indicator-green)"
            fillOpacity="0.8"
            className="font-mono text-[10px] tracking-wider"
          >
            DEDICATED PAYMENT LANE
          </text>

          <line
            x1={PAD.l}
            x2={endX}
            y1={DIVIDER}
            y2={DIVIDER}
            stroke="var(--line-strong)"
            strokeDasharray="3 4"
          />

          {/* Real benchmark load settling in general blockspace. */}
          {hasData ? (
            <>
              <path
                d={linePath(loadPts)}
                fill="none"
                stroke="var(--line-dashed)"
                strokeOpacity="0.6"
                strokeWidth="1.5"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={drawn ? 0 : 1}
                className="motion-reduce:transition-none"
                style={{
                  transition: `stroke-dashoffset ${DRAW_MS}ms ease-out`,
                }}
              />
              <text
                x={mobile ? endX - 12 : endX + 12}
                y={mobile ? PAD.t + 18 : loadEndY + 4}
                textAnchor={mobile ? 'end' : 'start'}
                className="fill-foreground/40 font-mono text-[11px] motion-reduce:transition-none"
                style={{
                  opacity: drawn ? 1 : 0,
                  transition: `opacity 250ms ease-out ${DRAW_MS}ms`,
                }}
              >
                {fmtInt(values[values.length - 1])} TPS load
              </text>
            </>
          ) : null}

          {/* The fee line: near-flat, with micro fluctuations and pulses flowing along the lane. */}
          <path
            d={linePath(feePts)}
            fill="none"
            stroke="var(--indicator-green)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={linePath(feePts)}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeDasharray="26 162"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lane-flow motion-reduce:animate-none"
          />
          <circle
            cx={endX}
            cy={feeEndY}
            r="3.5"
            fill="var(--indicator-green)"
            stroke="var(--surface-page)"
            strokeWidth="2"
          />
          <text
            x={mobile ? endX - 12 : endX + 12}
            y={mobile ? DIVIDER + 20 : feeEndY + 4}
            textAnchor={mobile ? 'end' : 'start'}
            fill="var(--indicator-green)"
            className="font-mono text-[11px]"
          >
            $0.001 base fee
          </text>
        </svg>
      ) : null}
    </div>
  )
}

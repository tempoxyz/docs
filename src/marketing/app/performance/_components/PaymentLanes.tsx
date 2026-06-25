// biome-ignore-all lint/a11y/noSvgWithoutTitle: The chart SVG is decorative and described by nearby labels.

'use client'

import { useEffect, useState } from 'react'
import { linePath, scaleLinear } from '../_lib/chart'
import { fmtInt, type PerfRun } from '../_lib/runs'
import useMeasure from './useMeasure'

// The payment-lanes story: the chart is split into two always-visible bands to
// show that payments ride in reserved blockspace. The top band carries the real
// settled-TPS series from the nightly feed — general network load that rises and
// falls. The bottom band is the dedicated payment lane, drawn as a steady
// reserved rail with transfer pulses flowing along it: payments keep moving no
// matter how busy the rest of the network gets.
//
// Tempo fees are a fixed base fee (not congestion-priced), so this chart
// deliberately shows NO fee curve — a flat-vs-volatile fee comparison would
// wrongly imply a dynamic, load-based fee market that Tempo does not have.

// No y-axis on this chart, so the bands run flush to the container's left
// edge; the right padding is the lane for the pinned end labels. On mobile that
// lane is collapsed and the end values move into the zone header rows instead.
const PAD = { l: 0, r: 150, t: 20, b: 24 }
const MOBILE_BP = 480
const H = 300
const DIVIDER = 190
const LANE_Y = (DIVIDER + H - PAD.b) / 2 + 6
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
  // The payment lane is a steady reserved rail — a straight line, not a data
  // series — with pulses flowing along it to show payments always moving.
  const lanePts: [number, number][] = [
    [PAD.l, LANE_Y],
    [endX, LANE_Y],
  ]

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
            NETWORK LOAD · NIGHTLY TPS
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
            DEDICATED PAYMENT LANE · RESERVED BLOCKSPACE
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
                {fmtInt(values[values.length - 1])} TPS
              </text>
            </>
          ) : null}

          {/* The reserved payment-lane rail: a steady green line with transfer
              pulses flowing along it. Not a measured series — it represents the
              guaranteed blockspace that keeps payments moving under any load. */}
          <path
            d={linePath(lanePts)}
            fill="none"
            stroke="var(--indicator-green)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={linePath(lanePts)}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeDasharray="26 162"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lane-flow motion-reduce:animate-none"
          />
          <text
            x={mobile ? endX - 12 : endX + 12}
            y={mobile ? DIVIDER + 20 : LANE_Y + 4}
            textAnchor={mobile ? 'end' : 'start'}
            fill="var(--indicator-green)"
            className="font-mono text-[11px]"
          >
            payments keep flowing
          </text>
        </svg>
      ) : null}
    </div>
  )
}

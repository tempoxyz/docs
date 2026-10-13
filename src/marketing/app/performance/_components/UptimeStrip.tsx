'use client'

import { useEffect, useState } from 'react'
import { indicatorFlow } from '../../../../styles/surfaces.styles'
import { fmtInt, type PerfRun } from '../_lib/runs'
import ChartTooltip from './ChartTooltip'
import * as ui from './UptimeStrip.recipes'
import useMeasure from './useMeasure'

// Status-page-style availability strip: one thin cell per UTC night over the
// last 90 nights, all green — the visual form of the uptime claim. Hovering a
// night with a published benchmark observation shows what the network settled
// that night. Cells pop in left-to-right on scroll. The header badge carries the
// live aggregate state from status.tempo.xyz when the server has it.

const DAYS = 90
const H = 48
const BAR_TOP = 6
const BAR_BOTTOM = 42
const GROW_MS = 250
const STAGGER_MS = 400

const nightLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

export default function UptimeStrip({ runs, status }: { runs: PerfRun[]; status: string | null }) {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  // Reduced-motion users start (and stay) fully grown; the SVG only renders
  // after the container is measured, so this never affects server HTML.
  const [grown, setGrown] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // Grow the cells the first time the strip is properly on screen.
  useEffect(() => {
    const el = ref.current
    if (!el || grown) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setGrown(true)
          io.disconnect()
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, grown])

  if (runs.length === 0) return null

  // The strip ends on the latest observed night and runs DAYS back; nights
  // with a published run carry its numbers in the tooltip.
  const runByDay = new Map(runs.map((r) => [r.startedAt.slice(0, 10), r]))
  const end = new Date(`${runs[runs.length - 1].startedAt.slice(0, 10)}T00:00:00Z`)
  const nights = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(end)
    d.setUTCDate(d.getUTCDate() - (DAYS - 1 - i))
    const date = d.toISOString().slice(0, 10)
    return { date, run: runByDay.get(date) ?? null }
  })

  const n = nights.length
  const step = width / n
  const barW = Math.max(Math.min(step - 2.5, 6), 1.5)

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const i = Math.floor((e.clientX - rect.left) / step)
    setHover(Math.min(Math.max(i, 0), n - 1))
  }

  const active = hover === null ? null : nights[hover]

  return (
    <div>
      <div {...ui.uptimeStripLayout()}>
        {status ? (
          <div {...ui.uptimeStripLayout2()}>
            <span
              aria-hidden="true"
              className={` ${ui.uptimeStripText().className} ${
                status === 'operational'
                  ? `indicator-flow ${indicatorFlow().className}`
                  : ui.uptimeStripText2().className
              }`}
            />
            <p {...ui.uptimeStripDescription()}>
              {status === 'operational' ? 'All systems operational' : status.replace(/_/g, ' ')}
            </p>
          </div>
        ) : null}
        <p {...ui.uptimeStripDescription2()}>Last {DAYS} nights</p>
      </div>

      <div
        ref={ref}
        {...ui.uptimeStripLayoutAppearance({
          value0: `${H}px`,
          className: ui.uptimeStripLayout3().className,
        })}
      >
        {width > 0 ? (
          <svg width={width} height={H} {...ui.uptimeStripIcon()} aria-hidden="true">
            {nights.map((night, i) => (
              <rect
                key={night.date}
                x={step * i + (step - barW) / 2}
                y={BAR_TOP}
                width={barW}
                height={BAR_BOTTOM - BAR_TOP}
                rx="1"
                fill="var(--indicator-green)"
                opacity={hover === i ? 1 : 0.65}
                {...ui.uptimeStripRectAppearance({
                  value0: `scaleY(${grown ? 1 : 0})`,
                  value1: `transform ${GROW_MS}ms ease-out ${(i / (n - 1)) * STAGGER_MS}ms`,
                  className: ui.rect().className,
                })}
              />
            ))}

            <rect
              x="0"
              y="0"
              width={width}
              height={H}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        ) : null}

        {active && hover !== null ? (
          <ChartTooltip x={step * hover + step / 2} width={width}>
            <p {...ui.uptimeStripDescription3()}>{nightLabel(active.date)}</p>
            <p {...ui.uptimeStripDescription4()}>Operational</p>
            {active.run ? (
              <p {...ui.uptimeStripDescription5()}>
                {fmtInt(active.run.settledTps)} TPS settled · {fmtInt(active.run.blockCount)} blocks
              </p>
            ) : null}
          </ChartTooltip>
        ) : null}
      </div>

      <div {...ui.uptimeStripLayout4()}>
        <span>{nightLabel(nights[0].date)}</span>
        <span>{nightLabel(nights[n - 1].date)}</span>
      </div>
    </div>
  )
}

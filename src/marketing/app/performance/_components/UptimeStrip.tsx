// biome-ignore-all lint/a11y/noSvgWithoutTitle: The availability strip is decorative and backed by adjacent status text.

'use client'

import { useEffect, useState } from 'react'
import { fmtInt, type PerfRun } from '../_lib/runs'
import ChartTooltip from './ChartTooltip'
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {status ? (
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={`size-2 rounded-full ${
                status === 'operational' ? 'indicator-flow' : 'bg-warning'
              }`}
            />
            <p className="font-mono text-[11px] text-foreground/60 uppercase tracking-wider">
              {status === 'operational' ? 'All systems operational' : status.replace(/_/g, ' ')}
            </p>
          </div>
        ) : null}
        <p className="ml-auto font-mono text-[11px] text-foreground/40 uppercase tracking-wider">
          Last {DAYS} nights
        </p>
      </div>

      <div ref={ref} className="relative w-full" style={{ height: H }}>
        {width > 0 ? (
          <svg width={width} height={H} className="block" aria-hidden>
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
                className="motion-reduce:transition-none"
                style={{
                  transform: `scaleY(${grown ? 1 : 0})`,
                  transformBox: 'fill-box',
                  transformOrigin: 'bottom',
                  transition: `transform ${GROW_MS}ms ease-out ${(i / (n - 1)) * STAGGER_MS}ms`,
                }}
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
            <p className="whitespace-nowrap font-mono text-[11px] text-foreground/40">
              {nightLabel(active.date)}
            </p>
            <p className="mt-1 whitespace-nowrap font-mono text-[13px] text-foreground">
              Operational
            </p>
            {active.run ? (
              <p className="mt-0.5 whitespace-nowrap font-mono text-[11px] text-foreground/40">
                {fmtInt(active.run.settledTps)} TPS settled · {fmtInt(active.run.blockCount)} blocks
              </p>
            ) : null}
          </ChartTooltip>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-foreground/35 uppercase tracking-wider">
        <span>{nightLabel(nights[0].date)}</span>
        <span>{nightLabel(nights[n - 1].date)}</span>
      </div>
    </div>
  )
}

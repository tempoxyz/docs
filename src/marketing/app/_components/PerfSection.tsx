// biome-ignore-all lint/a11y/noSvgWithoutTitle: Section charts are decorative summaries with adjacent text labels.
// biome-ignore-all lint/suspicious/noArrayIndexKey: The uptime sparkline is a fixed static strip with no item state.

import Link from 'next/link'
import type { ReactNode } from 'react'
import { linePath } from '../performance/_lib/chart'
import type { PerfRun } from '../performance/_lib/runs'
import ArrowUpRight from './ArrowUpRight'
import Button from './Button'
import EdgeMarkers from './EdgeMarkers'
import { PALETTE } from './palette'
import Reveal from './Reveal'
import type { Stat } from './stats'

const PERFORMANCE_PAGE = '/performance'

// Sparkline points in a fixed 0–100 viewBox (8% vertical padding). Rendered
// with preserveAspectRatio="none" + non-scaling strokes, so the same path
// fits any card size without client-side measuring.
const sparkPoints = (values: number[]): [number, number][] => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values.map((v, i) => [(i / (values.length - 1)) * 100, 92 - ((v - min) / span) * 84])
}

function TpsSpark({ runs }: { runs: PerfRun[] }) {
  const pts = sparkPoints(runs.map((r) => r.settledTps))
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full" aria-hidden>
      <defs>
        <linearGradient id="spark-tps" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={PALETTE[1]} />
          <stop offset="55%" stopColor={PALETTE[2]} />
          <stop offset="100%" stopColor={PALETTE[3]} />
        </linearGradient>
      </defs>
      <path
        d={linePath(pts)}
        fill="none"
        stroke="url(#spark-tps)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// Compact retelling of the /performance payment-lanes chart: congested
// general blockspace carrying the real settled-TPS series, with the dedicated
// lane's near-flat fee line pulsing below.
function LaneSpark({ runs }: { runs: PerfRun[] }) {
  const pts = sparkPoints(runs.map((r) => r.settledTps))
  const feePointCount = Math.max(runs.length, 16)
  const feePts = Array.from(
    { length: feePointCount },
    (_, i) =>
      [
        (i / (feePointCount - 1)) * 100,
        68 + Math.sin(i * 1.7) * 1.15 + Math.sin(i * 0.55) * 0.55,
      ] as [number, number],
  )

  return (
    <div className="relative h-40 overflow-hidden" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[58%]">
        <div className="absolute inset-0 bg-background" />
        <p className="absolute top-2 left-3 font-mono text-[9px] text-foreground/45 tracking-wider">
          GENERAL BLOCKSPACE
        </p>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-3/5 w-full"
        >
          <path
            d={linePath(pts)}
            fill="none"
            stroke="var(--line-dashed)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-[58%] border-line-strong border-t border-dashed" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-indicator-green/5">
        <p className="absolute top-2 left-3 font-mono text-[9px] text-indicator-green/80 tracking-wider">
          DEDICATED PAYMENT LANE
        </p>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d={linePath(feePts)}
            fill="none"
            stroke="var(--indicator-green)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
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
            vectorEffect="non-scaling-stroke"
            className="lane-flow motion-reduce:animate-none"
          />
        </svg>
      </div>
    </div>
  )
}

// Compact form of the /performance uptime strip: one thin tick per night,
// solid green — the visual form of the uptime claim.
function UptimeSpark() {
  return (
    <div className="flex h-20 items-stretch gap-[2px]" aria-hidden>
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} className="flex-1 rounded-[1px] bg-indicator-green/65" />
      ))}
    </div>
  )
}

function StatCard({
  href,
  label,
  value,
  desc,
  children,
  className = '',
  numberOnly = false,
}: {
  href: string
  label: string
  value: string
  desc: string
  children: ReactNode
  className?: string
  numberOnly?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full min-h-[310px] flex-col border-line border-b px-5 py-6 transition-colors last:border-b-0 hover:bg-surface-card sm:min-h-[360px] lg:px-8 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-[17px] text-foreground leading-[1.2] tracking-[0] lg:text-[20px]">
            {label}
          </p>
          {!numberOnly ? (
            <p className="mt-2 font-sans text-[24px] text-foreground/55 tracking-[-0.01em] lg:text-[28px]">
              {value}
            </p>
          ) : null}
        </div>
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-foreground/25 transition-colors group-hover:text-foreground" />
      </div>
      {numberOnly ? (
        <div className="flex flex-1 items-center py-8">
          <p className="font-sans text-[clamp(3rem,7vw,5.25rem)] text-foreground/55 leading-none tracking-[-0.04em]">
            {value}
          </p>
        </div>
      ) : (
        <div className="my-auto py-8 empty:hidden">{children}</div>
      )}
      <p className="font-sans text-[13px] text-foreground/50 leading-[1.5]">{desc}</p>
    </Link>
  )
}

export default function PerfSection({ stats, runs }: { stats: Stat[]; runs: PerfRun[] }) {
  const mainValue = (category: string, fallback: string) =>
    stats.find((s) => s.category === category)?.main.value ?? fallback

  // Headline numbers come from the live benchmark overlay where the API
  // provides them (Speed, Reliability); the sparklines draw the full nightly
  // feed. Cost and uptime claims stay static.
  const hasFeed = runs.length >= 2
  const cards = [
    {
      href: `${PERFORMANCE_PAGE}#settlement`,
      label: 'Fast, guaranteed settlement',
      value: `${mainValue('Speed', '508')} ms`,
      desc: 'Average time between finalized blocks in the latest benchmark data.',
      spark: null,
      className: 'sm:border-r lg:col-span-2',
      numberOnly: true,
    },
    {
      href: PERFORMANCE_PAGE,
      label: 'High throughput',
      value: `${mainValue('Reliability', '21,200')} TPS`,
      desc: 'Settled transfers per second measured during benchmark runs.',
      spark: hasFeed ? <TpsSpark runs={runs} /> : null,
      className: 'lg:col-span-4',
    },
    {
      href: `${PERFORMANCE_PAGE}#fees`,
      label: 'Predictably low fees',
      value: '$0.001',
      desc: 'Base network fee for a standard stablecoin transfer.',
      spark: hasFeed ? <LaneSpark runs={runs} /> : null,
      className: 'sm:border-r lg:col-span-3',
    },
    {
      href: `${PERFORMANCE_PAGE}#uptime`,
      label: 'Reliable uptime guarantees',
      value: '99.999%',
      desc: 'Network availability target for production payment workloads.',
      spark: <UptimeSpark />,
      className: 'lg:col-span-3',
    },
  ]

  return (
    <section className="relative border-line border-b">
      <EdgeMarkers edge="bottom" wideOnly />
      <Reveal className="flex flex-col items-center px-5 text-center">
        <h2 className="max-w-[700px] font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased">
          Pushing the frontier of blockchain performance.
        </h2>
        <Button href={PERFORMANCE_PAGE} arrow className="mt-9">
          Explore performance
        </Button>
      </Reveal>

      <Reveal className="mt-14">
        <div className="grid border-line border-t sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-6">
          {cards.map((card) => (
            <StatCard
              key={card.label}
              href={card.href}
              label={card.label}
              value={card.value}
              desc={card.desc}
              className={card.className}
              numberOnly={card.numberOnly}
            >
              {card.spark}
            </StatCard>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

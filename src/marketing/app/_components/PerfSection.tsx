import Link from 'next/link'
import type { ReactNode } from 'react'
import { laneFlow } from '../../../styles/surfaces.styles'
import { developersPath } from '../_lib/developersPaths'
import { linePath } from '../performance/_lib/chart'
import { type PerfRun, workloadSegments } from '../performance/_lib/runs'
import ArrowUpRight from './ArrowUpRight'
import Button from './Button'
import EdgeMarkers from './EdgeMarkers'
import * as ui from './PerfSection.recipes'
import { PALETTE } from './palette'
import Reveal from './Reveal'
import type { Stat } from './stats'

const PERFORMANCE_PAGE = developersPath('/performance')

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
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" {...ui.tpsSparkIcon()}>
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
    <div {...ui.laneSparkLayout()} aria-hidden="true">
      <div {...ui.laneSparkLayout2()}>
        <div {...ui.laneSparkLayout3()} />
        <p {...ui.laneSparkDescription()}>GENERAL BLOCKSPACE</p>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          {...ui.laneSparkIcon()}
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
      <div {...ui.laneSparkLayout4()} />
      <div {...ui.laneSparkLayout5()}>
        <p {...ui.laneSparkDescription2()}>DEDICATED PAYMENT LANE</p>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          {...ui.laneSparkIcon2()}
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
            {...ui.path({ className: `lane-flow ${laneFlow().className}` })}
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
    <div {...ui.uptimeSparkLayout()} aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} {...ui.uptimeSparkLayout2()} />
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
    <Link href={href} className={` ${ui.link({ className: 'group' }).className} ${className}`}>
      <div {...ui.statCardLayout()}>
        <div>
          <p {...ui.statCardDescription()}>{label}</p>
          {!numberOnly ? <p {...ui.statCardDescription2()}>{value}</p> : null}
        </div>
        <ArrowUpRight className={ui.arrowUpRight().className} />
      </div>
      {numberOnly ? (
        <div {...ui.statCardLayout2()}>
          <p {...ui.statCardDescription3()}>{value}</p>
        </div>
      ) : (
        <div {...ui.statCardLayout3()}>{children}</div>
      )}
      <p {...ui.statCardDescription4()}>{desc}</p>
    </Link>
  )
}

export default function PerfSection({ stats, runs }: { stats: Stat[]; runs: PerfRun[] }) {
  const mainValue = (category: string, fallback: string) =>
    stats.find((s) => s.category === category)?.main.value ?? fallback

  // Headline numbers come from the latest benchmark. Keep their sparklines
  // within its workload so a preset change does not look like a TPS regression.
  const latestSegment = workloadSegments(runs).at(-1)
  const sparkRuns = latestSegment ? runs.slice(latestSegment.start, latestSegment.end) : []
  const hasFeed = sparkRuns.length >= 2
  const cards = [
    {
      href: `${PERFORMANCE_PAGE}#settlement`,
      label: 'Fast, guaranteed settlement',
      value: `${mainValue('Speed', '508')} ms`,
      desc: 'Average time between finalized blocks in the latest benchmark data.',
      spark: null,
      className: ui.perfSectionStateState().className,
      numberOnly: true,
    },
    {
      href: PERFORMANCE_PAGE,
      label: 'High throughput',
      value: `${mainValue('Reliability', '15,600')} TPS`,
      desc: 'Settled transactions per second in the latest multi-region benchmark.',
      spark: hasFeed ? <TpsSpark runs={sparkRuns} /> : null,
      className: ui.throughputCard().className,
    },
    {
      href: `${PERFORMANCE_PAGE}#fees`,
      label: 'Predictably low fees',
      value: '<$0.001',
      desc: 'Average fee for standard stablecoin transfers.',
      spark: hasFeed ? <LaneSpark runs={sparkRuns} /> : null,
      className: ui.perfSectionStateState2().className,
    },
    {
      href: `${PERFORMANCE_PAGE}#uptime`,
      label: 'Reliable uptime guarantees',
      value: '99.999%',
      desc: 'Network availability target for production payment workloads.',
      spark: <UptimeSpark />,
      className: ui.uptimeCard().className,
    },
  ]

  return (
    <section {...ui.perfSectionSection()}>
      <EdgeMarkers edge="bottom" wideOnly />
      <Reveal className={ui.reveal().className}>
        <h2 {...ui.perfSectionHeading()}>Pushing the frontier of blockchain performance.</h2>
        <Button href={PERFORMANCE_PAGE} arrow className={ui.perfSectionButton().className}>
          Explore performance
        </Button>
      </Reveal>

      <Reveal className={ui.reveal2().className}>
        <div {...ui.perfSectionLayout()}>
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

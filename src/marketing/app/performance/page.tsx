import type { Metadata } from 'next'
import { type ReactNode, useEffect, useState } from 'react'
import ArrowUpRight from '../_components/ArrowUpRight'
import Button from '../_components/Button'
import Footer from '../_components/Footer'
import Header from '../_components/Header'
import Reveal from '../_components/Reveal'
import PaymentLanes from './_components/PaymentLanes'
import SettlementStream from './_components/SettlementStream'
import TpsTrendChart from './_components/TpsTrendChart'
import TpsTrendChartFrame from './_components/TpsTrendChartFrame'
import UptimeStrip from './_components/UptimeStrip'
import { fetchPerfRuns, fmtInt, type PerfRun } from './_lib/runs'

export const metadata: Metadata = {
  title: 'Performance — Tempo Developers',
  description:
    'Nightly benchmarks on a live Tempo network: throughput, block times, and execution rates, published as raw runs.',
}

const STATUS_PAGE_URL = 'https://status.tempo.xyz'
const PERF_DASHBOARD_URL = 'https://perf.tempo.xyz/'
const DAY_MS = 24 * 60 * 60 * 1000
const HERO_STAT_LABELS = ['Transactions per second', 'Avg block time', 'Base fee']
const SETTLEMENT_SKELETON_CELLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const UPTIME_SKELETON_BARS = Array.from({ length: 90 }, (_, i) => `bar-${i}`)
const prefetchedRuns = typeof window !== 'undefined' ? fetchPerfRuns() : null

function formatChartRange(startedAt: string, endedAt: string) {
  const start = new Date(startedAt)
  const end = new Date(endedAt)
  const daySpan = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS))
  const startLabel = start.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const endLabel = end.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return `Benchmark runs · Past ${daySpan} ${
    daySpan === 1 ? 'day' : 'days'
  } · ${startLabel} - ${endLabel} UTC`
}

// Aggregate state ("operational", "downtime", …) from the BetterStack status
// page's public JSON; null when unreachable so the uptime strip falls back to
// a neutral header.
async function fetchStatusState(): Promise<string | null> {
  try {
    const res = await fetch(`${STATUS_PAGE_URL}/index.json`)
    if (!res.ok) return null
    const data = (await res.json()) as {
      data?: { attributes?: { aggregate_state?: string } }
    }
    return data.data?.attributes?.aggregate_state ?? null
  } catch {
    return null
  }
}

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string
  title: string
  note: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-12 border-line border-b px-5 py-16 lg:px-8">
      <Reveal>
        <h2 className="font-sans text-[24px] text-foreground tracking-[0]">{title}</h2>
        <p className="mt-3 max-w-[640px] font-sans text-[16px] text-foreground/50 leading-[1.5]">
          {note}
        </p>
        <div className="mt-10">{children}</div>
      </Reveal>
    </section>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse bg-surface-skeleton/35 motion-reduce:animate-none ${className}`}
    />
  )
}

function HeroChartSkeleton() {
  return (
    <Reveal delay={150} className="mt-16">
      <TpsTrendChartFrame />
      <div className="mt-5 text-center">
        <p className="font-sans text-[20px] text-foreground leading-tight tracking-[0]">
          Transactions per second
        </p>
        <SkeletonBlock className="mx-auto mt-2 h-4 w-[300px] max-w-[70vw]" />
      </div>
    </Reveal>
  )
}

function HeroChartUnavailable() {
  return (
    <Reveal className="mt-16">
      <div className="flex h-[360px] items-center justify-center border-line border-y bg-surface-block/40 px-5 text-center">
        <p className="max-w-[420px] font-mono text-[12px] text-foreground/40 leading-[1.6]">
          Benchmark feed unavailable. Charts will return when the API is reachable.
        </p>
      </div>
    </Reveal>
  )
}

function HeroStatsSkeleton() {
  return (
    <Reveal>
      <div className="grid grid-cols-3 border-line border-b">
        {HERO_STAT_LABELS.map((label, i) => (
          <div
            key={label}
            className={`px-3 py-6 sm:px-5 lg:px-8 ${i > 0 ? 'border-line border-l' : ''}`}
          >
            <p className="min-h-[2.75em] font-sans text-[15px] text-foreground leading-snug tracking-[0]">
              {label}
            </p>
            <SkeletonBlock className="mt-3 h-8 w-28" />
          </div>
        ))}
      </div>
    </Reveal>
  )
}

function SettlementStreamSkeleton() {
  return (
    <div className="relative h-[180px] w-full overflow-hidden" aria-hidden>
      <SkeletonBlock className="absolute top-[26px] right-0 h-3 w-24" />
      <div className="absolute top-[58px] right-0 flex gap-[14px]">
        {SETTLEMENT_SKELETON_CELLS.map((cell) => (
          <div key={cell} className="size-16 border border-line-strong bg-surface-panel">
            <SkeletonBlock className="mx-auto mt-5 h-2 w-8" />
            <SkeletonBlock className="mx-auto mt-3 h-2 w-10" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-shell to-transparent" />
      <div className="absolute right-8 bottom-2 flex w-[78px] items-center">
        <span className="h-2 w-px bg-foreground/25" />
        <span className="h-px flex-1 bg-foreground/25" />
        <span className="h-2 w-px bg-foreground/25" />
      </div>
    </div>
  )
}

function PaymentLanesSkeleton() {
  const gridLines = [70, 120, 240]

  return (
    <div className="relative h-[300px] w-full overflow-hidden" aria-hidden>
      <div className="zone-breathe absolute inset-x-0 top-5 h-[170px] bg-background motion-reduce:animate-none" />
      <SkeletonBlock className="absolute top-10 left-3 h-2 w-48" />
      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <title>Payment lanes placeholder</title>
        {gridLines.map((y) => (
          <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="var(--line)" strokeOpacity="0.65" />
        ))}
        <line
          x1="0"
          x2="1000"
          y1="190"
          y2="190"
          stroke="var(--line-strong)"
          strokeDasharray="3 4"
        />
      </svg>
      <div className="absolute inset-x-0 top-[190px] bottom-6 bg-indicator-green/5" />
      <SkeletonBlock className="absolute top-[210px] left-3 h-2 w-44" />
    </div>
  )
}

function UptimeStripSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex items-center justify-between gap-3">
        <SkeletonBlock className="h-3 w-40" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <div className="flex h-12 items-stretch gap-[2px]">
        {UPTIME_SKELETON_BARS.map((bar) => (
          <span
            key={bar}
            className="flex-1 animate-pulse rounded-[1px] bg-indicator-green/35 motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <SkeletonBlock className="h-2 w-12" />
        <SkeletonBlock className="h-2 w-12" />
      </div>
    </div>
  )
}

function PerformanceSectionsSkeleton() {
  return (
    <>
      <Section
        id="settlement"
        title="Guaranteed settlement in half a second."
        note="The moment a payment is included in a block, it's settled in less than 500ms. No reorgs, no waiting out confirmations, no probabilistic guessing."
      >
        <SettlementStreamSkeleton />
      </Section>

      <Section
        id="fees"
        title="A dedicated lane for payments."
        note="Tempo reserves blockspace for payments, so trading spikes, airdrops, and other unrelated network activity do not set the price for ordinary transfers. Payments stay prioritized in their own lane, with fees that remain predictably low under load."
      >
        <PaymentLanesSkeleton />
        <SkeletonBlock className="mt-10 h-10 w-56" />
      </Section>

      <Section
        id="uptime"
        title="Infrastructure that you can rely on"
        note="Tempo takes uptime seriously, with network operations designed for 24/7 availability. Continuous block production, monitoring, and incident response keep payment infrastructure online when developers need it."
      >
        <UptimeStripSkeleton />
        <SkeletonBlock className="mt-10 h-10 w-40" />
      </Section>
    </>
  )
}

export default function PerformancePage() {
  const [runs, setRuns] = useState<PerfRun[]>([])
  const [statusState, setStatusState] = useState<string | null>(null)
  const [runsLoaded, setRunsLoaded] = useState(false)

  useEffect(() => {
    let active = true
    const runsRequest = prefetchedRuns ?? fetchPerfRuns()

    runsRequest
      .catch(() => [])
      .then((perfRuns) => {
        if (!active) return
        setRuns(perfRuns)
        setRunsLoaded(true)
      })

    fetchStatusState().then((status) => {
      if (!active) return
      setStatusState(status)
    })

    return () => {
      active = false
    }
  }, [])

  const latest = runs[runs.length - 1]
  const hasRuns = runs.length >= 2
  const chartRange = latest && runs[0] ? formatChartRange(runs[0].startedAt, latest.startedAt) : ''

  const heroStats = latest
    ? [
        {
          label: 'Transactions per second',
          value: fmtInt(latest.settledTps),
        },
        {
          label: 'Avg block time',
          value: `${fmtInt(latest.blockTimeMs)} ms`,
        },
        {
          label: 'Base fee',
          value: '$0.001',
        },
      ]
    : []

  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />

        {/* Hero: headline + live gradient chart of the full nightly feed */}
        <section className="relative border-line border-b px-5 pt-20 pb-12 lg:px-8 lg:pt-28">
          <Reveal className="flex flex-col items-center text-center">
            <h1 className="max-w-[880px] text-balance font-sans text-[clamp(2.5rem,6vw,3.5rem)] text-foreground leading-[1.05] tracking-[-0.03em] antialiased">
              Pushing the frontier of blockchain performance.
            </h1>
          </Reveal>

          {!runsLoaded ? (
            <HeroChartSkeleton />
          ) : hasRuns ? (
            <Reveal delay={150} className="mt-16">
              <TpsTrendChart runs={runs} />
              <div className="mt-10 text-center">
                <p className="font-sans text-[20px] text-foreground leading-tight tracking-[0]">
                  Transactions per second
                </p>
                <p className="mt-1 font-sans text-[14px] text-foreground/45 leading-[1.4]">
                  {chartRange}
                </p>
              </div>
            </Reveal>
          ) : (
            <HeroChartUnavailable />
          )}
        </section>

        {/* Headline metrics. */}
        {!runsLoaded ? (
          <HeroStatsSkeleton />
        ) : heroStats.length > 0 ? (
          <Reveal>
            <div className="grid grid-cols-3 border-line border-b">
              {heroStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`px-3 py-6 sm:px-5 lg:px-8 ${i > 0 ? 'border-line border-l' : ''}`}
                >
                  <p className="min-h-[2.75em] font-sans text-[15px] text-foreground leading-snug tracking-[0]">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-sans text-[24px] text-foreground tracking-[-0.01em] lg:text-[28px]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}

        {!runsLoaded ? (
          <PerformanceSectionsSkeleton />
        ) : hasRuns ? (
          <>
            <Section
              id="settlement"
              title="Guaranteed settlement in half a second."
              note="The moment a payment is included in a block, it's settled in less than 500ms. No reorgs, no waiting out confirmations, no probabilistic guessing."
            >
              <SettlementStream runs={runs} />
            </Section>

            {/* Payment lanes: the protocol feature behind the flat fee line. */}
            <Section
              id="fees"
              title="A dedicated lane for payments."
              note="Tempo reserves blockspace for payments, so trading spikes, airdrops, and other unrelated network activity do not set the price for ordinary transfers. Payments stay prioritized in their own lane, with fees that remain predictably low under load."
            >
              <PaymentLanes runs={runs} />
              <Button
                href="/docs/protocol/blockspace/payment-lane-specification"
                className="mt-10"
                arrow
              >
                Payment lane architecture
              </Button>
            </Section>

            <Section
              id="uptime"
              title="Infrastructure that you can rely on"
              note="Tempo takes uptime seriously, with network operations designed for 24/7 availability. Continuous block production, monitoring, and incident response keep payment infrastructure online when developers need it."
            >
              <UptimeStrip runs={runs} status={statusState} />
              <Button href={STATUS_PAGE_URL} className="mt-10" arrow>
                status.tempo.xyz
              </Button>
            </Section>
          </>
        ) : null}

        <section id="dashboard" className="scroll-mt-12 border-line border-b">
          <Reveal>
            <a
              href={PERF_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-8 px-5 py-16 transition-colors hover:bg-surface-block focus-visible:bg-surface-block focus-visible:outline-none lg:flex-row lg:items-start lg:justify-between lg:px-8"
            >
              <span>
                <span className="block font-sans text-[24px] text-foreground tracking-[0]">
                  Tempo is continuously evolving.
                </span>
                <span className="mt-3 block max-w-[760px] font-sans text-[16px] text-foreground/50 leading-[1.5] transition-colors group-hover:text-foreground/65 group-focus-visible:text-foreground/65">
                  Tempo keeps pushing the limits of execution and transaction throughput. The public
                  performance dashboard has the details and updates nightly as the node software
                  underlying Tempo improves.
                </span>
              </span>
              <span className="flex items-center gap-2 font-sans text-[14px] text-foreground/55 tracking-[0] transition-colors group-hover:text-foreground group-focus-visible:text-foreground">
                Open performance dashboard
                <ArrowUpRight className="size-[14px] shrink-0" />
              </span>
            </a>
          </Reveal>
        </section>

        <div className="mt-[100px]">
          <Footer />
        </div>
      </div>
    </main>
  )
}

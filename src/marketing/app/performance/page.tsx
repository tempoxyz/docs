import { type ReactNode, useEffect, useState } from 'react'
import { cx as composeStyles } from 'zyzz'
import { zoneBreathe } from '../../../styles/surfaces.styles'
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
import * as ui from './page.recipes'

const STATUS_PAGE_URL = 'https://status.tempo.xyz'
const PERF_DASHBOARD_URL = 'https://perf.tempo.xyz/'
const HERO_STAT_LABELS = ['Transactions per second', 'Avg block time', 'Average fee']
const SETTLEMENT_SKELETON_CELLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const UPTIME_SKELETON_BARS = Array.from({ length: 90 }, (_, i) => `bar-${i}`)
const prefetchedRuns = typeof window !== 'undefined' ? fetchPerfRuns() : null

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
    <section id={id} {...ui.sectionSection()}>
      <Reveal>
        <h2 {...ui.sectionHeading()}>{title}</h2>
        <p {...ui.sectionDescription()}>{note}</p>
        <div {...ui.sectionLayout()}>{children}</div>
      </Reveal>
    </section>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return <span aria-hidden="true" className={` ${ui.skeletonBlockText().className} ${className}`} />
}

function HeroChartSkeleton() {
  return (
    <Reveal delay={150} className={ui.reveal().className}>
      <TpsTrendChartFrame />
      <div {...ui.heroChartSkeletonLayout()}>
        <p {...ui.heroChartSkeletonDescription()}>Transactions per second</p>
        <SkeletonBlock className={ui.skeletonBlock().className} />
      </div>
    </Reveal>
  )
}

function HeroChartUnavailable() {
  return (
    <Reveal className={ui.reveal().className}>
      <div {...ui.heroChartUnavailableLayout()}>
        <p {...ui.heroChartUnavailableDescription()}>
          Benchmark feed unavailable. Charts will return when the API is reachable.
        </p>
      </div>
    </Reveal>
  )
}

function HeroStatsSkeleton() {
  return (
    <Reveal>
      <div {...ui.heroStatsSkeletonLayout()}>
        {HERO_STAT_LABELS.map((label, i) => (
          <div
            key={label}
            {...composeStyles(
              ui.heroStatsSkeletonLayout2(),
              !!(i > 0) && ui.heroStatsSkeletonLayout3(),
            )}
          >
            <p {...ui.heroStatsSkeletonDescription()}>{label}</p>
            <SkeletonBlock className={ui.skeletonBlock2().className} />
          </div>
        ))}
      </div>
    </Reveal>
  )
}

function SettlementStreamSkeleton() {
  return (
    <div {...ui.settlementStreamSkeletonLayout()} aria-hidden="true">
      <SkeletonBlock className={ui.skeletonBlock3().className} />
      <div {...ui.settlementStreamSkeletonLayout2()}>
        {SETTLEMENT_SKELETON_CELLS.map((cell) => (
          <div key={cell} {...ui.settlementStreamSkeletonLayout3()}>
            <SkeletonBlock className={ui.skeletonBlock4().className} />
          </div>
        ))}
      </div>
      <div {...ui.settlementStreamSkeletonLayout4()} />
      <div {...ui.settlementStreamSkeletonLayout5()}>
        <span {...ui.settlementStreamSkeletonText()} />
        <span {...ui.settlementStreamSkeletonText2()} />
        <span {...ui.settlementStreamSkeletonText()} />
      </div>
    </div>
  )
}

function PaymentLanesSkeleton() {
  const gridLines = [70, 120, 240]

  return (
    <div {...ui.paymentLanesSkeletonLayout()} aria-hidden="true">
      <div
        {...ui.paymentLanesSkeletonLayout2({
          className: `zone-breathe ${zoneBreathe().className}`,
        })}
      />
      <SkeletonBlock className={ui.skeletonBlock5().className} />
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" {...ui.paymentLanesSkeletonIcon()}>
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
      <div {...ui.paymentLanesSkeletonLayout3()} />
      <SkeletonBlock className={ui.skeletonBlock6().className} />
    </div>
  )
}

function UptimeStripSkeleton() {
  return (
    <div aria-hidden="true">
      <div {...ui.uptimeStripSkeletonLayout()}>
        <SkeletonBlock className={ui.skeletonBlock7().className} />
        <SkeletonBlock className={ui.skeletonBlock8().className} />
      </div>
      <div {...ui.uptimeStripSkeletonLayout2()}>
        {UPTIME_SKELETON_BARS.map((bar) => (
          <span key={bar} {...ui.uptimeStripSkeletonText()} />
        ))}
      </div>
      <div {...ui.uptimeStripSkeletonLayout3()}>
        <SkeletonBlock className={ui.skeletonBlock9().className} />
        <SkeletonBlock className={ui.skeletonBlock9().className} />
      </div>
    </div>
  )
}

function PerformanceSectionsSkeleton() {
  return (
    <>
      <Section
        id="settlement"
        title="Fast, guaranteed settlement."
        note="Tempo gives payments fast, final settlement. Once a payment lands in a finalized block, it can be treated as settled."
      >
        <SettlementStreamSkeleton />
      </Section>

      <Section
        id="fees"
        title="A dedicated lane for payments."
        note="Tempo gives payment transactions reserved blockspace with a separate consensus gas limit, so spikes in other activity cannot crowd them out. Fees are fixed, not congestion-priced: a TIP-20 transfer stays under $0.001 regardless of network load."
      >
        <PaymentLanesSkeleton />
        <SkeletonBlock className={ui.skeletonBlock10().className} />
      </Section>

      <Section
        id="uptime"
        title="Infrastructure that you can rely on"
        note="Tempo takes uptime seriously, with network operations designed for 24/7 availability. Continuous block production, monitoring, and incident response keep payment infrastructure online when developers need it."
      >
        <UptimeStripSkeleton />
        <SkeletonBlock className={ui.skeletonBlock11().className} />
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
  const hasChartRuns = runs.length >= 2

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
          label: 'Average fee',
          value: '<$0.001',
        },
      ]
    : []

  return (
    <main {...ui.main()}>
      <div {...ui.performancePageLayout()}>
        <Header />

        {/* Hero: headline + multi-region nightly history */}
        <section {...ui.performancePageSection()}>
          <Reveal className={ui.reveal2().className}>
            <h1 {...ui.performancePageTitle()}>Pushing the frontier of blockchain performance.</h1>
          </Reveal>

          {!runsLoaded ? (
            <HeroChartSkeleton />
          ) : hasChartRuns ? (
            <Reveal delay={150} className={ui.reveal().className}>
              <TpsTrendChart runs={runs} />
              <div {...ui.performancePageLayout2()}>
                <p {...ui.heroChartSkeletonDescription()}>Transactions per second</p>
                <p {...ui.performancePageDescription()}>Multi-region benchmark history</p>
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
            <div {...ui.heroStatsSkeletonLayout()}>
              {heroStats.map((stat, i) => (
                <div
                  key={stat.label}
                  {...composeStyles(
                    ui.heroStatsSkeletonLayout2(),
                    !!(i > 0) && ui.heroStatsSkeletonLayout3(),
                  )}
                >
                  <p {...ui.heroStatsSkeletonDescription()}>{stat.label}</p>
                  <p {...ui.performancePageDescription2()}>{stat.value}</p>
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
              title="Fast, guaranteed settlement."
              note="Tempo gives payments fast, final settlement. Once a payment lands in a finalized block, it can be treated as settled."
            >
              <SettlementStream />
            </Section>

            {/* Payment lanes: the protocol feature behind the flat fee line. */}
            <Section
              id="fees"
              title="A dedicated lane for payments."
              note="Tempo gives payment transactions reserved blockspace with a separate consensus gas limit, so spikes in other activity cannot crowd them out. Fees are fixed, not congestion-priced: a TIP-20 transfer stays under $0.001 regardless of network load."
            >
              <PaymentLanes runs={runs} />
              <Button
                href="/docs/protocol/blockspace/payment-lane-specification"
                className={ui.sectionLayout().className}
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
              <Button href={STATUS_PAGE_URL} className={ui.sectionLayout().className} arrow>
                status.tempo.xyz
              </Button>
            </Section>
          </>
        ) : null}

        <section id="dashboard" {...ui.performancePageSection2()}>
          <Reveal>
            <a
              href={PERF_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              {...ui.performancePageLink({ className: 'group' })}
            >
              <span>
                <span {...ui.performancePageText()}>Tempo is continuously evolving.</span>
                <span {...ui.performancePageText2()}>
                  Tempo keeps pushing the limits of execution and transaction throughput. The public
                  performance dashboard has the details and updates nightly as the node software
                  underlying Tempo improves.
                </span>
              </span>
              <span {...ui.performancePageText3()}>
                Open performance dashboard
                <ArrowUpRight className={ui.arrowUpRight().className} />
              </span>
            </a>
          </Reveal>
        </section>

        <div {...ui.performancePageLayout3()}>
          <Footer />
        </div>
      </div>
    </main>
  )
}

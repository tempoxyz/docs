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
        <p className="mt-3 max-w-[640px] font-sans text-[16px] text-white/50 leading-[1.5]">
          {note}
        </p>
        <div className="mt-10">{children}</div>
      </Reveal>
    </section>
  )
}

export default function PerformancePage() {
  const [runs, setRuns] = useState<PerfRun[]>([])
  const [statusState, setStatusState] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([fetchPerfRuns(), fetchStatusState()]).then(([perfRuns, status]) => {
      if (!active) return
      setRuns(perfRuns)
      setStatusState(status)
    })
    return () => {
      active = false
    }
  }, [])

  const latest = runs[runs.length - 1]
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

          {runs.length >= 2 ? (
            <Reveal delay={150} className="mt-16">
              <TpsTrendChart runs={runs} />
              <div className="mt-5 text-center">
                <p className="font-sans text-[20px] text-foreground leading-tight tracking-[0]">
                  Transactions per second
                </p>
                <p className="mt-1 font-sans text-[14px] text-white/45 leading-[1.4]">
                  {chartRange}
                </p>
              </div>
            </Reveal>
          ) : (
            <p className="mt-16 font-mono text-[12px] text-white/40">
              Benchmark feed unavailable. Charts will return when the API is reachable.
            </p>
          )}
        </section>

        {/* Headline metrics. */}
        {heroStats.length > 0 ? (
          <Reveal>
            <div className="grid grid-cols-2 border-line border-b lg:grid-cols-3">
              {heroStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`px-5 py-6 lg:px-8 ${i > 0 ? 'border-line border-l max-lg:odd:border-l-0 max-lg:[&:nth-child(n+3)]:border-t' : ''}`}
                >
                  <p className="font-sans text-[15px] text-foreground tracking-[0]">{stat.label}</p>
                  <p className="mt-2 font-sans text-[24px] text-foreground tracking-[-0.01em] lg:text-[28px]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}

        {runs.length >= 2 ? (
          <>
            <Section
              id="settlement"
              title="Guaranteed settlement in half a second."
              note="The moment a payment is included in a block, it's settled. No reorgs, no waiting out confirmations, no probabilistic guessing. Tempo's consensus finalizes every block in about 500 ms."
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
                <span className="mt-3 block max-w-[760px] font-sans text-[16px] text-white/50 leading-[1.5] transition-colors group-hover:text-white/65 group-focus-visible:text-white/65">
                  Tempo keeps pushing the limits of execution and transaction throughput. The public
                  performance dashboard has the details and updates nightly as the node software
                  underlying Tempo improves.
                </span>
              </span>
              <span className="flex items-center gap-2 font-sans text-[14px] text-white/55 tracking-[0] transition-colors group-hover:text-foreground group-focus-visible:text-foreground">
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

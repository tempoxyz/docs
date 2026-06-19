// Single source of truth for the four benchmark stats, shared by the
// PerformancePanel (tabs/metric) and the Hero's rotating StatTicker.
// `stats` holds the static copy and fallback values; `fetchStats()` overlays
// live metrics from the perf API's latest nightly run.

export type Stat = {
  category: string
  title: string
  // Footer caption shown under the panel when this stat is active.
  caption: string
  // Compact form shown in the panel's top-left box when another tab is active.
  small: { label: string; value: string }
  // Headline form shown as the panel's big metric when this tab is active.
  main: { label: string; value: string; unit?: string }
  // Muted suffix used in the Hero ticker after the bright value (e.g. "1.25 Ggas/s peak execution").
  tickerLabel: string
}

export const stats: Stat[] = [
  {
    category: 'Speed',
    title: '< 500ms transaction time',
    caption: 'Tempo sustained sub-second block times under continuous benchmark load',
    small: { label: 'BLOCK TIME', value: '508ms' },
    main: { label: 'AVG BLOCK TIME', value: '508', unit: 'ms' },
    tickerLabel: 'average block time',
  },
  {
    category: 'Cost',
    title: '0.001 USD base fee',
    caption: 'Built for payment volumes where every fraction of a cent matters.',
    small: { label: 'COST', value: '0.001 USD base fee' },
    main: { label: 'COST TO SPONSOR 10M USERS', value: '$1.8M' },
    tickerLabel: 'to sponsor 10M users',
  },
  {
    category: 'Performance',
    title: '20k+ TPS',
    caption: "Tempo's highest observed execution rate under peak benchmark load",
    small: { label: 'PEAK TPS', value: '21,200' },
    main: { label: 'PEAK PERFORMANCE CAPACITY', value: '1.25', unit: 'Ggas/s' },
    tickerLabel: 'peak execution rate',
  },
  {
    category: 'Reliability',
    title: '99.999 uptime',
    caption:
      'Tempo settled ~92% of submitted benchmark load while sustaining high-volume throughput.',
    small: { label: 'SETTLED TPS', value: '17,311' },
    main: { label: 'SETTLED TPS', value: '21,200', unit: 'TPS' },
    tickerLabel: 'settled at peak load',
  },
]

// Bright value + unit as one string, e.g. "1.25 Ggas/s".
export function statValue(stat: Stat): string {
  return stat.main.unit ? `${stat.main.value} ${stat.main.unit}` : stat.main.value
}

// Nightly TIP-20 benchmark runs. PR-preview deployment for now — swap for the
// production URL when it lands.
const PERF_API_URL =
  'https://pr-77-tempo-apps-internal-perf-public.tempo-dev.workers.dev/api/perf/runs?feed=nightly&limit=1&scenario_id=tip20-50k'

type PerfRuns = {
  runs?: {
    finishedAt?: string
    metrics?: {
      settledTps: number
      avgGasPerSecond: number
      peakGasPerSecond: number
      avgBlockTimeMs: number
    }
  }[]
}

export type PerfData = {
  stats: Stat[]
  // When the latest benchmark run finished, preformatted for display
  // (e.g. "JUN 9, 03:28 UTC"); null when serving fallback values.
  updatedAt: string | null
}

// Fixed locale + UTC so the server-rendered string never depends on where it
// renders (avoids hydration mismatches).
const formatRunDate = (iso: string) =>
  `${new Date(iso)
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
    .toUpperCase()} UTC`

// Server-side only (call from a server component). Returns the static stats
// with live metrics overlaid where the API has them; Cost and all copy
// (titles, captions) stay static. Falls back to the static values wholesale
// if the API is down or the shape changes.
export async function fetchStats(): Promise<PerfData> {
  const fallback: PerfData = { stats, updatedAt: null }
  try {
    const res = await fetch(PERF_API_URL)
    if (!res.ok) return fallback
    const data = (await res.json()) as PerfRuns
    const run = data.runs?.[0]
    const m = run?.metrics
    if (!m) return fallback

    const blockMs = `${Math.round(m.avgBlockTimeMs)}`
    const settled = Math.round(m.settledTps).toLocaleString('en-US')
    const peakGgas = (m.peakGasPerSecond / 1e9).toFixed(2)
    const avgGgas = (m.avgGasPerSecond / 1e9).toFixed(2)

    const live = stats.map((stat) => {
      switch (stat.category) {
        case 'Speed':
          return {
            ...stat,
            small: { ...stat.small, value: `${blockMs}ms` },
            main: { ...stat.main, value: blockMs },
          }
        case 'Performance':
          // The API has no peak-TPS metric, so the compact stat shows the
          // average execution rate alongside the headline peak.
          return {
            ...stat,
            small: { label: 'AVG EXECUTION', value: `${avgGgas} Ggas/s` },
            main: { ...stat.main, value: peakGgas },
          }
        case 'Reliability':
          return {
            ...stat,
            small: { ...stat.small, value: settled },
            main: { ...stat.main, value: settled },
          }
        default:
          return stat
      }
    })
    return {
      stats: live,
      updatedAt: run.finishedAt ? formatRunDate(run.finishedAt) : null,
    }
  } catch {
    return fallback
  }
}

// Full nightly benchmark history from the perf API. The homepage's
// fetchStats() (app/_components/stats.ts) overlays only the latest run;
// this module fetches the whole feed for the /performance charts.

const PERF_API_URL =
  'https://pr-77-tempo-apps-internal-perf-public.tempo-dev.workers.dev/api/perf/runs?feed=nightly&limit=100'

type ApiRun = {
  id?: string
  scenario?: { id?: string; label?: string; workload?: string }
  source?: { ref?: string; commitSha?: string }
  startedAt?: string
  finishedAt?: string
  targetTps?: number
  metrics?: {
    settledTps?: number
    avgGasPerSecond?: number
    peakGasPerSecond?: number
    avgBlockTimeMs?: number
    blockCount?: number
  }
}

export type PerfRun = {
  id: string
  startedAt: string
  dateLabel: string // "Jun 11"
  timeLabel: string // "03:14 UTC"
  commit: string // short sha
  scenarioId: string
  scenarioLabel: string
  workload: string
  targetTps: number
  settledTps: number
  avgGas: number // gas/s
  peakGas: number // gas/s
  blockTimeMs: number
  blockCount: number
  durationMin: number
}

// Fixed locale + UTC so server-rendered strings never depend on where they
// render (avoids hydration mismatches).
const dateLabel = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

const timeLabel = (iso: string) =>
  `${new Date(iso).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })} UTC`

// Oldest → newest (the API returns newest first). Empty array when the API
// is down or the shape changes; callers render a fallback notice.
export async function fetchPerfRuns(): Promise<PerfRun[]> {
  try {
    const res = await fetch(PERF_API_URL)
    if (!res.ok) return []
    const data = (await res.json()) as { runs?: ApiRun[] }
    return (data.runs ?? [])
      .filter((r): r is Required<Pick<ApiRun, 'startedAt' | 'metrics'>> & ApiRun =>
        Boolean(r.startedAt && r.metrics?.settledTps),
      )
      .map((r) => ({
        id: r.id ?? r.startedAt,
        startedAt: r.startedAt,
        dateLabel: dateLabel(r.startedAt),
        timeLabel: timeLabel(r.startedAt),
        commit: (r.source?.commitSha ?? '').slice(0, 7),
        scenarioId: r.scenario?.id ?? 'unknown',
        scenarioLabel: r.scenario?.label ?? 'Benchmark',
        workload: r.scenario?.workload ?? '',
        targetTps: r.targetTps ?? 0,
        settledTps: r.metrics.settledTps ?? 0,
        avgGas: r.metrics.avgGasPerSecond ?? 0,
        peakGas: r.metrics.peakGasPerSecond ?? 0,
        blockTimeMs: r.metrics.avgBlockTimeMs ?? 0,
        blockCount: r.metrics.blockCount ?? 0,
        durationMin:
          r.finishedAt && r.startedAt
            ? Math.round(
                (new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime()) / 60_000,
              )
            : 0,
      }))
      .reverse()
  } catch {
    return []
  }
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US')

export const fmtGgas = (gasPerSecond: number) => (gasPerSecond / 1e9).toFixed(2)

// Signed percent change, e.g. "+4.2%" / "−1.8%" (typographic minus).
export const fmtDelta = (current: number, previous: number) => {
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%`
}

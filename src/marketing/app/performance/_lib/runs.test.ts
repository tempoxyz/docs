import { afterEach, expect, test, vi } from 'vitest'
import { fetchStats } from '../../_components/stats'
import { fetchPerfRuns, workloadSegments } from './runs'

afterEach(() => vi.unstubAllGlobals())
const run = (id: string, scenario: string, startedAt: string) => ({
  id,
  startedAt,
  scenario: {
    id: scenario,
    label: scenario,
    workload: scenario === 'public-mix-multi-region' ? '80/5/15' : 'Transfers',
  },
  metrics: { settledTps: 15000, avgBlockTimeMs: 500 },
})
test('history and headline use the scheduled multi-region public mix', async () => {
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      series: 'multi-region',
      runs: [
        run('new2', 'public-mix-multi-region', '2026-09-24'),
        run('new', 'public-mix-multi-region', '2026-09-23'),
        run('old', 'public-mix-multi-region', '2026-09-10'),
      ],
    }),
  })
  vi.stubGlobal('fetch', fetch)
  const runs = await fetchPerfRuns()
  await fetchStats()
  expect(
    fetch.mock.calls.every(([url]) => new URL(url).searchParams.get('series') === 'multi-region'),
  ).toBe(true)
  expect(runs.map((r) => r.scenarioId)).toEqual([
    'public-mix-multi-region',
    'public-mix-multi-region',
    'public-mix-multi-region',
  ])
  expect(workloadSegments(runs)).toEqual([{ start: 0, end: 3 }])
})
test('chart segments remain separate if the feed changes workload later', () => {
  const runs = [{ scenarioId: 'old' }, { scenarioId: 'old' }, { scenarioId: 'new' }] as Parameters<
    typeof workloadSegments
  >[0]
  expect(workloadSegments(runs)).toEqual([
    { start: 0, end: 2 },
    { start: 2, end: 3 },
  ])
})
test('does not display an unfiltered response from an API predating series support', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ runs: [run('other', 'mix-10k', '2026-09-23')] }),
    }),
  )
  expect(await fetchPerfRuns()).toEqual([])
  expect((await fetchStats()).updatedAt).toBeNull()
})

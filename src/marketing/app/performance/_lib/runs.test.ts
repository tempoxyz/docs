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
    workload: scenario === 'public-mix' ? '80/5/15' : 'Transfers',
  },
  metrics: { settledTps: 15000, avgBlockTimeMs: 500 },
})
test('history and headline consume the same canonical feed and preserve workload changes', async () => {
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      series: 'default',
      runs: [
        run('new2', 'public-mix', '2026-09-24'),
        run('new', 'public-mix', '2026-09-23'),
        run('old', 'public', '2026-09-22'),
      ],
    }),
  })
  vi.stubGlobal('fetch', fetch)
  const runs = await fetchPerfRuns()
  await fetchStats()
  expect(
    fetch.mock.calls.every(([url]) => new URL(url).searchParams.get('series') === 'default'),
  ).toBe(true)
  expect(runs.map((r) => r.scenarioId)).toEqual(['public', 'public-mix', 'public-mix'])
  expect(workloadSegments(runs)).toEqual([
    { start: 0, end: 1 },
    { start: 1, end: 3 },
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

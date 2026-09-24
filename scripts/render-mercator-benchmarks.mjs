import { readFileSync, writeFileSync } from 'node:fs'

const data = JSON.parse(
  readFileSync(new URL('../public/blog/mercator-benchmarks.json', import.meta.url), 'utf8'),
)
const suites = ['gaia', 'widesearch', 'freshqa', 'deepsynth']
const points = ['medium', 'high', 'xhigh'].map((effort, index) => {
  const rows = data.results.filter(
    (row) =>
      row.model === 'gpt-5.6-luna' &&
      row.reasoning_effort === effort &&
      suites.includes(row.benchmark),
  )
  if (rows.length !== suites.length) throw new Error(`Missing Luna ${effort} results`)
  const pairs = rows.reduce((sum, row) => sum + row.complete_pairs, 0)
  const mean = (arm) => rows.reduce((sum, row) => sum + row[arm] * row.complete_pairs, 0) / pairs
  return {
    effort,
    x: 132 + index * 288,
    baseline: mean('baseline'),
    mercator: mean('mercator'),
    pairs,
  }
})
const y = (score) => 350 - (score - 62) * 20
const path = (arm, series = points) =>
  series.reduce((d, point, index) => {
    if (!index) return `M ${point.x} ${y(point[arm])}`
    const previous = series[index - 1]
    const step = (point.x - previous.x) / 3
    return `${d} C ${previous.x + step} ${y(previous[arm])} ${point.x - step} ${y(point[arm])} ${point.x} ${y(point[arm])}`
  }, '')
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="480" viewBox="0 0 840 480" fill="none" font-family="Geist, sans-serif">
<title>GPT-5.6 Luna with and without Mercator</title>
<desc>Trial-weighted mean on four selected suites. Medium: 64.1% baseline, 67.0% with Mercator. High: 66.8% baseline, 70.3% with Mercator. Xhigh: 69.5% baseline, 69.8% with Mercator. Each point includes 159 matched task pairs.</desc>
<rect width="840" height="480" fill="#0b0b0b"/>
<text x="40" y="44" fill="#f2f1ec" font-size="23" font-weight="600">GPT-5.6 Luna</text>
<text x="40" y="71" fill="#a7a2ad" font-size="15">Mean score, across WideSearch, FreshQA, GAIA, and DeepSynth</text>
<path d="M 40 104 H 76" stroke="#bcb7c3" stroke-width="1.5"/>
<text x="86" y="109" fill="#f2f1ec" font-size="15">Agent</text>
<path d="M 192 104 H 228" stroke="#b9a3ff" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
<text x="238" y="109" fill="#f2f1ec" font-size="15">Agent + Mercator</text>
<text font-family="Geist Mono, monospace" x="40" y="141" fill="#a7a2ad" font-size="12">SCORE (%)</text>`,
]
for (let score = 62; score <= 72; score += 2) {
  svg.push(`<path d="M 94 ${y(score)} H 760" stroke="#373439" stroke-opacity=".65" stroke-width=".8"/>
<text font-family="Geist Mono, monospace" x="78" y="${y(score) + 5}" text-anchor="end" fill="#a7a2ad" font-size="13">${score}</text>`)
}
svg.push(`<path d="${path('mercator')} ${path('baseline', [...points].reverse()).replace(/^M/, 'L')} Z" fill="#b9a3ff" fill-opacity=".08"/>
<path d="${path('baseline')}" stroke="#bcb7c3" stroke-width="1.5"/>
<path d="${path('mercator')}" stroke="#b9a3ff" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>`)
for (const p of points) {
  svg.push(`<circle cx="${p.x}" cy="${y(p.baseline)}" r="4" fill="#0b0b0b" stroke="#bcb7c3" stroke-width="1.5"/>
<circle cx="${p.x}" cy="${y(p.mercator)}" r="4" fill="#b9a3ff" stroke="#0b0b0b" stroke-width="1"/>
<text font-family="Geist Mono, monospace" x="${p.x}" y="${y(p.baseline) + 25}" fill="#c8c3cc" font-size="19" text-anchor="middle">${p.baseline.toFixed(1)}%</text>
<text font-family="Geist Mono, monospace" x="${p.x}" y="${y(p.mercator) - 16}" fill="#b9a3ff" font-size="19" font-weight="600" text-anchor="middle">${p.mercator.toFixed(1)}%</text>
<text font-family="Geist Mono, monospace" x="${p.x}" y="391" fill="#f2f1ec" font-size="16" text-anchor="middle">${p.effort}</text>
<text font-family="Geist Mono, monospace" x="${p.x}" y="418" fill="#b9a3ff" font-size="14" text-anchor="middle">+${(p.mercator - p.baseline).toFixed(1)} pts</text>`)
}
svg.push(`<text font-family="Geist Mono, monospace" x="420" y="453" fill="#a7a2ad" font-size="14" text-anchor="middle">Reasoning effort</text>
</svg>\n`)
writeFileSync(new URL('../public/blog/mercator-benchmarks.svg', import.meta.url), svg.join('\n'))

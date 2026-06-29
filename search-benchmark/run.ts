import { variants } from './config.ts'
import { buildCorpus } from './corpus.ts'
import { queries } from './queries.ts'
import { buildSearch, pagePath } from './search.ts'

type QueryResult = {
  query: (typeof queries)[number]
  results: string[]
  rank: number
}

function fmtPct(x: number): string {
  return `${(x * 100).toFixed(1)}%`
}

function rankResult(results: string[], relevant: string[]): number {
  const relevantPages = new Set(relevant.map(pagePath))
  return results.findIndex((result) => relevantPages.has(pagePath(result)))
}

function hitAt(result: QueryResult, k: number): boolean {
  return result.rank >= 0 && result.rank < k
}

function printPerLabel(resultsByVariant: Map<string, QueryResult[]>): void {
  console.log()
  console.log('per-label top-3 accuracy:')
  const labels = [
    ...new Set(queries.filter((query) => query.relevant.length).map((query) => query.label)),
  ]

  console.table(
    labels.map((label) => {
      const row: Record<string, string> = { label }
      for (const [variantName, results] of resultsByVariant) {
        const labelResults = results.filter(
          ({ query }) => query.label === label && query.relevant.length,
        )
        row[variantName] =
          `${labelResults.filter((result) => hitAt(result, 3)).length}/${labelResults.length}`
      }
      return row
    }),
  )
}

function printMisses(resultsByVariant: Map<string, QueryResult[]>): void {
  for (const [variantName, results] of resultsByVariant) {
    console.log()
    console.log(`${variantName} misses (not in top-3):`)
    const misses = results.filter(
      ({ query, rank }) => query.relevant.length && (rank < 0 || rank >= 3),
    )
    if (misses.length === 0) {
      console.log('  (none)')
      continue
    }

    for (const { query, results: queryResults } of misses) {
      console.log(`  [${query.label}] "${query.q}"`)
      console.log(`    expected: ${query.relevant.map(pagePath).join(', ')}`)
      console.log(`    actual:   ${queryResults.slice(0, 3).join(', ') || '(none)'}`)
    }
  }
}

function evaluate(search: (query: string) => string[]): QueryResult[] {
  return queries.map((query) => {
    const results = search(query.q)
    return { query, results, rank: rankResult(results, query.relevant) }
  })
}

function metrics(variantName: string, results: QueryResult[]): Record<string, string> {
  const scored = results.filter(({ query }) => query.relevant.length)
  const count = scored.length || 1
  return {
    variant: variantName,
    top1: fmtPct(scored.filter((result) => hitAt(result, 1)).length / count),
    top3: fmtPct(scored.filter((result) => hitAt(result, 3)).length / count),
    top5: fmtPct(scored.filter((result) => hitAt(result, 5)).length / count),
    MRR: (
      scored.reduce((sum, result) => sum + (result.rank >= 0 ? 1 / (result.rank + 1) : 0), 0) /
      count
    ).toFixed(3),
    zero: fmtPct(scored.filter(({ results }) => results.length === 0).length / count),
  }
}

async function main(): Promise<void> {
  const docs = await buildCorpus()
  const pages = new Set(docs.map((d) => pagePath(d.href)))
  console.log(`corpus: ${docs.length} sections, ${pages.size} pages`)
  console.log(
    `queries: ${queries.length} (${queries.filter((q) => q.relevant.length > 0).length} scored)`,
  )
  console.log()

  const resultsByVariant = new Map<string, QueryResult[]>()
  for (const variant of variants) {
    resultsByVariant.set(variant.name, evaluate(buildSearch(variant, docs)))
  }

  console.table(
    [...resultsByVariant].map(([variantName, results]) => metrics(variantName, results)),
  )
  printPerLabel(resultsByVariant)
  printMisses(resultsByVariant)
}

main()

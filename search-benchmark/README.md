# Search Benchmark

Accuracy-only harness for tuning docs search before changing production ranking.

Run it with:

```sh
bun run search:benchmark
```

## Files

- `queries.ts` is the editable ground truth. Add real user queries, label them, and list the page paths that should count as relevant.
- `config.ts` defines MiniSearch variants. `production-baseline` should mirror `vocs.config.ts`; the other variants are experiments.
- `corpus.ts` builds the benchmark corpus from `src/pages` using Vocs' own search extractor.
- `run.ts` prints top-1/top-3/top-5, MRR, zero-result rate, per-label accuracy, and top-3 misses.

## Notes

The scorer compares page paths, so section anchors are stripped before matching. Negative queries use an empty `relevant` list and are excluded from recall metrics.

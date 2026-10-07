# Tempo Zones documentation audit — September 17, 2026

Review branch: `codex/zones-docs-audit`, based on `codex/inside-tempo-zones` at `436b509`. This is a documentation and demo repair; it does not change or deploy the Zone protocol.

The findings below record the September 17–18 baseline. The September 23 update at the end supersedes its prover and settlement implementation claims.

## Source baseline

- Zones: [`a88c2ac6`](https://github.com/tempoxyz/zones/tree/a88c2ac6b6b407225e2861c660806faccc0217df).
- Tempo: [`3fa3b524e2`](https://github.com/tempoxyz/tempo/commit/3fa3b524e2).
- Hosted API: [`cb8b5436`](https://github.com/tempoxyz/api/tree/cb8b543605f2690359a1d7199dd1230d70bed9be), plus the live OpenAPI schema.
- Demo SDK: installed `viem` 2.54.6 / `ox` 0.14.30. Live Zone A and B still use their older interfaces and chain IDs `4217000006` / `4217000007`.

Repository source and running deployments differ materially. The guides now identify the older testnet deployment explicitly; protocol references describe the audited source. Neither a repo commit nor an installed contract address alone establishes a deployment’s guarantees.

## Material corrections

| Finding | Correction and evidence |
| --- | --- |
| Execution-proof guarantees were overstated. | Distinguished sequencer settlement signatures from execution verification. The reference `Verifier.sol` returns true; `settlement.rs` submits empty proofs, and `monitor.rs` does not wait for optional validation. Canonical Mainnet and Moderato verifier bytecode matched Tempo’s 373-byte `ZONE_VERIFIER_RUNTIME`; read-only calls with empty proofs returned true on both. |
| Prover implementation docs were obsolete. | Replaced the claimed `no_std` SP1 / SGX / TDX pipeline with the actual Rust stateless validator and AWS Nitro service. Onchain-verifiable attestation and forced exits remain unfinished. Qualified the blog’s repeated proof and exit guarantees accordingly. |
| Deposit and callback APIs had changed. | Documented encrypted-only deposits with a Tempo refund recipient, current sender tags including `fallbackNonce`, callback source identity, plural `processWithdrawals`, gateway restrictions, and pending-refund behavior. See Zones `runtime/interfaces/IZone.sol`, `runtime/tempo/ZonePortal.sol`, and the inbox/outbox precompiles. |
| Fees, access rules, and execution support had drifted. | Corrected withdrawal base gas, callback limits, fee-token selection, admin/sequencer responsibilities, checkpoint-based policy reads, and chain-ID formulas. Current source rejects direct user TIP-20 transfers; the older demo deployment still supports them. |
| RPC methods and privacy guarantees were inaccurate. | Removed unimplemented methods and the nonexistent 100 ms timing floor. Corrected authentication status codes, account scoping, log filters, block/receipt redaction, and sequencer access claims against the actual RPC dispatcher. |
| Browser demos could not authenticate directly. | The sandbox gateway’s CORS allowlist omitted `X-Authorization-Token`. Added a same-origin relay limited to Zone A/B and the demo RPC methods. Existing sandbox HTTP credentials are server-side; callers still supply their own signed Zone token. |
| Deposit setup could never finish. | Removed its dependency on `connectorClient.chain.zones`, which is absent from the installed chain metadata. |
| Routed refunds and fee estimates were wrong. | Set the user’s fallback recipient explicitly instead of letting it default to the router, and passed callback gas using the SDK’s actual `gas` option. |
| Completion checks could produce false success. | Stopped matching pre-submission events, handled an initially unchanged public head, and tied routed completion to the requested deposit rather than merely a successful balance read. |
| Diagram URLs broke on local and preview builds. | Used the existing environment-aware path helper; replaced a stale transfer diagram with a small theme-compatible deposit/withdrawal diagram and a plain-Markdown equivalent. |
| Hosted API prose overstated status/support. | Added a concise authored intro to `/docs/api/zones`: sender-tag version differences, checkpoint acceptance versus proof/refund completion, and HTTP 501 for the unimplemented Zone transfer route. Generated endpoint schemas remain intact. |
| Related-page cards repeated obsolete claims. | The external Graphite index supplied old page titles and descriptions even when the branch frontmatter was current. Related links retain Graphite's ranking and use local metadata for pages present in this checkout. |

## Coverage

- Every page in `src/pages/docs/protocol/zones/`: index, architecture, accounts, bridging, RPC, execution, proving.
- Every page in `src/pages/docs/guide/private-zones/`: index, connection, deposits, transfers within a zone, transfers across zones, swaps, withdrawals; all eight TypeScript snippets checked against the installed SDK.
- All five interactive Zone demo components, shared transport and authorization code, both deposit modes, and both withdrawal modes.
- Hosted Zones withdrawal API and schemas, the adjacent Zone transfer route, and hosted RPC distinctions.
- Zone references in the docs/build/protocol landing pages, predeployed contracts, T9/T10/T11 upgrade pages, node release table, sidebar, SEO section labels, and generated Markdown descriptions. Accurate existing material was retained.
- `Inside Tempo Zones`, its linked engineering references, and diagram references. Product availability and customer/partner statements were retained; code-backed guarantees were corrected.

## Validation — September 17

The final live browser regression passed all eight paths in 49.3 seconds through the actual docs relay, with no request interception or mocked RPC responses: plaintext/encrypted deposits, an in-zone transfer, standard/authenticated withdrawals, a cross-zone send, a cross-zone swap, and a repeated send with prior Zone B funds. No page errors occurred. All eight guide snippets passed strict SDK typechecking. All 14 engineering routes rendered successfully; the hosted API category and light/dark diagrams were also checked.

The full unit suite passed (393 tests in 33 files), as did TypeScript checking, the Vercel preview production build, the Markdown output audit, and the internal anchor check (259 links across 199 pages). The live regression is opt-in:

```bash
ZONES_LIVE_E2E=true pnpm exec playwright test --config playwright.zones.config.ts
```

It creates an isolated virtual passkey and uses only faucet-funded Moderato assets. No personal wallet or Mainnet funds are used. The test performs real RPC calls and checks actual deposit/withdrawal settlement; it does not mock chain responses.

## Follow-up verification — September 18

The guide overview now introduces the private ledger and the public-chain connection before defining Zone A and Zone B as example test environments. The connection guide explains account authorization before setup details. Deployment-specific compatibility notes appear beside the relevant SDK examples rather than at the start of every guide.

This review also found that the deposit demo treated a failed starting-balance read as zero. Existing funds could then falsely satisfy the deposit completion threshold. The demo now stops before submitting a deposit when it cannot read that baseline balance.

After that fix, a fresh isolated passkey completed all eight live browser flows through the actual docs RPC relay. The test passed in 77.2 seconds (81.3 seconds including server setup), without mocked responses or browser page errors:

| Flow | Result |
| --- | --- |
| Plaintext deposit into Zone A | Passed |
| Encrypted deposit into Zone A | Passed |
| Private transfer within Zone A | Passed |
| Standard withdrawal to Tempo | Passed |
| Cross-zone send into Zone B | Passed |
| Cross-zone swap into Zone B betaUSD | Passed |
| Authenticated withdrawal to Tempo | Passed |
| Repeat send with an existing Zone B balance | Passed |

The test now attaches sanitized transaction receipt metadata as `live-chain-confirmations.json`, excluding authorization headers and signed requests. Deposit completion checks use fresh private balances; routed flows also correlate the public deposit with a unique memo. Withdrawals check the matching public delivery event after the submission anchor, rather than independently asserting the final public wallet balance. These results verify the documented testnet demos, not every deployment or failure scenario.

The full unit suite passed again: 393 tests across 33 files. TypeScript, the production preview build, Markdown output audit, and internal anchor check also passed (256 links across 199 pages). Two earlier live attempts were interrupted by a development-page reload and a stopped test server; the final complete run used a fresh isolated server with source edits paused. The user's separate localhost preview remained running.

## Sign-in regression found during review

The earlier browser runs used `VITE_E2E=true`, which replaced the normal passkey ceremony. They verified the Zone transactions but missed a real sign-in failure: the docs still called `GET /challenge` and `GET/POST /:id` after the hosted key service migrated to the accounts SDK's four POST registration/login routes. The live challenge endpoint returned 404.

The docs now use the SDK's hosted ceremony for the Tempo relying-party ID. Localhost and isolated previews use the SDK's persistent local ceremony scoped to their own host, because the hosted service issues options for `tempo.xyz`. Sign-in errors now appear beside the buttons.

The live suite now starts a fresh server with the normal app configuration (`VITE_E2E=false`). It first registers a passkey, signs out, reloads the page, and signs back into the same full account address. It then completes all eight Zone flows. This run passed in 88.6 seconds without network mocking or browser page errors, and asserted that localhost makes no requests to the hosted key service. The virtual authenticator supplies test hardware; it no longer selects a different app ceremony. All 405 unit tests passed, including 12 ceremony regression tests for hosted routes, errors, local credential lookup, and relying-party isolation.

Existing hosted credentials may require an upstream migration: the previous service stored bare public-key values, while the current handler expects credential objects, and the configured relying-party ID changed. This review did not inspect hosted credential storage or establish recovery of every older passkey. It did not clear user credentials or change the key service.

## Remaining upstream work

The older demo node’s `zone_getDepositStatus` also returned an internal error caused by a backend query exceeding its 1,000,000-block range limit. The demos avoid that broken method: they authorize both zones before sending, capture the destination balance, match a unique public deposit memo, and wait for the expected balance increase. The upstream node issue remains.

The docs cannot implement the missing protocol guarantees. Execution-proof enforcement, enclave attestation wiring, and forced exits require engineering changes in Zones/Tempo.

The hosted API’s generated schema still contains upstream wording that should be corrected in the API repo: `senderTag` is described as shared across one transaction, `zoneStatus` says “proven” despite checking an accepted checkpoint, and the Zone transfer route’s summary says it creates transfers despite always returning 501. The authored docs note makes these limitations explicit without forking the remote schema.

This audit does not establish deployment-specific guarantees for every managed customer Zone, benchmark sub-second attestation, or test every token-policy rejection and operator-failure scenario. Those are separate from verifying the documented sandbox demos and current source behavior.


## Publication review — September 23

Rechecked Zones `ac49071f` and Tempo `3c4db7f843` before preparing the public docs PR. These commits materially change the earlier prover findings:

- The enclave now returns a Nitro attestation binding the batch digest in `user_data`. Configured sequencers wait for that result before submitting; observational follower validation remains separate.
- Tempo registers a native Nitro verifier at T13. It authenticates the document and batch inputs, but its approved production PCR measurements are still unset at the reviewed commit, so it rejects proofs. The Zones Solidity reference verifier remains a stub. Neither source behavior establishes a particular deployment's active runtime.
- T13 adds the next Zone height and token-enablement transition to verifier inputs, tracks the processed enabled-token cursor, limits outstanding portal work, and accepts multiple consecutive Tempo headers for finalization.

Updated the protocol reference, blog, and settlement diagrams accordingly. The older shared testnet demos remain explicitly identified as a different deployment. Preserved the newer public `Privacy with Tempo Zones` article and social-image support while restoring the distinct `Inside Tempo Zones` route.

The publication check also verified the hosted API at `b4a9dbe8`: checkpoint-based withdrawal status and the unimplemented Zone transfer route are unchanged. All 411 unit tests, TypeScript, production build, internal anchors, generated links, and Markdown audit passed. A fresh normal passkey completed all eight live testnet flows in 1.5 minutes. CI exposed an existing race between competing blog `og:type` tags; article type now comes from the native Vocs head configuration, with regression coverage for custom and generated social images.

## Blog publication removed — September 23

Removed the `Inside Tempo Zones` draft, its article assets, and its publishing support from the public repository. Restored the existing redirect to `Privacy with Tempo Zones`; that article is unchanged. The Zones documentation, diagrams, demo fixes, and generic SEO regression fix remain.

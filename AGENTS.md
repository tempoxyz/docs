# Tempo Documentation (docs-next)

Vocs-powered documentation site for Tempo protocol. Use this guidance when creating or updating Tempo docs.

## Working Model

- Be concise, practical, and opinionated. Lead with the recommended path.
- Follow nearby pages before inventing new structure, components, or wording.
- Do not make protocol, API, chain, fee, or token claims without checking repo source docs first.
- Prefer small, scoped docs changes that preserve existing URLs, anchors, and sidebar organization.

## Audience

- Write for CTOs and staff software engineers integrating stablecoins into payment, payroll, remittance, or financial products.
- Start with their integration decisions and workflows, then explain the signing methods, APIs, and protocol mechanics needed to implement them.
- Use product plans to understand intent and positioning. Verify availability separately; do not describe planned capabilities as live features.

## Documentation IA and agent exports

- `src/lib/docs-sections.ts` owns the section labels, landing routes, and route ownership; `vocs.config.ts` owns the sidebar within each section.
- Primary sections: Get Started (`/get-started`), Accounts (`/docs/accounts`), Earn (`/docs/earn`), Routes (`/docs/routes`), Zones (`/docs/zones`), and Machine Payments (`/docs/agents`). Get Started also owns the SDK, CLI, and wallet CLI pages (`/docs/sdk`, `/docs/cli`, `/docs/wallet`) as its Tempo CLI and Tempo SDK sections.
- Tempo EVM (`/docs/development`) covers wallets and signing keys, transactions, fees, TIP-20 Tokens, contracts, exchange, network details, nodes, protocol specifications, and changelog.
- API reference (`/docs/api`) is its own top-nav link, matching Console's "API Docs" link. Partners (`/docs/partners`) contains third-party integrations. The old APIs & SDKs hub (`/docs/tools`) redirects to `/docs/sdk`.
- Keep Earn and Routes beta notices and the Zones limited-preview notice on their overview pages. The earlier `/docs/guide/private-zones` sandbox is a separate integration.
- `public/SKILL.md` is the canonical Tempo docs skill, published at `/SKILL.md`. The `tempoxyz/plugins` copy is generated from it by that repo's skill sync, so edit only `public/SKILL.md` here.
- `src/lib/markdown-output-transform.ts` uses `src/lib/ai-docs.ts` to add section context before Vocs validates and writes Markdown exports. `SKILL.md` links to `public/SKILL.md`, the source Vite serves and copies. Never edit `dist` or `.vercel` copies by hand.
- After changing navigation or exported components, build and run `pnpm check:markdown` to check content and IA coverage. Keep Markdown exports useful without interactive UI.
- When a top-nav section is added, renamed, or removed, update its routing description in `src/lib/ai-docs.ts`, the routing table in `SKILL.md`, and the tests that name sections (`DocsHeader.test.ts`, `ai-docs.test.ts`, `markdown-output-transform.test.ts`, `markdown-output.test.ts`).

### API reference sidebar

- The sidebar comes from the `openapi` entry in `vocs.config.ts`: `intro` holds the API reference overview pages, and the endpoint sections come from the OpenAPI spec's `x-tagGroups`. Until the API repo's spec carries the grouping, `regroupApiTags` rewrites tags, merges, and groups as the spec loads.
- Sections: API reference (overview, authentication, conventions, MCP server, all endpoints, FAQ), Accounts, Earn API, Routes API, Zones API, Data API, Console (in Console app order), and MPP last.
- Put each guide inside the endpoint group it explains (for example, Fee payer › Guide) instead of listing it again at the top. Each page appears once in the sidebar.
- Keep the API reference to API pages: endpoints, authentication, conventions, and API guides. Client libraries live under Get Started › Tempo SDK; the Tempo API client for TypeScript (`tapimo`) is at `/docs/sdk/typescript/api-client`.
- A single-tag section renders its operations directly under the section header, so give that tag the section's name as its `x-displayName`.
- When renaming or merging a tag, set `x-pagePath` to keep the existing URL; the display name otherwise changes the page path.
- `sidebar` uses Vocs's OpenAPI options: `introduction: false` puts the `intro` items at the top level, `hide` drops tags or sections from the sidebar while keeping their pages, `groupItems` adds links inside a tag group after its Overview (keyed by tag or display name), and `tagGroupItems` adds links at the top of an `x-tagGroups` section.

### Moving, renaming, or removing pages

- Add the redirect in `vocs.config.ts` and mirror it under `/developers` in `vercel.json`; `docs-routing.test.ts` enforces the mirror. Point older redirects at the final destination instead of chaining.
- Repoint inbound links instead of relying on redirects: search `src/pages`, `src/lib/docs-link-cards.ts`, `src/lib/docs-setup.ts`, and `SKILL.md`.
- Keep linked heading anchors working with `<span id="old-anchor" />` above the renamed heading.
- Every page needs a sidebar home; `sidebar-coverage.test.ts` fails otherwise. Merge redundant pages into the canonical page and redirect, rather than keeping link-only pages.

## Source of Truth

Use repo-local sources first:

- `vocs.config.ts` - navigation, sidebar labels, redirects, SEO config
- `src/pages/docs/protocol/` - protocol and technical references
- `src/pages/docs/protocol/tips/` - Tempo Improvement Proposals
- `src/pages/docs/api/` - hosted API and RPC docs
- `src/pages/docs/guide/` - product workflows and integration guides
- `src/snippets/` - shared MDX snippets and reusable reference content
- `src/components/` - custom React/MDX components and interactive guide surfaces

For the `tempo api` CLI, the source of truth is `tempoxyz/api`: `apps/cli/SKILL.md` and the commands in `src/cli/`. Do not document the internal `admin` commands.

When documenting MPP concepts on Tempo, cross-check the relevant MPP docs or SDK references. Keep MPP protocol facts aligned with MPP, but write the page around the Tempo user journey.

## Commands

Use `pnpm`.

- `pnpm dev` - start development server
- `pnpm build` - typecheck and build docs plus marketing site
- `pnpm check` - run Biome format/lint with fixes
- `pnpm check:types` - run TypeScript check
- `pnpm test` - run Vitest tests (`vitest run --dir src`; a bare `vitest run` also picks up the Playwright `e2e/` files and fails)
- `pnpm test:e2e` - run Playwright tests
- `pnpm preview` - preview the production build

### Dev server

- Start `pnpm dev` once and keep it running. Do not stop or restart it between edits.
- MDX pages, components, styles, and `src/lib` changes hot-reload. Refresh the page instead of restarting.
- Vocs reads `vocs.config.ts` (sidebar, redirects, OpenAPI options) only at startup and does not watch it. Batch config edits, then restart once to check them.
- Vite restarts the server by itself when a file imported by `vite.config.ts` changes, including `src/lib/ai-docs.ts` and `src/lib/docs-sections.ts`. Make all edits to those files in one pass.
- Adding or deleting a page file also restarts the server, so routes stay current.
- The first load of an API page parses the OpenAPI spec and can take a minute or two. Wait for it instead of restarting.
- Check rendered pages with headless Playwright screenshots against the running server. Wait for React hydration before clicking sidebar controls.
- Heap use stays flat across MDX edits, repeat page loads, and Markdown requests (`.md` twins, `curl`). Node cannot unload ES modules, so two kinds of edits still keep memory: an edit to `vocs.config.ts` or a file it imports keeps one copy of the config (about 15 MB), and an edit to a component that a page renders standalone (`<Component />`) keeps one copy of the component modules (50–125 MB) once a Markdown request follows. Restart after many of those edits. Vocs reuses config loads and shares one Markdown component loader; `src/test/vocs-config-resolve.test.ts` fails if a Vocs upgrade drops the config reuse.
- Each newly compiled page adds 10–15 MB, so loading about 100 distinct pages passes Node's default heap limit. For broad checks such as crawling the site, start the server with `NODE_OPTIONS=--max-old-space-size=16384`.
- The changelog fetches GitHub releases at most every 10 minutes and serves the last result when GitHub rate-limits. Set `GITHUB_TOKEN` to raise the limit.
- Set `VITE_USE_HTTP=true` to skip the mkcert HTTPS setup, which needs sudo.

Before finishing docs-only changes, run at least `pnpm check:types` when practical. Run `pnpm build` for config, component, routing, sidebar, or MDX structure changes. Run targeted tests for changed interactive components.

## CLI pages

- Title each page with just the command: ``# `tempo request` ``. Wallet subpages use ``# `tempo wallet` recipes``.
- Order sections Usage → task sections or Examples → Commands → Flags → Related. `/docs/cli` covers Install, the commands table, agent setup, and common flags only; command-specific details stay on the command's page.
- Show commands in `bash [Terminal]` code blocks with the flags in use. Write placeholders as `<UPPER_SNAKE>`, such as `<SERVICE_ID>`.
- Tables: `Command | Description` lists each command once, without flag variants. `Flag | Description` details flags, with one `###` subsection per command on multi-command pages. Write flags as `-D, --dump-header <FILE>`, defaults as "Defaults to `X`.", and descriptions as sentences ending with a period.
- Keep each command's flag table self-contained, even when commands share flags (`tempo download` and `tempo node` both take `--chain` and `--datadir`).

## Site styling rules

- Import `style`/`variants` from `src/styles/recipes.ts` for layout recipes, `theme.ts` for semantic components, or `scoped.ts` for existing unlayered selectors. Do not import unrestricted helpers from `zyzz` or create component-local configs.
- Use the shared `vars` exported by `theme.ts`, or configured token names. `contract.ts` owns spacing, typography, radius, border, and stacking scales; `palette.ts` owns colors. Add a token only for a reusable design decision.
- `inherited.ts` is the reviewed bridge to existing Vocs, blog, terminal, and artwork CSS scopes. Its expressions must resolve on the styled element; do not hoist local CSS variables into root tokens.
- An intentional one-off uses ` !custom` and a declaration-local `// design-exception: <specific reason>` comment. Native CSS keywords need no explanation. Prefer normalizing incidental values to the scale over adding exceptions.
- Global styles and keyframes use explicit token references. Use token-based border/background longhands, logical properties, and explicit transition properties. Style interactive state through existing ARIA/data attributes or native `:checked`/`:disabled` selectors. Reserve DOM style writes for scroll locking, theme application, and named CSS-variable bindings for runtime measurements.
- Linked inline code (for example, a command linked to its page) keeps the code style and shows its link on hover; see the `a[data-v]:has(> code:only-child)` rule in `globals.ts`.
- `pnpm check` runs Biome plus the architecture policy and Zyzz Oxlint rules. `pnpm check:types` checks token/variant contracts, including negative fixtures. `pnpm build` also enforces the compiler contract. Keep all three passing; do not suppress errors or weaken helper mappings to make a new value fit.

## Project Structure

- `src/pages/` - Vocs file-based routes
- `src/pages/docs/` - main docs site
- `src/pages/docs/protocol/tips/` - TIP pages read by `TipsList`
- `src/components/` - custom React components for docs and guides
- `src/snippets/` - shared MDX content
- `api/` - Vercel serverless functions, including OG image generation
- `public/` - static assets
- `vocs.config.ts` - Vocs config, sidebar, nav, SEO, redirects
- `vercel.json` - Vercel deployment config

## Adding or Moving Pages

1. Create a `.mdx` file in the matching route path under `src/pages/`.
2. Add required SEO frontmatter:

   ```yaml
   ---
   title: Page Title
   seoTitle: Search-specific title | Tempo Docs
   description: Concise active-voice description for search and social previews.
   ---
   ```

3. Add the page to `vocs.config.ts` sidebar when it should be discoverable.
4. Preserve old deep links with explicit anchors when renaming headings:

   ```mdx
   <span id="modes" />

   ## Tempo API pagination modes
   ```

5. Verify with `pnpm check:types` and `pnpm build` when navigation, imports, MDX syntax, or components changed.

## Page Structure

Start every page with:

- SEO frontmatter
- import statements, if needed
- one specific `#` title
- one concise paragraph explaining what the page helps the reader do

Use topic-specific `##` headings. Avoid standalone generic H2s:

- `Overview`
- `Usage`
- `Parameters`
- `Returns`
- `Examples`
- `Setup`
- `Configuration`
- `Reference`
- `Request`
- `Response`
- `Errors`
- `Best Practices`
- `Next Steps`

Prefer headings that name the product, API, command, protocol, or task:

- `Tempo API pagination modes`
- `` `tempo request` examples ``
- `Hosted fee payer API reference`
- `T7 upgrade overview`
- `Foundry MPP configuration`
- `Indexer API error response format`

Exceptions are allowed for standards-format pages, especially TIP sections with required names such as `Abstract`, `Motivation`, `Specification`, and `Test Cases`.

Before finishing docs changes, scan changed Markdown files for generic H2s. Accounts and Zones pages follow the Design System template below, so the scan skips them:

```bash
git diff --name-only -- '*.md' '*.mdx' | grep -vE '^src/pages/docs/(accounts|zones|guide/private-zones|protocol/zones)' \
  | xargs rg -n '^## +(Overview|Usage|Parameters|Returns?|Examples|Setup|Configuration|Reference|Request|Response|Errors|Best Practices|Next Steps)( +\{#[^}]+\})?$'
```

### Design System page template

Accounts and Zones pages follow the [Tempo Design System docs](https://ds.tehq.dev/llms-full.txt) page by page: `src/pages/docs/accounts.mdx`, `src/pages/docs/accounts/`, `src/pages/docs/zones.mdx`, `src/pages/docs/zones/`, `src/pages/docs/guide/private-zones/`, and `src/pages/docs/protocol/zones/`. Other sections move to this template when they are rewritten. On these pages, the template overrides the generic-H2 ban, sentence-case headings, and period labels:

1. **Title:** Title Case `title` frontmatter and `#` heading, matching the sidebar label in `vocs.config.ts`.
2. **Subhead:** One short sentence after the H1 that defines the page or states its outcome.
3. **`## Overview`:** Always the first H2. One to three short paragraphs that open by defining the concept or stating what the guide builds.
4. **Body sections:** Noun labels for concepts (`## Signers`), verb-first labels for tasks (`## Set a Limit`). Guides put their `:::::steps` block under `## Setup`.
5. **`## Guidelines`:** Optional, and absent from most pages. Put advice in the body, next to the step or fact it concerns. Add Guidelines only when a page has two or more judgment calls that span the page, such as how to weigh signers. Each `###` guideline gives a reason the body doesn't, then an optional `**Do:** …` or `**Don't:** …`. Never restate a body sentence, and never write a Don't that only negates the Do.
6. **`## Related`:** The last section. Two to five `<Card>`s whose descriptions start with "Covers …" for concepts or "Use for …" for tasks. Getting-started guides (`create`, `fund`) use `## Next Steps` instead.

Headings use Title Case: capitalize every word except a, an, the, and, but, or, nor, for, so, yet, as, at, by, in, of, off, on, per, to, and via, unless first or last. Capitalize a verb particle such as Up in "Set Up". Capitalize prepositions of four or more letters (With, From, Into). Bold-label lists use `- **Label:** Sentence.` with a Title Case label. Title Case alone doesn't change an anchor slug; for any reworded heading, keep the old slug with `<span id="old-slug" />`.

## Procedural Guides

Use `:::::steps` containers for procedures instead of manual numbered headings:

```mdx
:::::steps

### Do the first thing

Content for step 1.

### Do the second thing

Content for step 2.

:::::
```

Each step should be actionable and concrete. Keep long conceptual background outside the steps block.

## Writing Style

Follows the [Tempo Design System writing style](https://ds.tehq.dev/docs/foundations/content/writing-style), adapted for docs pages.

### Principles

- **Clear before clever.** State exactly what happens, in familiar words.
- **Short.** Cut every word that does not change the meaning.
- **Specific.** Name the thing and the action. "Spends up to 500 OUSD a day" carries more than "spends within limits".
- **Consistent.** Call one thing by one name everywhere. See Protocol Concept Naming below.

### Sentences

- Put one rule or fact in each sentence, so a reader or an agent can quote it alone.
- Keep sentences under 20 words and headings under six words.
- Don't chain clauses with colons. A sentence with two colons is always two sentences or a list.
- Put the important words first: the subject or outcome, then the conditions. "Once the update lands, the lost passkey can't approve anything" leads its paragraph, not ends it.
- Define before explaining. Open a concept with one sentence that says what it is, then list its parts.
- State rules as facts that Tempo checks, enforces, or rejects, not as warnings. Prefer "Tempo reverts the transaction" over "the transaction may fail".
- State what an operation doesn't do, plainly: "It holds no funds." "A configuration update doesn't revoke it."
- Add a concrete "such as" example to an abstract rule.
- Use contractions: don't, can't, isn't, it's. Keep "cannot" only inside quoted error strings.
- Name the thing, not its position. Write "the example" or name the step, not "the code below" or "the steps above".
- State recommendations as instructions ("Use three signers"), not "we recommend". Use "we" only for Tempo as a company.
- Keep "may", "might", "can", and "could" only for real permission or real uncertainty.

### Paragraphs and lists

- The paragraph after the H1 renders as the subhead. Make it one short sentence that states the outcome.
- Keep paragraphs to two or three sentences.
- Turn a sentence that lists three or more items with explanations into a bold-label list: `- **Label.** Sentence.` outside the Design System template sections, `- **Label:** Sentence.` inside them. A short plain list ("A, B, and C") stays in the sentence.
- Don't stack several lists back to back. Keep a sentence of prose between them.
- Give the instruction, then the code, then at most one or two sentences on the result. Skip lead-ins such as "The following code…".
- Don't write sentences whose only job is a link ("X covers Y", "See Z for more"). Link the meaningful words in a sentence that states a fact, and put navigation in Related cards.

### Voice

- Use active voice, present tense, and second person.
- Lead with the recommended path, then place alternatives under an advanced or reference section.
- Keep intro paragraphs short. Avoid repeating sidebar or page titles.
- Use sentence case for headings unless the product or protocol term requires capitalization. Accounts and Zones pages use Title Case (see Design System page template).
- Use code font for commands, file paths, parameters, status codes, object names, and literal values.
- Use concrete nouns. Avoid vague labels like "things", "stuff", "various", and "etc." when a specific list is possible.
- Avoid filler such as "simply", "just", "easy", "obviously", and "seamlessly".
- Avoid future tense for behavior that is already true. Prefer "The server returns..." over "The server will return...".
- Do not use humor, exclamation points, rhetorical questions, or marketing claims that are not backed by the docs.
- Use "stablecoins" for Tempo payment assets unless discussing broader cryptocurrency categories.

## Protocol Concept Naming

- Match task names across the sidebar, page title, cards, and incoming links. Preserve existing URLs and anchors when changing a visible label.
- Distinguish an account and its signing authority from the wallet software or provider that manages signing. API keys and account access keys grant different kinds of access.
- Identify who acts: the application, backend service, customer, wallet provider, or agent. Distinguish application authentication, provider signing policies, and onchain permissions.
- Use "transaction" for execution, "transfer" for token movement, and "payment" for the application's business operation. A batch contains atomic calls; concurrently submitted transactions have separate outcomes.
- Keep account balance, DEX balance, vault shares, position value, earnings, and available withdrawal amount distinct. Use "base units" for integer token amounts.
- Keep shared explanations in one primary guide with short, relevant reminders beside examples. Product plans inform positioning, not deployment claims.

- Use literal concept names in user-facing docs.
- Use `TIP-20 Tokens` for sidebar labels, page titles, headings, and first-introduction contexts.
- Use `TIP-20 tokens` in sentence-case prose after introduction.
- Use `Tempo Token Rewards` in sidebar, concept introductions, and rewards-specific resource cards. Do not append `(TIP-20)`.
- Keep raw TIP references for technical/spec contexts, such as `TIP-20 ABI`, `TIP-403 policy check`, and links titled `TIP-20 Specification`.
- Add the TIP number in parentheses only when it helps disambiguate.

### Word list

Use one term for one concept. Adapted from the [Design System word list](https://ds.tehq.dev/docs/foundations/content/word-list) for developer docs, where "sign" and code identifiers are expected.

| Use | Avoid | Notes |
| --- | --- | --- |
| account | wallet (for what holds funds) | A wallet is the software or provider that signs for an account. |
| address | public key, wallet ID, account number | The `0x` identifier of an account. |
| single-key account | EOA (after first mention) | Introduce it once as "like a standard Ethereum account (an EOA)". |
| configurable account | smart account, multisig account | An account with signers, weights, and a threshold. Use "multisig" only for the team multisig setup. |
| signer | owner, co-signer, keyholder | `owners` stays in Viem code. |
| threshold, weight | quorum, voting power | Approvals reach the threshold when their weights add up to it. |
| approve | co-sign, vote | Signers approve a transaction. "Sign" is right for the cryptographic act and in code. |
| access key | session key, delegate key, sub-key | Signs onchain within its bounds. Not an API key, which authenticates to the Tempo API. |
| admin access key | root key, master key | An access key with no bounds. |
| spending limit, scopes, expiry | allowance, permissions, expiration, TTL | An allowance is a TIP-20 approval, a different thing. |
| authorize (an access key) | grant, issue, add | Signers authorize an access key. |
| revoke (an access key or API key) | delete, disable | Remove or replace a signer; revoke a key. |
| stablecoin | token, coin, crypto (for payment assets) | Use "TIP-20 token" in technical and spec contexts. |
| OUSD | AlphaUSD, BetaUSD (in prose) | The example stablecoin in prose. Code keeps its own token names. |
| base units | wei, atomic units | Integer token amounts. |
| network fee | gas (in prose) | `gas` stays in RPC fields and code. |
| fee token | gas token | Tempo has no native gas token. |
| fee payer, sponsor | paymaster, gas station, cover (for fees) | A fee payer sponsors a transaction's network fee. |
| transaction, transfer, payment | — | Execution, token movement, and the application's business operation. |
| send | transmit, pay out (as a verb) | Send stablecoins. "Payout" is fine as a noun for a backend's payments. |
| add funds | top up, load, on-ramp | Use "deposit" for a deposit address or a Zone deposit. |
| withdraw | cash out, off-ramp | |
| swap | trade, exchange (as a verb) | Through the Stablecoin DEX. |
| sign in | log in, login | "Sign-in" as a noun or adjective. |
| onchain, offchain | on-chain, on chain | |
| mainnet, testnet, devnet | Mainnet, Testnet (mid-sentence) | Name the Tempo Accounts devnet where configurable accounts run until T14. |
| Zone | zone, private chain, rollup | Capitalized, as in "Tempo Zones" and "Zone A". |
| Tempo (the public chain) | public chain, L1, parent chain (in prose) | Say "public Tempo" only to contrast with a Zone's private ledger. Write "Tempo Mainnet" only for mainnet itself. |
| Zone RPC, authorization token | zone endpoint, auth header, API key | The authenticated endpoint and the signed credential it requires (`X-Authorization-Token`). |
| operator, sequencer | admin, validator (for Zones) | The operator runs a Zone deployment. The sequencer is the protocol component that orders and submits blocks. |
| portal, outbox | bridge, gateway | `ZonePortal` on Tempo and `ZoneOutbox` on the Zone. Pair each word with its contract name on first mention. |
| Tempo Transaction | AA transaction, smart transaction | The transaction type with passkeys, access keys, batches, and fee sponsorship. |

## Vocs and MDX Patterns

- Use Vocs components already present in nearby pages: `Cards`, `Card`, `Tabs`, `Tab`, `Callout`, and `OpenApi`.
- Use `Cards` for related docs and navigation clusters, not for ordinary paragraphs.
- Use `::::code-group` for language, package-manager, or comparable code variants.
- Tag code fences with a language.
- Use `bash` for terminal commands and include commands exactly as users run them.
- Use imported interactive guide components only on pages that need them.
- Add `interactive: true` frontmatter for pages using wallet hooks, guide demos, or provider-dependent components.

## SEO and Social Text

- Every page needs `title` and `description` frontmatter.
- Use optional `seoTitle` frontmatter when the exact browser title should differ from the visible H1. The Vocs title template emits it verbatim, while social metadata, structured data, search, and generated AI files continue to use `title`.
- Keep `title` concise and specific.
- Keep `description` active, concrete, and useful for search/social previews.
- Do not start descriptions with "This page".
- Do not restate the title in the description; add context or outcome.
- Dynamic OG images are generated by `/api/og.tsx` using frontmatter and `vocs.config.ts`.

## Examples and Code

- Examples must be tied to a real tool, workflow, API, command, or protocol detail.
- Prefer runnable, copyable examples over illustrative fragments.
- Keep code examples realistic and internally consistent on a single page.
- Check dependency availability in `package.json` before using libraries in examples or components.
- Check addresses, chain IDs, performance numbers, limits, fees, and response shapes against source docs or code before adding them.
- If an example depends on testnet, mainnet, sandbox keys, or hosted services, say so near the example.

## TIP Pages

TIPs live in `src/pages/docs/protocol/tips/` with YAML frontmatter:

```yaml
---
title: TIP-X Title
description: Short description
status: Draft | Review | Accepted | Implemented
type: Standards | Process | Informational
authors:
  - Author Name
---
```

`TipsList` reads TIP frontmatter via `import.meta.glob` and sorts by TIP number. Keep TIP pages standards-shaped unless the existing TIP format says otherwise.

## Blog Notes

Blog-specific instructions live in `blogs/AGENTS.md`. Read that file before editing posts, blog assets, diagrams, or drafts.

## Final Checks

- Confirm changed pages have required frontmatter.
- Confirm sidebar entries match moved or new pages.
- Confirm renamed headings preserve important anchors.
- Run the generic-heading scan for touched Markdown/MDX files.
- Run the most relevant validation command for the change size.

## Generated Markdown

Follow [MARKDOWN.md](./MARKDOWN.md) for component contracts, validation, and overrides. Add renderer tests and run `pnpm check:markdown` after building.

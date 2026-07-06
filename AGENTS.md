# Tempo Documentation (docs-next)

Vocs-powered documentation site for Tempo protocol. Use this guidance when creating or updating Tempo docs.

## Working Model

- Be concise, practical, and opinionated. Lead with the recommended path.
- Follow nearby pages before inventing new structure, components, or wording.
- Do not make protocol, API, chain, fee, or token claims without checking repo source docs first.
- Prefer small, scoped docs changes that preserve existing URLs, anchors, and sidebar organization.

## Source of Truth

Use repo-local sources first:

- `vocs.config.ts` - navigation, sidebar labels, redirects, SEO config
- `src/pages/docs/protocol/` - protocol and technical references
- `src/pages/docs/protocol/tips/` - Tempo Improvement Proposals
- `src/pages/docs/api/` - hosted API and RPC docs
- `src/pages/docs/guide/` - product workflows and integration guides
- `src/snippets/` - shared MDX snippets and reusable reference content
- `src/components/` - custom React/MDX components and interactive guide surfaces

When documenting MPP concepts on Tempo, cross-check the relevant MPP docs or SDK references. Keep MPP protocol facts aligned with MPP, but write the page around the Tempo user journey.

## Commands

Use `pnpm`.

- `pnpm dev` - start development server
- `pnpm build` - typecheck and build docs plus marketing site
- `pnpm check` - run Biome format/lint with fixes
- `pnpm check:types` - run TypeScript check
- `pnpm test` - run Vitest tests
- `pnpm test:e2e` - run Playwright tests
- `pnpm preview` - preview the production build

Before finishing docs-only changes, run at least `pnpm check:types` when practical. Run `pnpm build` for config, component, routing, sidebar, or MDX structure changes. Run targeted tests for changed interactive components.

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
   description: Concise active-voice description for search and social previews.
   ---
   ```

3. Add the page to `vocs.config.ts` sidebar when it should be discoverable.
4. Preserve old deep links with explicit anchors when renaming headings:

   ```mdx
   ## Tempo API pagination modes {#modes}
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

Before finishing docs changes, scan changed Markdown files for generic H2s:

```bash
git diff --name-only -- '*.md' '*.mdx' \
  | xargs rg -n '^## +(Overview|Usage|Parameters|Returns?|Examples|Setup|Configuration|Reference|Request|Response|Errors|Best Practices|Next Steps)( +\{#[^}]+\})?$'
```

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

- Use active voice, present tense, and second person.
- Lead with the recommended path, then place alternatives under an advanced or reference section.
- Keep intro paragraphs short. Avoid repeating sidebar or page titles.
- Use sentence case for headings unless the product or protocol term requires capitalization.
- Use code font for commands, file paths, parameters, status codes, object names, and literal values.
- Use concrete nouns. Avoid vague labels like "things", "stuff", "various", and "etc." when a specific list is possible.
- Avoid filler such as "simply", "just", "easy", "obviously", and "seamlessly".
- Avoid future tense for behavior that is already true. Prefer "The server returns..." over "The server will return...".
- Do not use humor, exclamation points, rhetorical questions, or marketing claims that are not backed by the docs.
- Use "stablecoins" for Tempo payment assets unless discussing broader cryptocurrency categories.

## Protocol Concept Naming

- Use literal concept names in user-facing docs.
- Use `TIP-20 Tokens` for sidebar labels, page titles, headings, and first-introduction contexts.
- Use `TIP-20 tokens` in sentence-case prose after introduction.
- Use `Tempo Token Rewards` in sidebar, concept introductions, and rewards-specific resource cards. Do not append `(TIP-20)`.
- Keep raw TIP references for technical/spec contexts, such as `TIP-20 ABI`, `TIP-403 policy check`, and links titled `TIP-20 Specification`.
- Add the TIP number in parentheses only when it helps disambiguate.

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

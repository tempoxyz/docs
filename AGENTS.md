# Tempo Documentation (docs-next)

Vocs-powered documentation site for Tempo protocol.

## Commands

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run check` - Run typecheck

## Adding a New Page

1. Create `.mdx` file in appropriate `pages/` subdirectory (match URL path to file path)
2. **Add SEO frontmatter** at the top of the file (required):
   ```yaml
   ---
   title: Page Title Here
   description: A concise 150-160 character description for search engines and social sharing.
   ---
   ```
   - **title**: Concise, descriptive page title (used in `<title>` and OG tags)
   - **description**: 150-160 characters, active voice, describes what the page covers
3. Add entry to sidebar in `vocs.config.tsx`
4. Run `bun run dev` to verify, then `bun run check` before committing

## SEO Configuration

- **Dynamic OG images**: Generated via `/api/og.tsx` using title and description from frontmatter
- **Config**: `vocs.config.tsx` sets `baseUrl`, `ogImageUrl` (with `%title` and `%description` template variables), and `titleTemplate`
- All pages automatically get proper `<title>`, `<meta description>`, Open Graph, and Twitter Card tags from frontmatter

## Page Structure

- Start every page with a specific `#` title and required SEO frontmatter.
- Follow the title with a concise overview paragraph that states what the page helps the reader do or understand.
- Use task-, product-, API-, command-, or protocol-specific `##` headings.
- Put procedural steps in `:::::steps` containers instead of manual numbered headings.
- Use examples only when they are tied to a concrete tool, workflow, API, or command.
- End guide and reference pages with specific next steps or related docs when useful.

## Heading Specificity

Write headings for topical relevance and AI extraction. Avoid standalone generic H2/H3 headings such as:

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

Prefer headings that include the page topic, API, command, protocol, or user task:

- `Tempo API pagination modes`
- `` `tempo request` examples ``
- `Hosted fee payer API reference`
- `T7 upgrade overview`
- `Foundry MPP configuration`
- `Indexer API error response format`

When renaming an existing heading, preserve deep links with an explicit anchor:

```mdx
## Tempo API pagination modes {#modes}
```

Exceptions are allowed for generated or standards-format pages, such as TIP sections with required titles (`Abstract`, `Motivation`, `Specification`, `Test Cases`). Keep exceptions narrow.

Before finishing docs changes, scan changed Markdown files for generic H2s and rename any new or touched matches:

```bash
git diff --name-only -- '*.md' '*.mdx' \
  | xargs rg -n '^## +(Overview|Usage|Parameters|Returns?|Examples|Setup|Configuration|Reference|Request|Response|Errors|Best Practices|Next Steps)( +\{#[^}]+\})?$'
```

## Protocol Concept Naming

- Use literal concept names in user-facing docs. Add the TIP number in parentheses only in the sidebar and when first introducing a concept if it helps disambiguate.
- Use `TIP-20 Tokens` for sidebar labels, page titles, headings, and first-introduction contexts; use `TIP-20 tokens` in sentence-case prose after that.
- Use `Tempo Token Rewards` in sidebar, concept introductions, and rewards-specific resource cards. Do not append `(TIP-20)`.
- Keep raw TIP references for technical/spec contexts, e.g. `TIP-20 ABI`, `TIP-403 policy check`, or links titled `TIP-20 Specification`.

## Numbered Steps

When writing step-by-step instructions in guides, use the `:::::steps` container directive instead of manual `### Step 1`, `#### Step 2` headings. Each step is a `###` heading inside the container. The steps are auto-numbered by the renderer.

```mdx
:::::steps

### Do the first thing

Content for step 1.

### Do the second thing

Content for step 2.

:::::
```

See https://mpp.dev/guides/multiple-payment-methods for a reference example.

## Project Structure

- `src/pages/` - MDX documentation pages
- `src/components/` - React components
- `api/` - Vercel serverless functions (OG image generation)
- `public/` - Static assets
- `vocs.config.ts` - Vocs configuration (sidebar, nav, SEO)
- `vercel.json` - Vercel deployment config (redirects, rewrites)

## TIPs (Tempo Improvement Proposals)

TIPs are stored in `src/pages/protocol/tips/` with YAML frontmatter:

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

The `TipsList` component automatically reads TIPs via `import.meta.glob` and displays them sorted by number.

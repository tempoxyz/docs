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

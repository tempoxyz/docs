# Archived blog sources

Create and edit blog posts in [tempoxyz/tempo.xyz](https://github.com/tempoxyz/tempo.xyz), following that repository's guidance.
The canonical articles live at `https://tempo.xyz/blog/`.

This folder preserves the six original post sources for rollback and migration checks.
The docs application does not render, index, or publish them. Adding a file here does not publish a post.

Keep `public/blog/` and archived share images reachable for existing media links.
Preserve the exact HTML and Markdown redirects in `src/lib/blog-migration.ts` and `vercel.json`.
Do not redirect the entire `/blog/` subtree; it still serves those assets.

`DIAGRAMS.md` describes the historical artwork format, not current authoring instructions.

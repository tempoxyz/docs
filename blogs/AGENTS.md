# Writing blog posts

Posts in this folder are rendered at `/blog` (index with category filters) and `/blog/<filename>` (post page). Drop a `.md` file here and it ships — no registration step.

Name post files in kebab-case (`my-post-title.md`). ALL-CAPS `.md` files in this folder (like this one and `DIAGRAMS.md`) are documentation and are excluded from the site.

To keep a post as a draft (written but not published), move it into the `drafts/` subfolder. Only `.md` files directly in `blogs/` are published; anything in a subfolder is ignored. Move it back up to ship it.

## Frontmatter (required)

```yaml
---
title: "Tuning Reth for payments: how we hit 21,200 TPS"
excerpt: "One or two sentences shown on the index and as the post's lede."
metaTitle: "Tuning Reth for payments: how we hit 21,200 TPS" # optional SEO title
metaDescription: "Custom search and social preview copy." # optional SEO description
date: 2026-06-02
category: technical # network-upgrades | events | technical | case-studies
featured: true # optional — pins the post to the hero card on /blog
---
```

`category` must be one of the four slugs above (the build fails loudly otherwise). `metaTitle` and `metaDescription` override the browser, OpenGraph, Twitter, and JSON-LD metadata. Blog OpenGraph images are generated dynamically from the post title with the `DEV BLOG` label. At most one post should be `featured`; if none is, the newest post takes the hero card.

## Body

Standard markdown + GFM (tables, strikethrough). Code blocks are syntax-highlighted at build time by Shiki — always tag the language:

````markdown
```rust
fn main() {}
```
````

## Images

- Assets live in `public/blog/`, referenced root-relative: `![Alt text](/blog/my-asset.svg)`
- Alt text is required. An italic-only paragraph directly after an image renders as a caption:

```markdown
![Sustained TPS by release](/blog/reth-tps-benchmark.svg)

*Benchmarked on a live network under continuous load.*
```

- Prefer SVG for charts and diagrams, photos as compressed JPEG/PNG.

## Diagrams

Charts and diagrams must follow the house diagram style — dark monochrome,
mono type, single accent. Before drawing one, read
[`DIAGRAMS.md`](./DIAGRAMS.md) in this folder; it has the full palette,
typography rules, layout system, and copy-paste templates.

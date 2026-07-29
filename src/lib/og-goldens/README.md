# OG image goldens

These fixtures show representative output from the dynamic social-image generator. Run
`pnpm og:goldens` after an intentional visual change, then review the PNG diff before
committing it. Run `pnpm og:goldens:check` to verify that the renderer still matches the
checked-in fixtures.

| Case | Expected image |
| --- | --- |
| Short title | ![Short title](./short-title.png) |
| Two-line title | ![Two-line title](./two-line-title.png) |
| Three-line title | ![Three-line title](./three-line-title.png) |
| Section and subsection | ![Section and subsection](./section-and-subsection.png) |
| Unicode title | ![Unicode title](./unicode-title.png) |
| Long unbreakable title | ![Long unbreakable title](./long-unbreakable-title.png) |

# Documentation overview illustrations

Editable sources for the seven top-level documentation illustrations. The supplied
Tempo Interface, Linework, and Illustration Foundations packs define the visual
language. Static images are used here; no motion dependencies are required.

## Regenerate the SVG assets

Run from the repository root:

```bash
node scripts/illustrations/generate.mjs
```

The generator preserves SVG text. `DocsProductOverview` embeds the SVG markup
directly in the page so its labels remain selectable, using the existing Pilat and
JetBrains Mono site fonts. Assets contain no raster images or font binaries.

## Composition choices

- Interface: Accounts and Earn. One product state per illustration,
  one neutral panel with a transparent surround, one emphasis, no UI chrome or shadows.
- Linework: Get Started, Routes, Zones, Machine Payments, and Partners. Thin neutral structure,
  smoothed square marks, and one selected path; drawn on the page's white surface.
- Get Started uses the Ledger rows variant of LNW-P2 at Standard scale and Medium
  density: evenly spaced records, one emphasized entry, no product values or status.
- Docs adaptation: a compact 480 × 360 logical composition exported at 960 × 720,
  shown beside overview copy or stacked on smaller screens. This reframes the
  supplied patterns for readable documentation placement rather than scaling down
  a full marketing artboard with tiny text.
- Neutral colors follow the page theme through CSS custom properties. Product numbers are illustrative;
  no APY, settlement time, fee promise, or unsupported destination is shown.
- Existing guide text remains the source of technical detail. The SVGs introduce
  each product; they are not substitutes for protocol diagrams or working controls.

Edit the scene modules and regenerate; do not hand-edit generated SVG paths.

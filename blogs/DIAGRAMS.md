# Blog diagram style guide

The house style for every chart and diagram embedded in a blog post. Diagrams
are hand-written static SVGs — no charting library, no runtime component. The
constraint is the point: everything is flat, monochrome, monospaced, and
square, with a single accent color carrying the one idea the diagram exists to
show.

Reference implementations: `public/blog/reth-tps-benchmark.svg` (chart),
`public/blog/parallel-execution-lanes.svg` (box/lane diagram).

There is a live playground at [`/diagrams`](/diagrams) (run the dev server and
open it in a browser): edit the style tokens and chart data, preview both
templates, and copy or download ready-to-ship SVG. The values below are the
house defaults; if the playground tokens and this document ever disagree, this
document wins.

## Rules in one paragraph

Dark `#0e0e0e` canvas, 840px wide. All text is monospace, labels are
UPPERCASE. Boxes are sharp-cornered rectangles with 1px strokes. Everything is
greyscale except **one** accent color, used only on the element the diagram is
about. No gradients, no shadows, no rounded corners, no icons, no second
accent.

## Canvas

| Property | Value |
| --- | --- |
| Width | `840` (fixed — matches the post column) |
| Height | whatever the content needs, typically 360–420 |
| Background | full-bleed `<rect>` of `#0e0e0e` |
| Margins | 40px on all sides; content starts at `x=40` |
| Root attrs | `fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, 'JetBrains Mono', monospace"` |

The site wraps embedded images in a 1px border, so don't draw your own outer
frame.

## Palette

Hardcode these hex values — an SVG loaded via `<img>` can't read the site's
CSS variables. They mirror tokens in `app/globals.css`:

| Role | Value | Mirrors token |
| --- | --- | --- |
| Canvas background | `#0e0e0e` | `--surface-block` |
| Neutral box fill | `#1c1c1c` | — |
| Neutral box stroke | `#2e2e2e` | `--line-strong` |
| Gridlines, dividers | `#181818` | `--line` |
| Dashed annotation stroke | `#2e2e2e`, `stroke-dasharray="4 4"` | — |
| Accent stroke/text | `#65ff54` | `--indicator-green` |
| Accent fill | `#143810` | — |
| Alt accent (rare) | `#5d88ff` stroke, `#10204d` fill | `--accent-blue` |

Use green by default. Reach for blue only when a single diagram genuinely
needs two accents (almost never).

## Typography

All monospace (inherited from the root `font-family`), all caps for labels:

| Role | Size | Fill |
| --- | --- | --- |
| Title | `13`, `letter-spacing="0.04em"` | `rgba(255,255,255,0.85)` |
| Subtitle | `11` | `rgba(255,255,255,0.4)` |
| Box/data labels | `11` | `rgba(255,255,255,0.6)` neutral, `#65ff54` accent |
| Axis ticks, lane names | `10`–`11` | `rgba(255,255,255,0.3)`–`0.35` |
| Emphasized value or axis label | `11` | `rgba(255,255,255,0.7)` |

Every diagram opens with a title block at the top left:

```xml
<text x="40" y="44" font-size="13" letter-spacing="0.04em" fill="rgba(255,255,255,0.85)">TITLE OF THE DIAGRAM</text>
<text x="40" y="64" font-size="11" fill="rgba(255,255,255,0.4)">ONE-LINE QUALIFIER OR DATA SOURCE</text>
```

## Layout

- Center text in boxes with `text-anchor="middle"`; vertically, place text
  baseline ~5px below box center (e.g. 32px-tall box at `y=256` → text
  `y=277`).
- Separate stacked sections with a full-width `#181818` divider line.
- Charts: gridlines `#181818` with tick labels on the left, a `#2e2e2e`
  baseline, values labeled above each mark.
- Annotate empty/conceptual regions with a dashed `#2e2e2e` rect and a muted
  centered label (see "RECLAIMED BLOCKSPACE" in the lanes diagram).

## Templates

### Bar chart

```xml
<svg width="840" height="420" viewBox="0 0 840 420" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, 'JetBrains Mono', monospace">
  <rect width="840" height="420" fill="#0e0e0e"/>
  <text x="40" y="44" font-size="13" letter-spacing="0.04em" fill="rgba(255,255,255,0.85)">TITLE</text>
  <text x="40" y="64" font-size="11" fill="rgba(255,255,255,0.4)">QUALIFIER</text>

  <g stroke="#181818">
    <line x1="40" y1="120" x2="800" y2="120"/>
    <line x1="40" y1="240" x2="800" y2="240"/>
  </g>
  <line x1="40" y1="360" x2="800" y2="360" stroke="#2e2e2e"/>

  <!-- neutral bar -->
  <rect x="120" y="250" width="96" height="110" fill="#1c1c1c" stroke="#2e2e2e"/>
  <text x="168" y="238" font-size="11" fill="rgba(255,255,255,0.45)" text-anchor="middle">VALUE</text>
  <text x="168" y="382" font-size="11" fill="rgba(255,255,255,0.4)" text-anchor="middle">LABEL</text>

  <!-- accent bar: the data point the diagram is about -->
  <rect x="612" y="106" width="96" height="254" fill="#143810" stroke="#65ff54"/>
  <text x="660" y="94" font-size="11" fill="#65ff54" text-anchor="middle">VALUE</text>
  <text x="660" y="382" font-size="11" fill="rgba(255,255,255,0.7)" text-anchor="middle">LABEL</text>
</svg>
```

### Box / lane diagram

```xml
<svg width="840" height="220" viewBox="0 0 840 220" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, 'JetBrains Mono', monospace">
  <rect width="840" height="220" fill="#0e0e0e"/>
  <text x="40" y="44" font-size="13" letter-spacing="0.04em" fill="rgba(255,255,255,0.85)">TITLE</text>
  <text x="40" y="64" font-size="11" fill="rgba(255,255,255,0.4)">QUALIFIER</text>

  <text x="40" y="120" font-size="11" fill="rgba(255,255,255,0.35)">LANE</text>

  <!-- neutral box -->
  <rect x="120" y="96" width="110" height="36" fill="#1c1c1c" stroke="#2e2e2e"/>
  <text x="175" y="119" font-size="11" fill="rgba(255,255,255,0.6)" text-anchor="middle">item</text>

  <!-- accent box -->
  <rect x="246" y="96" width="110" height="36" fill="#143810" stroke="#65ff54"/>
  <text x="301" y="119" font-size="11" fill="#65ff54" text-anchor="middle">item</text>

  <!-- conceptual region -->
  <rect x="372" y="96" width="200" height="36" fill="none" stroke="#2e2e2e" stroke-dasharray="4 4"/>
  <text x="472" y="119" font-size="11" fill="rgba(255,255,255,0.35)" text-anchor="middle">ANNOTATION</text>
</svg>
```

## Shipping checklist

1. Save to `public/blog/<kebab-name>.svg`.
2. **Validate the XML** — SVGs loaded via `<img>` are strict XML. One bad
   byte (smart quote, em dash corrupted to a control char, unescaped `&`)
   silently breaks the whole image in the browser:

   ```bash
   xmllint --noout public/blog/<name>.svg
   ```

   Escape `&` as `&amp;` and `<` as `&lt;` in labels. Em dashes are fine as
   UTF-8 `—`, but verify with xmllint after writing.
3. Embed with required alt text and an optional italic caption:

   ```markdown
   ![One sentence describing what the diagram shows](/blog/<name>.svg)

   *Optional caption.*
   ```

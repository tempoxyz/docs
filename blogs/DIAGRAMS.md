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

Theme-aware canvas, 840px wide. All text is monospace, labels are UPPERCASE.
Boxes are sharp-cornered rectangles with 1px strokes. Everything is greyscale
except **one** accent color, used only on the element the diagram is about. No
gradients, no shadows, no rounded corners, no icons, no second accent.

## Theme-aware colors (important)

Diagrams are **inlined into the page HTML at build time** (see
`src/marketing/blogPlugin.ts`), so they follow the site's light/dark theme.
**Do not hardcode hex colors.** Instead:

- Use the `class="..."` hooks below for shapes — they map to theme tokens in
  `src/pages/_root.css` (the `.blog-prose svg.blog-diagram .dgm-*` rules).
- Use `fill="currentColor"` + `fill-opacity="..."` for all text. `currentColor`
  resolves to the theme foreground (light text on dark, dark text on light).

| Hook | Element | Maps to |
| --- | --- | --- |
| `class="dgm-bg"` | full-bleed background `<rect>` | `--diagram-bg` |
| `class="dgm-box"` | neutral box `<rect>` (fill + stroke) | `--diagram-box` / `--diagram-box-border` |
| `class="dgm-accent-box"` | the one accent box `<rect>` | `--diagram-accent-bg` / `--diagram-accent` |
| `class="dgm-line"` | gridlines/connectors/baseline `<line>` | `--diagram-line` |
| `class="dgm-line-soft"` | faint dividers `<line>` | `--diagram-line-soft` |
| `class="dgm-accent-line"` | accent connector `<line>`/`<g>` | `--diagram-accent` |
| `class="dgm-accent"` | accent text/`<g>` (fill) | `--diagram-accent` |

`class` can go on a `<g>` to apply to all children (e.g. a group of accent
text or connector lines).

## Canvas

| Property | Value |
| --- | --- |
| Width | `840` (fixed — matches the post column) |
| Height | whatever the content needs, typically 360–420 |
| Background | full-bleed `<rect class="dgm-bg">` |
| Margins | 40px on all sides; content starts at `x=40` |
| Root attrs | `fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, 'JetBrains Mono', monospace"` |

The site wraps embedded diagrams in a 1px border, so don't draw your own outer
frame. (The build adds `class="blog-diagram"` and `role="img"` to the root
`<svg>` automatically — don't add them by hand.)

## Palette

**Don't hardcode hex.** Use the class hooks (shapes) and `currentColor` (text)
from the "Theme-aware colors" section above so the diagram works in both
themes. The tokens resolve to these values:

| Role | Hook | Dark | Light |
| --- | --- | --- | --- |
| Canvas background | `dgm-bg` | `#0e0e0e` | `#f5f5f5` |
| Neutral box | `dgm-box` | `#1c1c1c` / `#2e2e2e` | `#ffffff` / `#d4d4d4` |
| Gridlines, connectors | `dgm-line` | `#2e2e2e` | `#d4d4d4` |
| Faint dividers | `dgm-line-soft` | `#181818` | `#e5e5e5` |
| Accent box | `dgm-accent-box` | `#143810` / `#65ff54` | `#e3f5e5` / `#168f24` |
| Accent stroke/text | `dgm-accent` / `dgm-accent-line` | `#65ff54` | `#168f24` |
| All text | `currentColor` + `fill-opacity` | foreground | foreground |

Use green (the default accent) only. There is no second accent.

## Typography

All monospace (inherited from the root `font-family`), all caps for labels.
Use `fill="currentColor"` with the opacity below; accent text uses
`class="dgm-accent"` instead:

| Role | Size | Fill |
| --- | --- | --- |
| Title | `13`, `letter-spacing="0.04em"` | `currentColor` `fill-opacity="0.85"` |
| Subtitle | `11` | `currentColor` `fill-opacity="0.4"` |
| Box/data labels | `11` | `currentColor` `fill-opacity="0.6"`, or `class="dgm-accent"` |
| Axis ticks, lane names | `10`–`11` | `currentColor` `fill-opacity="0.3"`–`0.35` |
| Emphasized value or axis label | `11` | `currentColor` `fill-opacity="0.7"` |

Every diagram opens with a title block at the top left:

```xml
<text x="40" y="44" font-size="13" letter-spacing="0.04em" fill="currentColor" fill-opacity="0.85">TITLE OF THE DIAGRAM</text>
<text x="40" y="64" font-size="11" fill="currentColor" fill-opacity="0.4">ONE-LINE QUALIFIER OR DATA SOURCE</text>
```

## Layout

- Center text in boxes with `text-anchor="middle"`; vertically, place text
  baseline ~5px below box center (e.g. 32px-tall box at `y=256` → text
  `y=277`).
- Separate stacked sections with a full-width `class="dgm-line-soft"` divider.
- Charts: gridlines `class="dgm-line-soft"` with tick labels on the left, a
  `class="dgm-line"` baseline, values labeled above each mark.
- Annotate empty/conceptual regions with a dashed `class="dgm-line"` rect
  (`stroke-dasharray="4 4"`) and a muted centered label (see "RECLAIMED
  BLOCKSPACE" in the lanes diagram).

## Templates

### Bar chart

```xml
<svg width="840" height="420" viewBox="0 0 840 420" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, 'JetBrains Mono', monospace">
  <rect class="dgm-bg" width="840" height="420"/>
  <text x="40" y="44" font-size="13" letter-spacing="0.04em" fill="currentColor" fill-opacity="0.85">TITLE</text>
  <text x="40" y="64" font-size="11" fill="currentColor" fill-opacity="0.4">QUALIFIER</text>

  <g class="dgm-line-soft">
    <line x1="40" y1="120" x2="800" y2="120"/>
    <line x1="40" y1="240" x2="800" y2="240"/>
  </g>
  <line class="dgm-line" x1="40" y1="360" x2="800" y2="360"/>

  <!-- neutral bar -->
  <rect class="dgm-box" x="120" y="250" width="96" height="110"/>
  <text x="168" y="238" font-size="11" fill="currentColor" fill-opacity="0.45" text-anchor="middle">VALUE</text>
  <text x="168" y="382" font-size="11" fill="currentColor" fill-opacity="0.4" text-anchor="middle">LABEL</text>

  <!-- accent bar: the data point the diagram is about -->
  <rect class="dgm-accent-box" x="612" y="106" width="96" height="254"/>
  <text class="dgm-accent" x="660" y="94" font-size="11" text-anchor="middle">VALUE</text>
  <text x="660" y="382" font-size="11" fill="currentColor" fill-opacity="0.7" text-anchor="middle">LABEL</text>
</svg>
```

### Box / lane diagram

```xml
<svg width="840" height="220" viewBox="0 0 840 220" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, 'JetBrains Mono', monospace">
  <rect class="dgm-bg" width="840" height="220"/>
  <text x="40" y="44" font-size="13" letter-spacing="0.04em" fill="currentColor" fill-opacity="0.85">TITLE</text>
  <text x="40" y="64" font-size="11" fill="currentColor" fill-opacity="0.4">QUALIFIER</text>

  <text x="40" y="120" font-size="11" fill="currentColor" fill-opacity="0.35">LANE</text>

  <!-- neutral box -->
  <rect class="dgm-box" x="120" y="96" width="110" height="36"/>
  <text x="175" y="119" font-size="11" fill="currentColor" fill-opacity="0.6" text-anchor="middle">item</text>

  <!-- accent box -->
  <rect class="dgm-accent-box" x="246" y="96" width="110" height="36"/>
  <text class="dgm-accent" x="301" y="119" font-size="11" text-anchor="middle">item</text>

  <!-- conceptual region -->
  <rect class="dgm-line" x="372" y="96" width="200" height="36" fill="none" stroke-dasharray="4 4"/>
  <text x="472" y="119" font-size="11" fill="currentColor" fill-opacity="0.35" text-anchor="middle">ANNOTATION</text>
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

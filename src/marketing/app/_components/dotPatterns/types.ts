// The shared "language" every dot pattern speaks. A pattern is a pure function
// of time + grid size that returns which cells to light, with per-cell
// intensity and color. Static shapes ignore `t`; animated ones vary with it.

export type LitCell = {
  col: number
  row: number
  // 0..1 opacity for this dot.
  alpha: number
  // "r, g, b" string; defaults to the bright dot color when omitted.
  color?: string
}

export type PatternCtx = {
  // Seconds since the pattern was last revealed (enters view / tab switch).
  t: number
  cols: number
  rows: number
}

export type DotPattern = (ctx: PatternCtx) => LitCell[]

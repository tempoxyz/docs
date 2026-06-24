// Agency palette (Figma node 60:132). Single source for the feature hover/select
// squares.
export const PALETTE = ['#d487f3', '#5d88ff', '#58b88a', '#cde769'] as const

export type PaletteColor = (typeof PALETTE)[number]

// A stable palette color for a given list index — each item keeps its own color
// for the life of the page instead of re-rolling on every hover. Cycles through
// the palette so adjacent items never share a color.
export const colorForIndex = (i: number): PaletteColor => PALETTE[i % PALETTE.length]

const MAX_FONT_SIZE = 105
const MIN_FONT_SIZE = 48
const MAX_TEXT_WIDTH = 960
const AVERAGE_CHARACTER_WIDTH = 0.58
const MAX_LINES = 3

function estimatedWidth(text: string, fontSize: number): number {
  return text.length * fontSize * AVERAGE_CHARACTER_WIDTH
}

function partitions(words: string[], lineCount: number): string[][] {
  if (lineCount === 1) return [[words.join(' ')]]

  const results: string[][] = []
  for (let split = 1; split <= words.length - lineCount + 1; split++) {
    const first = words.slice(0, split).join(' ')
    for (const rest of partitions(words.slice(split), lineCount - 1)) {
      results.push([first, ...rest])
    }
  }
  return results
}

/**
 * Lay out an OG title on up to three balanced lines. Prefer the fewest lines
 * that fit at full size, then reduce the font size for unbreakable long words.
 */
export function layoutTitle(title: string): { lines: string[]; fontSize: number } {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { lines: ['Tempo'], fontSize: MAX_FONT_SIZE }

  const maxLineCount = Math.min(MAX_LINES, words.length)
  let candidates: string[][] = []

  for (let lineCount = 1; lineCount <= maxLineCount; lineCount++) {
    const layouts = partitions(words, lineCount)
    const fittingLayouts = layouts.filter((lines) =>
      lines.every((line) => estimatedWidth(line, MAX_FONT_SIZE) <= MAX_TEXT_WIDTH),
    )
    if (fittingLayouts.length > 0) {
      candidates = fittingLayouts
      break
    }
    candidates = layouts
  }

  const lines = candidates.reduce((best, candidate) => {
    const spread =
      Math.max(...candidate.map((line) => line.length)) -
      Math.min(...candidate.map((line) => line.length))
    const bestSpread =
      Math.max(...best.map((line) => line.length)) - Math.min(...best.map((line) => line.length))
    return spread < bestSpread ? candidate : best
  })

  const longestLine = lines.reduce((longest, line) =>
    line.length > longest.length ? line : longest,
  )
  const fittingFontSize = Math.floor(
    MAX_TEXT_WIDTH / (longestLine.length * AVERAGE_CHARACTER_WIDTH),
  )

  return {
    lines,
    fontSize: Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, fittingFontSize)),
  }
}

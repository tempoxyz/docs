import { arrowPattern } from './arrow'
import { buildAmbient, buildPatterns } from './build'
import { costPattern } from './cost'
import { librariesPatterns } from './libraries'
import { performancePattern } from './performance'
import { reliabilityPattern } from './reliability'
import { speedPattern } from './speed'
import type { DotPattern } from './types'

export type { DotPattern, LitCell, PatternCtx } from './types'
export {
  arrowPattern,
  buildAmbient,
  buildPatterns,
  costPattern,
  librariesPatterns,
  performancePattern,
  reliabilityPattern,
  speedPattern,
}

// Wiring: which pattern each section/tab speaks. Add new patterns here as
// their sections are built.
export const patternByCategory: Record<string, DotPattern> = {
  Reliability: reliabilityPattern,
  Cost: costPattern,
  Speed: speedPattern,
  Performance: performancePattern,
}

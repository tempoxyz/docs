'use client'

import { heroAmbientPlusPattern } from './heroPattern'
import PlusCanvas from './PlusCanvas'

export default function HeroPatternCanvas() {
  return <PlusCanvas className="-z-10" pattern={heroAmbientPlusPattern} />
}

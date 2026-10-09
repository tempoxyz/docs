'use client'

import * as ui from './HeroPatternCanvas.recipes'
import { heroAmbientPlusPattern } from './heroPattern'
import PlusCanvas from './PlusCanvas'

export default function HeroPatternCanvas() {
  return <PlusCanvas className={ui.plusCanvas().className} pattern={heroAmbientPlusPattern} />
}

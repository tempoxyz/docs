'use client'

import DotCanvas from './DotCanvas'
import * as ui from './HeroDots.recipes'
import { heroAmbientPattern, heroAmbientPlusPattern } from './heroPattern'
import PlusCanvas from './PlusCanvas'

// Client wrapper so server-rendered pages can use the canvas: pattern
// functions can't cross the server→client boundary as props. The top-down
// gradient mutes the upper dots, matching the homepage hero treatment.
export default function HeroDots({ plus = false }: { plus?: boolean }) {
  return (
    <>
      {plus ? (
        <PlusCanvas className={ui.plusCanvas().className} pattern={heroAmbientPlusPattern} />
      ) : (
        <DotCanvas className={ui.plusCanvas().className} pattern={heroAmbientPattern} />
      )}
      <div aria-hidden="true" {...ui.heroDotsLayout()} />
    </>
  )
}

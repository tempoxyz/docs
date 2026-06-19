'use client'

import DotCanvas from './DotCanvas'
import { heroAmbientPattern, heroAmbientPlusPattern } from './heroPattern'
import PlusCanvas from './PlusCanvas'

// Client wrapper so server-rendered pages can use the canvas: pattern
// functions can't cross the server→client boundary as props. The top-down
// gradient mutes the upper dots, matching the homepage hero treatment.
export default function HeroDots({ plus = false }: { plus?: boolean }) {
  return (
    <>
      {plus ? (
        <PlusCanvas className="-z-10" pattern={heroAmbientPlusPattern} />
      ) : (
        <DotCanvas className="-z-10" pattern={heroAmbientPattern} />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[0%] from-surface-shell via-[50%] via-surface-shell/95 to-[100%] to-transparent"
      />
    </>
  )
}

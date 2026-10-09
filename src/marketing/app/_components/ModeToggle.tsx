'use client'

import { cx as composeStyles } from 'zyzz'
import * as ui from './ModeToggle.recipes'
export type ShowcaseMode = 'visual' | 'code'

export default function ModeToggle({
  mode,
  setMode,
}: {
  mode: ShowcaseMode
  setMode: (mode: ShowcaseMode) => void
}) {
  const labels = {
    visual: 'Diagram',
    code: 'Code',
  } satisfies Record<ShowcaseMode, string>

  return (
    <div {...ui.modeToggleLayout()}>
      <span {...ui.modeToggleText()}>
        {(['visual', 'code'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            {...composeStyles(
              ui.modeToggleButton(),
              !!(mode === option) && ui.modeToggleButton2(),
              !(mode === option) && ui.modeToggleButton3(),
            )}
          >
            {labels[option]}
          </button>
        ))}
      </span>
    </div>
  )
}

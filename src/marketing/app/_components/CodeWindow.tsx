'use client'

import { useState } from 'react'
import { cx as composeStyles } from 'zyzz'
import CodePanel from './CodePanel'
import * as ui from './CodeWindow.recipes'

export type CodeVariant = {
  lang: string
  code: string[]
  highlight?: string[]
}

// macOS-style window chrome around a syntax-highlighted snippet; the "code"
// half of the showcase visual/code toggle.
export default function CodeWindow({
  title,
  code,
  highlight,
  variants,
  activeIndex: activeIndexProp,
  onActiveChange,
  heightClassName = '',
}: {
  title: string
  code?: string[]
  highlight?: string[]
  variants?: CodeVariant[]
  activeIndex?: number
  onActiveChange?: (index: number) => void
  // Lets callers cap or lock the window height when it sits inside a framed
  // visual/code panel.
  heightClassName?: string
}) {
  const panels = variants ?? [{ lang: 'Code', code: code ?? [], highlight }]
  const [uncontrolledActiveIndex, setUncontrolledActiveIndex] = useState(0)
  const activeIndex = activeIndexProp ?? uncontrolledActiveIndex
  const activePanelIndex = Math.min(activeIndex, panels.length - 1)
  const active = panels[activePanelIndex]
  const setActivePanelIndex = (index: number) => {
    setUncontrolledActiveIndex(index)
    onActiveChange?.(index)
  }

  return (
    <div
      className={` ${ui.codeWindowLayout().className} ${heightClassName} ${ui.codeWindowLayout2().className} `}
    >
      <div {...ui.codeWindowLayout3()}>
        <span aria-hidden="true" {...ui.codeWindowText()} />
        <span aria-hidden="true" {...ui.codeWindowText2()} />
        <span aria-hidden="true" {...ui.codeWindowText3()} />
        <span {...ui.codeWindowText4()}>{title}</span>
      </div>
      {variants && variants.length > 1 ? (
        <div {...ui.codeWindowLayout4()}>
          {panels.map((panel, index) => (
            <button
              key={panel.lang}
              type="button"
              onClick={() => setActivePanelIndex(index)}
              aria-pressed={active === panel}
              {...composeStyles(
                ui.codeWindowButton(),
                !!(active === panel) && ui.codeWindowButton2(),
                !(active === panel) && ui.codeWindowButton3(),
              )}
            >
              {panel.lang}
            </button>
          ))}
        </div>
      ) : null}
      <div {...ui.codeWindowLayout5()}>
        {panels.map((panel, index) => (
          <div
            key={panel.lang}
            inert={active !== panel}
            aria-hidden={active !== panel}
            {...composeStyles(
              ui.codeWindowLayout6(),
              !(index === activePanelIndex) && ui.codeWindowLayout7(),
            )}
          >
            <CodePanel code={panel.code} highlight={panel.highlight} inline bare />
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import CodePanel from './CodePanel'

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
      className={`flex min-h-0 ${heightClassName} flex-col overflow-hidden rounded-lg border border-line bg-surface-block shadow-2xl`}
    >
      <div className="relative flex items-center gap-2 border-line border-b bg-surface-panel px-4 py-3">
        <span aria-hidden className="size-3 shrink-0 rounded-full bg-[#FF5F57]" />
        <span aria-hidden className="size-3 shrink-0 rounded-full bg-[#FEBC2E]" />
        <span aria-hidden className="size-3 shrink-0 rounded-full bg-[#28C840]" />
        <span className="pointer-events-none absolute inset-x-0 text-center font-mono text-[12px] text-foreground/35 tracking-[0.02em]">
          {title}
        </span>
      </div>
      {variants && variants.length > 1 ? (
        <div className="flex border-line border-b bg-surface-block">
          {panels.map((panel, index) => (
            <button
              key={panel.lang}
              type="button"
              onClick={() => setActivePanelIndex(index)}
              aria-pressed={active === panel}
              className={`h-11 border-line border-r px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors last:border-r-0 ${
                active === panel
                  ? 'bg-surface-card-elev text-foreground'
                  : 'text-foreground/40 hover:bg-surface-card hover:text-foreground/70'
              }`}
            >
              {panel.lang}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1">
        {panels.map((panel, index) => (
          <div
            key={panel.lang}
            inert={active !== panel}
            aria-hidden={active !== panel}
            className={`flex min-h-0 bg-surface-block [grid-area:1/1] ${
              index === activePanelIndex ? '' : 'invisible'
            }`}
          >
            <CodePanel code={panel.code} highlight={panel.highlight} inline bare />
          </div>
        ))}
      </div>
    </div>
  )
}

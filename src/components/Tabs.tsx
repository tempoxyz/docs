'use client'

import { type KeyboardEvent, type ReactNode, useRef, useState } from 'react'
import * as ui from './Tabs.recipes'

/** TDS Platform Tab list. Arrow keys move focus (looping), Home and End jump to the
 * ends, and Enter or Space selects, as in the DS (focus does not activate). */
export function Tabs<const value extends string>(props: {
  'aria-label': string
  controls?: string | undefined
  className?: string | undefined
  items: readonly { label: ReactNode; value: value }[]
  onValueChange: (value: value) => void
  value: value
}) {
  const { className, controls, items, onValueChange, value } = props
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const selected = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  )
  const [focused, setFocused] = useState<number | null>(null)
  const tabbable = focused ?? selected

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = focused ?? selected
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1
    if (next < 0) return
    event.preventDefault()
    setFocused(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={props['aria-label']}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null)
      }}
      className={[ui.list().className, className].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => (
        <button
          key={item.value}
          ref={(element) => {
            buttons.current[index] = element
          }}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          aria-controls={controls}
          tabIndex={index === tabbable ? 0 : -1}
          onClick={() => {
            setFocused(index)
            onValueChange(item.value)
          }}
          className={ui.tab().className}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

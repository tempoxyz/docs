'use client'

import { type KeyboardEvent, type ReactNode, useRef } from 'react'
import * as ui from './SegmentedControl.recipes'

/** TDS Platform SegmentedControl: a radio group of buttons. Arrow keys move focus
 * and select (roving tab index), Home and End jump to the ends. */
export function SegmentedControl<const value extends string>(props: {
  'aria-label': string
  className?: string | undefined
  disabled?: boolean | undefined
  items: readonly { label: ReactNode; value: value }[]
  onValueChange: (value: value) => void
  value: value
}) {
  const { className, disabled, items, onValueChange, value } = props
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.value === value)
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
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
    const item = items[next]
    if (!item) return
    onValueChange(item.value)
    buttons.current[next]?.focus()
    buttons.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  return (
    <div
      role="radiogroup"
      aria-label={props['aria-label']}
      onKeyDown={onKeyDown}
      className={[ui.control().className, className].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => {
        const checked = item.value === value
        return (
          // biome-ignore lint/a11y/useSemanticElements: TDS renders each radio as a native button (Base UI Radio).
          <button
            key={item.value}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            data-checked={checked ? '' : undefined}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            onClick={() => onValueChange(item.value)}
            className={ui.item().className}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import * as ui from './SegmentedControl.recipes'

/** TDS Platform SegmentedControl: a radio group of buttons. Arrow keys move focus
 * and select (roving tab index), Home and End jump to the ends. When the items
 * overflow, the control scrolls sideways and fades its clipped edges. */
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
  const control = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState<'start' | 'end' | 'both'>()

  useEffect(() => {
    const scroller = control.current
    if (!scroller) return
    const update = () => {
      const scrolled = Math.abs(scroller.scrollLeft)
      const start = scrolled > 1
      const end = scrolled < scroller.scrollWidth - scroller.clientWidth - 1
      setOverflow(start && end ? 'both' : start ? 'start' : end ? 'end' : undefined)
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  function select(index: number) {
    const item = items[index]
    if (!item) return
    onValueChange(item.value)
    buttons.current[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

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
    select(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      ref={control}
      role="radiogroup"
      aria-label={props['aria-label']}
      data-overflow={overflow}
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
            data-tds-control=""
            data-checked={checked ? '' : undefined}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            onClick={() => select(index)}
            className={ui.item().className}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

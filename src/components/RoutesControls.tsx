import type * as React from 'react'
import { cx } from 'zyzz'
import LucideChevronDown from '~icons/lucide/chevron-down'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

// Form controls and type scale shared by the Routes demo and the supported routes table, matching
// the other docs demos.
export const input = style({
  // design-exception: Match the 40px height of the shared demo buttons.
  minHeight: '40px',
  width: '100%',
  minWidth: 0,
  borderRadius: tokens.radius.md,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  paddingBlock: tokens.spacing['2'],
  paddingInline: tokens.spacing['3'],
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.sm,
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
  },
  ':disabled': { opacity: 0.6 },
})
export const label = style({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: tokens.spacing['1_5'],
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.compact,
})
export const note = style({ color: tokens.color.gray10, fontSize: tokens.fontSize.compact })

/** A native select with the demo input style and a consistent chevron. */
export function Select(props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'>) {
  return (
    <span {...selectFrame()}>
      <select {...props} {...cx(input(), select())} />
      <LucideChevronDown aria-hidden="true" {...chevron()} />
    </span>
  )
}

const selectFrame = style({ position: 'relative', display: 'block', minWidth: 0 })
const select = style({ appearance: 'none', paddingInlineEnd: tokens.spacing['9'] })
const chevron = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetBlockStart: '50%',
  insetInlineEnd: tokens.spacing['3'],
  width: '16px',
  height: '16px',
  translate: '0 -50%',
  color: tokens.color.gray10,
  selectors: { 'select:disabled + &': { opacity: 0.6 } },
})

import type * as React from 'react'
import { cx } from 'zyzz'
import LucideChevronDown from '~icons/lucide/chevron-down'
import { style, vars as tokens } from '../styles/theme'
import { input } from './RoutesControls.styles'

export { input, label, note } from './RoutesControls.styles'

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

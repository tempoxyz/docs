import { Field, Select as TdsSelect, TextInput } from '@tempoxyz/ds'
import type * as React from 'react'
import { cx } from 'zyzz'
import LucideChevronDown from '~icons/lucide/chevron-down'
import { style, vars as tokens } from '../styles/theme'
import { fieldHeading, input, popup } from './RoutesControls.styles'

export { input, label, note, popup } from './RoutesControls.styles'

/** A native select with the demo input style and a consistent chevron. */
export function Select(props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'>) {
  return (
    <span {...selectFrame()}>
      <select {...props} {...cx(input(), select())} />
      <LucideChevronDown aria-hidden="true" {...chevron()} />
    </span>
  )
}

/** A labeled TDS Select for the demo's short lists, so every list in the demo opens the same popup. */
export function Dropdown(
  props: Omit<React.ComponentProps<typeof Field.Root>, 'children' | 'onChange'> & {
    disabled?: boolean | undefined
    id: string
    label: string
    onValueChange: (value: string) => void
    options: readonly { label: string; value: string }[]
    placeholder?: string | undefined
    value: string | undefined
  },
) {
  const { disabled, id, label, onValueChange, options, placeholder, value, ...root } = props
  const items = Object.fromEntries(options.map((option) => [option.value, option.label]))
  return (
    <Field.Root {...root}>
      <Field.Label>{label}</Field.Label>
      <TdsSelect.Root
        items={items}
        value={value || null}
        onValueChange={(next) => {
          if (typeof next === 'string' && next !== value) onValueChange(next)
        }}
      >
        <TdsSelect.Trigger id={id} disabled={disabled}>
          <TdsSelect.Value placeholder={placeholder ?? 'Choose'} />
          <TdsSelect.Icon />
        </TdsSelect.Trigger>
        <TdsSelect.Popup aria-label={label} {...popup()}>
          {options.map((option) => (
            <TdsSelect.Item key={option.value} label={option.label} value={option.value}>
              <TdsSelect.ItemText>{option.label}</TdsSelect.ItemText>
            </TdsSelect.Item>
          ))}
        </TdsSelect.Popup>
      </TdsSelect.Root>
    </Field.Root>
  )
}

/** A labeled TDS text field; `labelEnd` holds controls, such as Connect, beside the label. */
export function TextField(
  props: Omit<React.ComponentProps<typeof Field.Root>, 'children' | 'onChange'> & {
    autoComplete?: string | undefined
    disabled?: boolean | undefined
    id?: string | undefined
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'] | undefined
    label: string
    labelEnd?: React.ReactNode
    onValueChange: (value: string) => void
    placeholder?: string | undefined
    value: string
  },
) {
  const {
    autoComplete,
    disabled,
    id,
    inputMode,
    label,
    labelEnd,
    onValueChange,
    placeholder,
    value,
    ...root
  } = props
  return (
    <Field.Root disabled={disabled} {...root}>
      <span {...fieldHeading()}>
        <Field.Label>{label}</Field.Label>
        {labelEnd}
      </span>
      <TextInput.Group>
        <TextInput.Control
          id={id}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      </TextInput.Group>
    </Field.Root>
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

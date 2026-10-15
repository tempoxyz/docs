'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { cx } from 'zyzz'
import LucideCheck from '~icons/lucide/check'
import LucideChevronDown from '~icons/lucide/chevron-down'
import type { TestMethod } from '../lib/routes-test'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'
import * as Demo from './guides/Demo'
import { ChainLogo, TokenLogo } from './RouteIcons'

/** Where a route is in its lifecycle, as drawn on the canvas. */
export type RoutePhase =
  | 'idle'
  | 'ready'
  | 'quoted'
  | 'funding'
  | 'delivering'
  | 'delivered'
  | 'attention'

export type RouteProgress = {
  phase: RoutePhase
  sendAmount?: string
  receiveAmount?: string
  sourceAddress?: string
  destinationAddress?: string
}

type Option = { value: string; label: string }
type Field = { value: string; options: Option[]; onChange: (value: string) => void }

/**
 * A select-only combobox: the row is the button, and the list shows each choice with its logo.
 * Keyboard use follows the WAI-ARIA select pattern; focus stays on the button while the list is
 * open.
 */
function PickerRow({
  id,
  label,
  field,
  disabled,
  loading,
  badge,
}: {
  id: string
  label: string
  field: Field
  disabled: boolean
  loading?: boolean
  badge: (option?: Option, size?: number) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const typed = useRef({ text: '', at: 0 })
  const { options } = field
  const selectedIndex = options.findIndex((option) => option.value === field.value)
  const selected = options[selectedIndex]
  const placeholder = `Choose ${label.toLowerCase()}`
  const unavailable = disabled || options.length === 0
  const listId = `${id}-options`

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  useEffect(() => {
    if (open && active >= 0) list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])
  useEffect(() => {
    if (unavailable) setOpen(false)
  }, [unavailable])

  const show = (index: number) => {
    setActive(index)
    setOpen(true)
  }
  const choose = (index: number) => {
    const option = options[index]
    setOpen(false)
    if (option && option.value !== field.value) field.onChange(option.value)
  }
  // Typing jumps to the first choice that starts with the typed letters.
  const typeahead = (key: string) => {
    const now = Date.now()
    const text = (now - typed.current.at < 500 ? typed.current.text : '') + key.toLowerCase()
    typed.current = { text, at: now }
    const index = options.findIndex((option) => option.label.toLowerCase().startsWith(text))
    if (index >= 0) show(index)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    const current = active >= 0 ? active : selectedIndex
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        show(open ? Math.min(current + 1, last) : Math.max(selectedIndex, 0))
        return
      case 'ArrowUp':
        event.preventDefault()
        show(open ? Math.max(current - 1, 0) : selectedIndex >= 0 ? selectedIndex : last)
        return
      case 'Home':
        if (!open) return
        event.preventDefault()
        show(0)
        return
      case 'End':
        if (!open) return
        event.preventDefault()
        show(last)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open && current >= 0) choose(current)
        else show(Math.max(selectedIndex, 0))
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        return
      case 'Tab':
        setOpen(false)
        return
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey)
          typeahead(event.key)
    }
  }

  return (
    <div ref={root} {...pickerAnchor()}>
      <label htmlFor={id} {...visuallyHidden()}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
        data-value={field.value}
        disabled={unavailable}
        onClick={() => (open ? setOpen(false) : show(Math.max(selectedIndex, 0)))}
        onKeyDown={onKeyDown}
        {...pickerRow()}
      >
        {badge(selected)}
        <span {...pickerText()}>
          <span aria-hidden="true" {...pickerLabel()}>
            {label}
          </span>
          <span {...cx(pickerValue(), !!selected && pickerValueChosen())}>
            {selected?.label ?? (loading ? 'Loading…' : placeholder)}
          </span>
        </span>
        <LucideChevronDown aria-hidden="true" {...pickerChevron()} />
      </button>
      {open && (
        <div ref={list} id={listId} role="listbox" aria-label={label} {...pickerList()}>
          {options.map((option, index) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: The combobox button handles keys through aria-activedescendant.
            <div
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={option.value === field.value}
              data-active={index === active || undefined}
              // Keep focus on the button so the list stays a popup of it.
              onPointerDown={(event) => event.preventDefault()}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(index)}
              {...pickerOption()}
            >
              {badge(option, 24)}
              <span {...pickerOptionLabel()}>{option.label}</span>
              {option.value === field.value && (
                <LucideCheck aria-hidden="true" {...pickerCheck()} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RouteEndpoint({
  side,
  network,
  asset,
  disabled,
  amount,
  address,
  loading,
}: {
  side: 'From' | 'To'
  network: Field
  asset: Field
  disabled: boolean
  amount?: string
  address?: string
  loading?: boolean
}) {
  const key = side.toLowerCase()
  return (
    <fieldset {...endpoint()}>
      <legend {...visuallyHidden()}>{side}</legend>
      <span aria-hidden="true" {...endpointSide()}>
        {side}
      </span>
      <PickerRow
        id={`routes-${key}-network`}
        label="Network"
        field={network}
        disabled={disabled}
        loading={loading}
        badge={(option, size) => (
          <ChainLogo chainId={option?.value} name={option?.label} size={size} />
        )}
      />
      <PickerRow
        id={`routes-${key}-asset`}
        label="Asset"
        field={asset}
        disabled={disabled}
        loading={loading}
        badge={(option, size) => (
          <TokenLogo
            key={option?.value}
            chainId={network.value}
            tokenKey={option?.value}
            symbol={option?.label}
            size={size}
          />
        )}
      />
      {(amount || address) && (
        <div {...endpointSummary()}>
          {amount && <p {...endpointAmount()}>{amount}</p>}
          {address && (
            <p {...endpointAddress()}>
              {Demo.StringFormatter.truncate(address, { start: 8, end: 6 })}
            </p>
          )}
        </div>
      )}
    </fieldset>
  )
}

// One grey for the path in every phase; motion, not color, shows progress.
const pathColor = 'var(--color-gray10)'

/** The path between the endpoints: how funds travel, and where they are now. */
function RouteConnector({
  phase,
  method,
  methods,
  onMethod,
  locked,
}: {
  phase: RoutePhase
  method?: TestMethod
  methods: TestMethod[]
  onMethod: (method: TestMethod) => void
  locked: boolean
}) {
  // The dashes move from the moment a route is chosen until delivery completes.
  const moving = phase !== 'idle' && phase !== 'delivered'
  return (
    <div {...connector()}>
      <svg aria-hidden="true" viewBox="0 0 200 16" preserveAspectRatio="none" {...connectorPath()}>
        <line
          x1="4"
          y1="8"
          x2="190"
          y2="8"
          stroke={pathColor}
          strokeWidth="1.5"
          strokeDasharray={phase === 'delivered' ? undefined : '5 5'}
          vectorEffect="non-scaling-stroke"
        >
          {moving && (
            <animate
              attributeName="stroke-dashoffset"
              from="20"
              to="0"
              dur="0.9s"
              repeatCount="indefinite"
            />
          )}
        </line>
        <path d="M188 3 L196 8 L188 13" fill="none" stroke={pathColor} strokeWidth="1.5" />
      </svg>
      <span aria-hidden="true" {...connectorArrow()}>
        ↓
      </span>
      <fieldset aria-label="Funding method" {...methodToggle()}>
        {(
          [
            ['transfer', 'Transfer'],
            ['depositAddress', 'Deposit address'],
          ] as const
        ).map(([value, label]) => {
          const available = methods.includes(value)
          return (
            <button
              key={value}
              type="button"
              aria-pressed={method === value}
              disabled={!available || locked}
              title={available ? undefined : 'Not available for this route'}
              onClick={() => onMethod(value)}
              {...methodButton()}
            >
              {label}
            </button>
          )
        })}
      </fieldset>
    </div>
  )
}

/** Choose a route on a canvas: two endpoints and the path between them. */
export function RouteCanvas(props: {
  source: { network: Field; asset: Field }
  destination: { network: Field; asset: Field }
  disabled: boolean
  progress: RouteProgress
  method?: TestMethod
  methods: TestMethod[]
  onMethod: (method: TestMethod) => void
  locked: boolean
  /** The route directory is loading, so the pickers say so instead of asking for a choice. */
  loading?: boolean
}) {
  const { progress } = props
  return (
    <div {...canvas()}>
      <div {...endpoints()}>
        <RouteEndpoint
          side="From"
          {...props.source}
          disabled={props.disabled}
          loading={props.loading}
          amount={progress.sendAmount}
          address={progress.sourceAddress}
        />
        <RouteConnector
          phase={progress.phase}
          method={props.method}
          methods={props.methods}
          onMethod={props.onMethod}
          locked={props.locked}
        />
        <RouteEndpoint
          side="To"
          {...props.destination}
          disabled={props.disabled}
          loading={props.loading}
          amount={progress.receiveAmount}
          address={progress.destinationAddress}
        />
      </div>
    </div>
  )
}

const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: tokens.spacing['0'],
  // design-exception: The standard visually hidden pattern pulls the 1px box out of the flow.
  margin: '-1px !custom',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  borderWidth: tokens.borderWidth.none,
})

const canvas = style({
  borderRadius: tokens.radius.xl,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.line,
  backgroundColor: inherited.color.surfacePanel,
  // design-exception: The dotted grid behind the route is drawn from the theme's line color.
  backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px) !custom',
  // design-exception: One grid dot every 14px, matching the console's Routes canvas.
  backgroundSize: '14px 14px !custom',
  padding: tokens.spacing['3'],
  '@container (width >= 42rem)': { padding: tokens.spacing['4'] },
})
const endpoints = style({
  display: 'grid',
  alignItems: 'center',
  gap: tokens.spacing['3'],
  '@container (width >= 42rem)': {
    gridTemplateColumns: 'minmax(0, 1fr) 13rem minmax(0, 1fr)',
  },
})

const endpoint = style({
  minWidth: 0,
  borderRadius: tokens.radius.lg,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  padding: tokens.spacing['1_5'],
  // design-exception: A faint 1px lift that separates the endpoint cards from the dotted canvas.
  boxShadow: '0 1px 2px rgb(0 0 0 / 0.06) !custom',
})
const endpointSide = style({
  display: 'block',
  paddingInline: tokens.spacing['2_5'],
  paddingBlockStart: tokens.spacing['1_5'],
  paddingBlockEnd: tokens.spacing['0_5'],
  fontWeight: tokens.fontWeight.medium,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray10,
  textTransform: 'uppercase',
  // design-exception: Keep the From/To eyebrow tracking at 0.08em; the label token is wider.
  letterSpacing: '0.08em !custom',
})
const endpointSummary = style({
  marginInline: tokens.spacing['2_5'],
  marginBlockStart: tokens.spacing['1'],
  marginBlockEnd: tokens.spacing['1_5'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.line,
  paddingBlockStart: tokens.spacing['2_5'],
})
const endpointAmount = style({
  fontSize: tokens.fontSize.subheading,
  // 1.4 x 20px = 28px.
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.tight,
  fontVariantNumeric: 'tabular-nums',
  color: inherited.color.textColorPrimary,
})
const endpointAddress = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray10,
})

const pickerAnchor = style({ position: 'relative' })
const pickerRow = style({
  display: 'flex',
  width: '100%',
  minHeight: '48px',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
  borderRadius: tokens.radius.md,
  paddingInline: tokens.spacing['2_5'],
  textAlign: 'start',
  cursor: 'pointer',
  // Tailwind's `transition-colors`.
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (hover: hover)': {
    ':hover': { backgroundColor: inherited.color.surfacePanel },
  },
  '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
  },
  ':disabled': { cursor: 'not-allowed', opacity: 0.6 },
  selectors: {
    '&[aria-expanded="true"]': { backgroundColor: inherited.color.surfacePanel },
    '&:disabled:hover': {
      '@media (hover: hover)': { backgroundColor: 'transparent !custom' },
    },
  },
})
const pickerText = style({ minWidth: 0, flex: 1 })
const pickerLabel = style({
  display: 'block',
  fontSize: tokens.fontSize.caption,
  lineHeight: tokens.lineHeight.caption,
  color: tokens.color.gray10,
})
const pickerValue = style({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.lineHeight.control,
  color: tokens.color.gray10,
})
const pickerValueChosen = style({ color: inherited.color.textColorPrimary })
const pickerChevron = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: tokens.color.gray10,
  // Tailwind's `transition-transform`.
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  selectors: { '[aria-expanded="true"] > &': { rotate: '180deg' } },
})
const pickerList = style({
  position: 'absolute',
  insetBlockStart: '100%',
  insetInlineStart: 0,
  insetInlineEnd: 0,
  // Above the route connector and the API log, like the API key panel.
  zIndex: tokens.zIndex.floating,
  marginBlockStart: tokens.spacing['1'],
  // design-exception: Show about seven choices before the list scrolls.
  maxHeight: '19rem !custom',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  borderRadius: tokens.radius.lg,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  padding: tokens.spacing['1'],
  // design-exception: Lift the choice list off the route canvas like the API key popover.
  boxShadow: '0 8px 24px rgb(0 0 0 / 0.12) !custom',
})
const pickerOption = style({
  display: 'flex',
  minHeight: '40px',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
  borderRadius: tokens.radius.md,
  paddingInline: tokens.spacing['2'],
  cursor: 'pointer',
  fontSize: tokens.fontSize.bodySmall,
  color: inherited.color.textColorPrimary,
  selectors: {
    '&[data-active]': { backgroundColor: inherited.color.surfacePanel },
    '&[aria-selected="true"]': { fontWeight: tokens.fontWeight.medium },
  },
})
const pickerOptionLabel = style({
  minWidth: 0,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const pickerCheck = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: inherited.color.textColorPrimary,
})

const connector = style({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['3'],
  paddingBlock: tokens.spacing['1'],
})
// The path runs sideways only when the endpoints sit in one row; stacked, an arrow points down.
const connectorPath = style({
  display: 'none',
  width: '100%',
  height: '16px',
  '@container (width >= 42rem)': { display: 'block' },
})
const connectorArrow = style({
  color: tokens.color.gray10,
  '@container (width >= 42rem)': { display: 'none' },
})
const methodToggle = style({
  display: 'inline-flex',
  borderRadius: tokens.radius.full,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  padding: tokens.spacing['0_5'],
})
const methodButton = style({
  whiteSpace: 'nowrap',
  borderRadius: tokens.radius.full,
  paddingInline: tokens.spacing['2_5'],
  paddingBlock: tokens.spacing['1'],
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray10,
  // Tailwind's `transition-colors`.
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (hover: hover)': {
    ':hover': { color: inherited.color.textColorPrimary },
  },
  '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  ':disabled': { cursor: 'not-allowed', opacity: 0.4 },
  selectors: {
    '&[aria-pressed="true"]': {
      backgroundColor: inherited.color.backgroundColorInvert,
      color: inherited.color.textColorInvert,
    },
    '&:disabled:hover': { '@media (hover: hover)': { color: tokens.color.gray10 } },
  },
})

'use client'

import type { ReactNode } from 'react'
import { cx } from 'zyzz'
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

/** A native select under a custom face, so it stays accessible and keyboard friendly. */
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
  badge: (option?: Option) => ReactNode
}) {
  const selected = field.options.find((option) => option.value === field.value)
  const current = selected?.label
  return (
    <div {...pickerRow()}>
      {badge(selected)}
      <span {...pickerText()}>
        <span {...pickerLabel()}>{label}</span>
        <span {...cx(pickerValue(), !!current && pickerValueChosen())}>
          {current ?? (loading ? 'Loading…' : `Choose ${label.toLowerCase()}`)}
        </span>
      </span>
      <LucideChevronDown aria-hidden="true" {...pickerChevron()} />
      <label htmlFor={id} {...visuallyHidden()}>
        {label}
      </label>
      <select
        id={id}
        value={field.value}
        disabled={disabled || field.options.length === 0}
        onChange={(e) => field.onChange(e.target.value)}
        {...pickerSelect()}
      >
        <option value="">{`Choose ${label.toLowerCase()}`}</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
        badge={(option) => <ChainLogo chainId={option?.value} name={option?.label} />}
      />
      <PickerRow
        id={`routes-${key}-asset`}
        label="Asset"
        field={asset}
        disabled={disabled}
        loading={loading}
        badge={(option) => (
          <TokenLogo
            key={option?.value}
            chainId={network.value}
            tokenKey={option?.value}
            symbol={option?.label}
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

const pickerRow = style({
  position: 'relative',
  display: 'flex',
  minHeight: '48px',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
  borderRadius: tokens.radius.md,
  paddingInline: tokens.spacing['2_5'],
  // Tailwind's `transition-colors`.
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (hover: hover)': {
    ':hover': { backgroundColor: inherited.color.surfacePanel },
  },
  '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  selectors: {
    '&:has(select:disabled)': { opacity: 0.6 },
    '&:has(select:disabled):hover': {
      '@media (hover: hover)': { backgroundColor: 'transparent !custom' },
    },
    // The native select is invisible, so its row shows the keyboard focus.
    '&:has(select:focus-visible)': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.accent,
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
})
const pickerSelect = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  cursor: 'pointer',
  opacity: 0,
  ':disabled': { cursor: 'not-allowed' },
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

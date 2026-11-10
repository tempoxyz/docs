'use client'

import { Badge, ChoiceGroup, Field, Select, Surface } from '@tempoxyz/ds'
import type { ReactNode } from 'react'
import type { TestMethod } from '../lib/routes-test'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'
import * as Demo from './guides/Demo'
import { ChainLogo, TokenLogo } from './RouteIcons'
import { popup } from './RoutesControls.styles'

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
type Choice = { value: string; options: Option[]; onChange: (value: string) => void }

/**
 * One route field as a TDS Select: the trigger shows the chosen logo and label, and the list
 * shows each choice with its logo.
 */
function PickerRow({
  id,
  label,
  field,
  disabled,
  loading,
  next,
  badge,
}: {
  id: string
  label: string
  field: Choice
  disabled: boolean
  loading?: boolean
  /** A short cue, such as Start here, that marks this as the field to choose next. */
  next?: string
  badge: (option?: Option, size?: number) => ReactNode
}) {
  const { options } = field
  const items = Object.fromEntries(options.map((option) => [option.value, option.label]))
  const selected = options.find((option) => option.value === field.value)
  return (
    <Field.Root {...pickerField()}>
      <span {...pickerHeading()}>
        <Field.Label>{label}</Field.Label>
        {next && (
          <Badge size="small" variant="soft">
            {next}
          </Badge>
        )}
      </span>
      <Select.Root
        items={items}
        value={field.value || null}
        onValueChange={(value) => {
          if (typeof value === 'string' && value !== field.value) field.onChange(value)
        }}
      >
        <Select.Trigger
          id={id}
          data-value={field.value}
          data-next={next ? '' : undefined}
          disabled={disabled || options.length === 0}
          {...pickerTrigger()}
        >
          {selected && <span {...pickerLogo()}>{badge(selected, 20)}</span>}
          <Select.Value placeholder={loading ? 'Loading…' : `Choose ${label.toLowerCase()}`} />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup aria-label={label} {...popup()}>
          {options.map((option) => (
            <Select.Item key={option.value} label={option.label} value={option.value}>
              <Select.ItemPrefix>{badge(option, 20)}</Select.ItemPrefix>
              <Select.ItemText>{option.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
    </Field.Root>
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
  next,
}: {
  side: 'From' | 'To'
  network: Choice
  asset: Choice
  disabled: boolean
  amount?: string
  address?: string
  loading?: boolean
  /** The field to choose next on this side, and the cue it shows. */
  next?: { field: 'network' | 'asset'; cue: string }
}) {
  const key = side.toLowerCase()
  return (
    <Surface render={<fieldset />} {...endpoint()}>
      <legend {...visuallyHidden()}>{side}</legend>
      <span aria-hidden="true" {...endpointSide()}>
        {side}
      </span>
      <div {...endpointFields()}>
        <PickerRow
          id={`routes-${key}-network`}
          label="Network"
          field={network}
          disabled={disabled}
          loading={loading}
          next={next?.field === 'network' ? next.cue : undefined}
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
          next={next?.field === 'asset' ? next.cue : undefined}
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
      </div>
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
    </Surface>
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
      <span {...methodTrack()}>
        <ChoiceGroup.Root
          aria-label="Funding method"
          size="small"
          value={method ?? null}
          onValueChange={(value) => onMethod(value as TestMethod)}
        >
          {(
            [
              ['transfer', 'Transfer'],
              ['depositAddress', 'Deposit address'],
            ] as const
          ).map(([value, label]) => {
            const available = methods.includes(value)
            return (
              <ChoiceGroup.Item
                key={value}
                value={value}
                disabled={!available || locked}
                title={available ? undefined : 'Not available for this route'}
              >
                {label}
              </ChoiceGroup.Item>
            )
          })}
        </ChoiceGroup.Root>
      </span>
    </div>
  )
}

/** Choose a route on a canvas: two endpoints and the path between them. */
export function RouteCanvas(props: {
  source: { network: Choice; asset: Choice }
  destination: { network: Choice; asset: Choice }
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
  // Mark the first empty field in choice order, so the reader knows where to start.
  const order = [
    ['From', 'network'],
    ['From', 'asset'],
    ['To', 'network'],
    ['To', 'asset'],
  ] as const
  const fields = [
    props.source.network,
    props.source.asset,
    props.destination.network,
    props.destination.asset,
  ]
  const nextIndex = props.disabled
    ? -1
    : fields.findIndex((field) => !field.value && field.options.length > 0)
  const nextOn = (side: 'From' | 'To') => {
    const entry = order[nextIndex]
    return entry && entry[0] === side
      ? { field: entry[1], cue: nextIndex === 0 ? 'Start here' : 'Next' }
      : undefined
  }
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
          next={nextOn('From')}
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
          next={nextOn('To')}
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
  display: 'grid',
  minWidth: 0,
  gap: tokens.spacing['3'],
  margin: tokens.spacing['0'],
})
const endpointFields = style({
  display: 'grid',
  gap: tokens.spacing['4'],
})
const endpointSide = style({
  display: 'block',
  fontWeight: tokens.fontWeight.medium,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray10,
  textTransform: 'uppercase',
  // design-exception: Keep the From/To eyebrow tracking at 0.08em; the label token is wider.
  letterSpacing: '0.08em !custom',
})
const endpointSummary = style({
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

const pickerField = style({
  display: 'grid',
  minWidth: 0,
  gap: tokens.spacing['1_5'],
})
const pickerHeading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
  // Reserve the badge height so From and To line up whether or not a cue shows.
  minHeight: tokens.spacing['7'],
})
const pickerTrigger = style({
  width: '100%',
  selectors: {
    // The field to choose next carries an accent ring until it has a value.
    '&[data-next]': {
      outlineWidth: tokens.borderWidth.hairline,
      outlineStyle: 'solid',
      outlineColor: tokens.color.accent,
      outlineOffset: '-1px',
    },
  },
})
const pickerLogo = style({ display: 'inline-flex', flexShrink: 0 })

// The segmented track sits on the dotted canvas, so it takes the card fill to keep the grid out.
const methodTrack = style({
  display: 'inline-flex',
  borderRadius: tokens.radius.full,
  backgroundColor: inherited.color.surfacePanel,
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

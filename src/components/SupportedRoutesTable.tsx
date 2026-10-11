'use client'

import { useEffect, useState } from 'react'
import { cx } from 'zyzz'
import { loadRoutes, type RouteFilters, RoutesApiError } from '../lib/routes-execution'
import type { TestMethod, TestRoute } from '../lib/routes-test'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'
import { Container } from './Container'
import * as Demo from './guides/Demo'
import { ChainLogo, TokenLogo } from './RouteIcons'
import { label, note, Select } from './RoutesControls'

type Filters = {
  /** Source token key, which also names its network. */
  source: string
  /** Destination token key, which also names its network. */
  destination: string
  method: '' | TestMethod
  fixedRates: '' | 'true' | 'false'
}
type Option = { value: string; label: string }

const noFilters: Filters = { source: '', destination: '', method: '', fixedRates: '' }
const methodLabels: Record<TestMethod, string> = {
  transfer: 'Transfer',
  depositAddress: 'Deposit address',
}
const fields = [
  { key: 'source', name: 'Source', all: 'All sources' },
  { key: 'destination', name: 'Destination', all: 'All destinations' },
  { key: 'method', name: 'Funding', all: 'All funding methods' },
  { key: 'fixedRates', name: 'Fixed rates', all: 'Any' },
] as const

const supports = (route: TestRoute, method: TestMethod) =>
  method === 'transfer'
    ? !!route.capabilities.transfer?.modes.length
    : !!route.capabilities.depositAddress
/** Whether the route takes `subsidize: true`, for one funding method or for either. */
const hasFixedRates = (route: TestRoute, method: Filters['method']) =>
  method
    ? !!route.subsidies?.[method]
    : !!(route.subsidies?.transfer || route.subsidies?.depositAddress)
/** Applies the filters the way `GET /v1/routes` does, so the selectors only offer choices with routes. */
const matches = (route: TestRoute, filters: Filters) =>
  (!filters.source || route.sourceToken.tokenKey === filters.source) &&
  (!filters.destination || route.destinationToken.tokenKey === filters.destination) &&
  (!filters.method || supports(route, filters.method)) &&
  (!filters.fixedRates || hasFixedRates(route, filters.method) === (filters.fixedRates === 'true'))
const isFiltered = (filters: Filters) => Object.values(filters).some(Boolean)
const fundingMethods = (route: TestRoute) =>
  (Object.keys(methodLabels) as TestMethod[])
    .filter((method) => supports(route, method))
    .map((method) => methodLabels[method])
    .join(' · ')

function assets(routes: TestRoute[], side: 'source' | 'destination'): Option[] {
  const labels = new Map<string, string>()
  for (const route of routes)
    labels.set(
      route[`${side}Token`].tokenKey,
      `${route[`${side}Token`].symbol} · ${route[`${side}Chain`].name}`,
    )
  return [...labels]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** The `GET /v1/routes` filters for a selection. The API takes each token with its network. */
function directoryFilters(filters: Filters, routes: TestRoute[]): RouteFilters {
  const source = routes.find((route) => route.sourceToken.tokenKey === filters.source)
  const destination = routes.find(
    (route) => route.destinationToken.tokenKey === filters.destination,
  )
  return {
    sourceChain: source?.sourceChain.id,
    sourceToken: source?.sourceToken.tokenKey,
    destinationChain: destination?.destinationChain.id,
    destinationToken: destination?.destinationToken.tokenKey,
    method: filters.method,
    subsidies: filters.fixedRates,
  }
}

/** The live route directory as a filterable table, matching the console's available routes. */
export function SupportedRoutesTable() {
  const [directory, setDirectory] = useState<TestRoute[]>()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState(noFilters)
  // The routes the directory returned, and the filters they were read with.
  const [shown, setShown] = useState<{ filters: Filters; routes: TestRoute[] }>()

  useEffect(() => {
    const controller = new AbortController()
    setError('')
    loadRoutes(AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]))
      .then(setDirectory)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof RoutesApiError ? e.message : 'Could not load routes. Try again.')
      })
    return () => controller.abort()
  }, [attempt])

  // Each selection reads the directory with the API's own filters.
  useEffect(() => {
    if (!directory) return
    if (!isFiltered(filters)) {
      setShown({ filters, routes: directory })
      return
    }
    const controller = new AbortController()
    setError('')
    loadRoutes(
      AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
      '',
      directoryFilters(filters, directory),
    )
      .then((routes) => {
        if (routes.length) return setShown({ filters, routes })
        // The directory changed since it loaded, so start again from every route.
        setFilters(noFilters)
        setAttempt((n) => n + 1)
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof RoutesApiError ? e.message : 'Could not load routes. Try again.')
      })
    return () => controller.abort()
  }, [directory, filters])

  const all = directory ?? []
  const candidates: Record<keyof Filters, Option[]> = {
    source: assets(all, 'source'),
    destination: assets(all, 'destination'),
    method: (Object.keys(methodLabels) as TestMethod[]).map((value) => ({
      value,
      label: methodLabels[value],
    })),
    fixedRates: [
      { value: 'true', label: 'Available' },
      { value: 'false', label: 'Not available' },
    ],
  }
  // Offer only the choices that leave at least one route, given the other selections.
  const choices = (key: keyof Filters) =>
    candidates[key].filter((option) =>
      all.some((route) => matches(route, { ...filters, [key]: option.value })),
    )
  const change = (key: keyof Filters, value: string) => {
    const next = { ...filters, [key]: value } as Filters
    // Clearing the funding method widens what fixed rates refer to, which can leave no route.
    setFilters(
      all.some((route) => matches(route, next))
        ? next
        : all.some((route) => matches(route, { ...next, fixedRates: '' }))
          ? { ...next, fixedRates: '' }
          : noFilters,
    )
  }
  const filtered = isFiltered(filters)
  const loading = !!shown && shown.filters !== filters

  return (
    <div data-testid="supported-routes">
      <Container
        headerLeft={<span {...title()}>Available routes</span>}
        headerRight={
          shown && (
            <span {...headerMeta()}>
              <span {...note()}>
                {isFiltered(shown.filters)
                  ? `${shown.routes.length} of ${all.length} routes`
                  : `${shown.routes.length} routes`}
              </span>
              {filtered && (
                <button type="button" {...textButton()} onClick={() => setFilters(noFilters)}>
                  Reset
                </button>
              )}
            </span>
          )
        }
        footer={
          <span>
            Fixed rates make 1:1 or 1:par execution available for stablecoin payments or asset
            conversion. Access from the{' '}
            <a href="https://console.tempo.xyz" target="_blank" rel="noreferrer" {...quietLink()}>
              Tempo API Console
            </a>
            .{' '}
            <a href="https://tempo.xyz/contact" target="_blank" rel="noreferrer" {...quietLink()}>
              Contact
            </a>{' '}
            for eligibility.
          </span>
        }
      >
        <div {...stack()}>
          <div {...filterRow()}>
            {fields.map(({ key, name, all: everything }) => {
              const id = `supported-routes-${key}`
              return (
                <div key={key} {...cx(label(), field())}>
                  <span {...fieldHead()}>
                    <label htmlFor={id}>{name}</label>
                    {filters[key] && (
                      <button
                        type="button"
                        aria-label={`Clear ${name.toLowerCase()} filter`}
                        {...textButton()}
                        onClick={() => change(key, '')}
                      >
                        Clear
                      </button>
                    )}
                  </span>
                  <Select
                    id={id}
                    value={filters[key]}
                    disabled={!directory}
                    onChange={(e) => change(key, e.target.value)}
                  >
                    <option value="">{everything}</option>
                    {choices(key).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )
            })}
          </div>
          {error ? (
            <div {...errorRow()}>
              <p role="alert" {...errorText()}>
                {error}
              </p>
              <Demo.Button type="button" onClick={() => setAttempt((n) => n + 1)}>
                Retry
              </Demo.Button>
            </div>
          ) : !shown ? (
            <p role="status" {...note()}>
              Loading routes…
            </p>
          ) : shown.routes.length === 0 ? (
            <p {...cx(note(), empty())}>No routes are available yet.</p>
          ) : (
            <div {...cx(scroller(), loading && busy())} aria-busy={loading}>
              <table {...table()}>
                <thead>
                  <tr {...headRow()}>
                    <th {...head()}>Source</th>
                    <th {...head()}>Destination</th>
                    <th {...head()}>Funding</th>
                    <th {...cx(head(), alignEnd())}>Fixed rates</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.routes.map((route) => (
                    <tr key={route.id} {...row()}>
                      <AssetCell
                        chainId={route.sourceChain.id}
                        chain={route.sourceChain.name}
                        tokenKey={route.sourceToken.tokenKey}
                        symbol={route.sourceToken.symbol}
                      />
                      <AssetCell
                        chainId={route.destinationChain.id}
                        chain={route.destinationChain.name}
                        tokenKey={route.destinationToken.tokenKey}
                        symbol={route.destinationToken.symbol}
                      />
                      <td {...cx(cell(), detail())}>{fundingMethods(route)}</td>
                      <td {...cx(cell(), detail(), alignEnd())}>
                        {hasFixedRates(route, shown.filters.method) ? 'Available' : 'Not available'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

function AssetCell({
  chainId,
  chain,
  tokenKey,
  symbol,
}: {
  chainId: string
  chain: string
  tokenKey: string
  symbol: string
}) {
  return (
    <td {...cell()}>
      <span {...asset()}>
        <TokenLogo size={24} chainId={chainId} tokenKey={tokenKey} symbol={symbol} />
        <span {...assetText()}>
          <span {...assetSymbol()}>{symbol}</span>
          <span {...assetChain()}>
            <ChainLogo size={14} chainId={chainId} name={chain} />
            {chain}
          </span>
        </span>
      </span>
    </td>
  )
}

const title = style({ fontWeight: tokens.fontWeight.medium, fontSize: tokens.fontSize.sm })
const headerMeta = style({ display: 'flex', alignItems: 'center', gap: tokens.spacing['3'] })
const stack = style({
  selectors: { '& > :not(:last-child)': { marginBlockEnd: tokens.spacing['4'] } },
})
const filterRow = style({
  display: 'grid',
  gap: tokens.spacing['3'],
  '@media (width >= 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  '@media (width >= 64rem)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
})
const field = style({ minWidth: 0 })
const fieldHead = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
})
// Clear and Reset read as quiet links beside the labels and the route count.
const textButton = style({
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.compact,
  textDecorationLine: 'underline',
  textUnderlineOffset: '2px',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: '150ms',
  '@media (hover: hover)': { ':hover': { color: inherited.color.textColorPrimary } },
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
// A link inside the footer note: grey and underlined, so it reads as part of the sentence.
const quietLink = style({
  color: tokens.color.gray11,
  textDecorationLine: 'underline',
  textUnderlineOffset: '2px',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: '150ms',
  '@media (hover: hover)': { ':hover': { color: inherited.color.textColorPrimary } },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
const errorRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
const errorText = style({
  color: inherited.color.textColorDestructive,
  fontSize: tokens.fontSize.compact,
})
const empty = style({ paddingBlock: tokens.spacing['6'], textAlign: 'center' })
const scroller = style({
  // design-exception: Bleed the table to the Container edges, cancelling its 20px content inset.
  marginInline: '-20px !custom',
  // design-exception: Cap the scroll box at the 36px header plus five 64px rows and their borders.
  maxHeight: 'calc(2.25rem + 5 * 4rem + 5px) !custom',
  overflow: 'auto',
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.line,
  transitionProperty: 'opacity',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
// The previous rows stay in place, dimmed, while the directory answers a new selection.
const busy = style({ opacity: 0.6 })
const table = style({
  width: '100%',
  minWidth: '36rem',
  borderCollapse: 'collapse',
  textAlign: 'left',
})
const headRow = style({ color: tokens.color.gray10, fontSize: tokens.fontSize.xs })
// Sticky header cells; the inset shadow is the divider, since collapsed borders scroll away.
const head = style({
  position: 'sticky',
  insetBlockStart: 0,
  zIndex: tokens.zIndex.raised,
  height: '36px',
  backgroundColor: tokens.color.card,
  paddingInline: tokens.spacing['5'],
  fontWeight: tokens.fontWeight.normal,
  // design-exception: Draw the header divider as an inset shadow so it stays on the sticky cells.
  boxShadow: 'inset 0 -1px 0 var(--line) !custom',
})
const alignEnd = style({ textAlign: 'right' })
const row = style({
  height: '64px',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
  verticalAlign: 'middle',
  ':last-child': { borderBottomWidth: tokens.borderWidth.none },
})
const cell = style({ paddingInline: tokens.spacing['5'] })
const detail = style({
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.compact,
})
const asset = style({ display: 'flex', alignItems: 'center', gap: tokens.spacing['2_5'] })
const assetText = style({ minWidth: 0 })
const assetSymbol = style({
  display: 'block',
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.sm,
})
const assetChain = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1'],
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.xs,
})

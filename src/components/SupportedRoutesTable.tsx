'use client'

import { useEffect, useState } from 'react'
import { cx } from 'zyzz'
import { loadRoutes, RoutesApiError } from '../lib/routes-execution'
import type { TestRoute } from '../lib/routes-test'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'
import { Container } from './Container'
import * as Demo from './guides/Demo'
import { ChainLogo, TokenLogo } from './RouteIcons'
import { label, note, Select } from './RoutesControls'

const assetLabel = (route: TestRoute, side: 'source' | 'destination') =>
  `${route[`${side}Token`].symbol} · ${route[`${side}Chain`].name}`
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))
const fundingMethods = (route: TestRoute) =>
  [
    route.capabilities.transfer?.modes.length && 'Transfer',
    route.capabilities.depositAddress && 'Deposit address',
  ]
    .filter(Boolean)
    .join(' · ')

/** The live route directory as a filterable table, matching the console's available routes. */
export function SupportedRoutesTable() {
  const [routes, setRoutes] = useState<TestRoute[]>()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [network, setNetwork] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    loadRoutes(AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]))
      .then(setRoutes)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof RoutesApiError ? e.message : 'Could not load routes. Try again.')
      })
    return () => controller.abort()
  }, [attempt])

  const all = routes ?? []
  const filtered = all.filter(
    (route) =>
      (!source || assetLabel(route, 'source') === source) &&
      (!destination || assetLabel(route, 'destination') === destination) &&
      (!network || route.sourceChain.name === network || route.destinationChain.name === network),
  )
  const filter = (
    name: string,
    value: string,
    onChange: (value: string) => void,
    options: string[],
  ) => (
    <label {...cx(label(), filterLabel())} htmlFor={`supported-routes-${name.toLowerCase()}`}>
      {name}
      <Select
        id={`supported-routes-${name.toLowerCase()}`}
        value={value}
        disabled={!routes}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All {name.toLowerCase()}s</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </label>
  )

  return (
    <div data-testid="supported-routes">
      <Container
        headerLeft={<span {...title()}>Available routes</span>}
        headerRight={
          routes && (
            <span {...note()}>
              {filtered.length === all.length
                ? `${all.length} routes`
                : `${filtered.length} of ${all.length} routes`}
            </span>
          )
        }
        footer={
          <span>
            Fee coverage means the route supports 1:1 delivery through a Tempo subsidy. Eligibility
            depends on your organization, billing, and transfer details.
          </span>
        }
      >
        <div {...stack()}>
          <div {...filters()}>
            {filter(
              'Source',
              source,
              setSource,
              unique(all.map((route) => assetLabel(route, 'source'))),
            )}
            {filter(
              'Destination',
              destination,
              setDestination,
              unique(all.map((route) => assetLabel(route, 'destination'))),
            )}
            {filter(
              'Network',
              network,
              setNetwork,
              unique(all.flatMap((route) => [route.sourceChain.name, route.destinationChain.name])),
            )}
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
          ) : !routes ? (
            <p role="status" {...note()}>
              Loading routes…
            </p>
          ) : filtered.length === 0 ? (
            <p {...cx(note(), empty())}>
              {all.length === 0 ? 'No routes are available yet.' : 'No routes match these filters.'}
            </p>
          ) : (
            <div {...scroller()}>
              <table {...table()}>
                <thead>
                  <tr {...headRow()}>
                    <th {...head()}>Source</th>
                    <th {...head()}>Destination</th>
                    <th {...head()}>Funding</th>
                    <th {...cx(head(), alignEnd())}>Fee coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((route) => (
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
                        {route.subsidies?.depositAddress || route.subsidies?.transfer
                          ? 'Available'
                          : 'Not available'}
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
const stack = style({
  selectors: { '& > :not(:last-child)': { marginBlockEnd: tokens.spacing['4'] } },
})
const filters = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  '@media (width >= 40rem)': { flexDirection: 'row', flexWrap: 'wrap' },
})
const filterLabel = style({ '@media (width >= 40rem)': { width: '224px' } })
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
})
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

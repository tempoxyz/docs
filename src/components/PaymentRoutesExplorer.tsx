'use client'

import { useMemo, useState } from 'react'
import { cx } from 'zyzz'
import { type PaymentRoute, paymentRoutes, providerReviewedAt } from '../data/paymentRoutes'
import {
  emptyPaymentRouteFilters,
  filterPaymentRoutes,
  type PaymentRouteFilters,
} from '../lib/payment-route-filters'
import { style, vars as tokens } from '../styles/theme'
import { Container } from './Container'
import * as Demo from './guides/Demo'
import { label, note, Select } from './RoutesControls'

const PAGE_SIZE = 100
const filterFields: Array<[keyof PaymentRouteFilters, string]> = [
  ['sourceRail', 'Source rail or chain'],
  ['sourceCurrency', 'Source currency'],
  ['destinationRail', 'Destination rail or chain'],
  ['destinationCurrency', 'Destination currency'],
  ['provider', 'Provider'],
  ['category', 'Route type'],
]

function Details({ route }: { route: PaymentRoute }) {
  return [
    route.region,
    route.minimum && `Minimum: ${route.minimum}`,
    route.limit && `Limit: ${route.limit}`,
    route.settlement && `Settlement: ${route.settlement}`,
    route.note,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Dated provider research, separate from the live Routes API directory. */
export function PaymentRoutesExplorer() {
  const [filters, setFilters] = useState<PaymentRouteFilters>(emptyPaymentRouteFilters)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const filteredRoutes = useMemo(() => filterPaymentRoutes(paymentRoutes, filters), [filters])
  const visibleRoutes = filteredRoutes.slice(0, visibleCount)
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <Container
      headerLeft={<span {...title()}>Provider route directory</span>}
      headerRight={
        <span role="status" {...note()}>
          {filteredRoutes.length.toLocaleString()} provider entries
        </span>
      }
      footer="Provider documentation snapshots. Confirm current availability, account eligibility, token contracts, and terms with the provider."
    >
      <div {...stack()}>
        <p {...note()}>
          These services use providers' own products and onboarding. For Routes API support, use{' '}
          <a href="/docs/routes/networks">Supported routes</a>. Bridge, Due, and Fonbnk entries were
          reviewed October 6, 2026; other entries were reviewed August 22, 2026.
        </p>
        <div {...filterGrid()}>
          {filterFields.map(([key, name]) => (
            <label key={key} {...label()} htmlFor={`provider-routes-${key}`}>
              {name}
              <Select
                id={`provider-routes-${key}`}
                value={filters[key]}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, [key]: event.target.value }))
                  setVisibleCount(PAGE_SIZE)
                }}
              >
                <option value="">All</option>
                {[...new Set(paymentRoutes.map((route) => route[key]))]
                  .sort((a, b) => a.localeCompare(b))
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </Select>
            </label>
          ))}
        </div>
        <Demo.Button
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setFilters(emptyPaymentRouteFilters)
            setVisibleCount(PAGE_SIZE)
          }}
        >
          Reset filters
        </Demo.Button>
        <section {...scroller()} aria-label="Provider routes">
          <table {...table()}>
            <thead>
              <tr>
                {['Source', 'Destination', 'Provider / reviewed', 'Details'].map((name) => (
                  <th key={name} scope="col" {...head()}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRoutes.map((route, index) => (
                <tr
                  key={`${route.provider}-${route.sourceRail}-${route.sourceCurrency}-${route.destinationRail}-${route.destinationCurrency}-${route.region ?? ''}-${index}`}
                  {...row()}
                >
                  <td {...cell()}>
                    <span {...asset()}>{route.sourceCurrency}</span>
                    <span {...note()}>{route.sourceRail}</span>
                  </td>
                  <td {...cell()}>
                    <span {...asset()}>{route.destinationCurrency}</span>
                    <span {...note()}>{route.destinationRail}</span>
                  </td>
                  <td {...cell()}>
                    <a href={route.providerUrl}>{route.provider}</a>
                    <span {...reviewDate()}>Reviewed {providerReviewedAt(route.provider)}</span>
                  </td>
                  <td {...cx(cell(), detail())}>
                    <Details route={route} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRoutes.length === 0 && (
            <p {...empty()}>No provider entries match these filters. Reset to try another pair.</p>
          )}
        </section>
        {visibleCount < filteredRoutes.length && (
          <Demo.Button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Show more
          </Demo.Button>
        )}
      </div>
    </Container>
  )
}

const title = style({ fontWeight: tokens.fontWeight.medium, fontSize: tokens.fontSize.sm })
const stack = style({ display: 'flex', flexDirection: 'column', gap: tokens.spacing['4'] })
const filterGrid = style({
  display: 'grid',
  gap: tokens.spacing['3'],
  '@media (width >= 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
})
const scroller = style({
  overflow: 'auto',
  maxHeight: '32rem',
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.line,
})
const table = style({
  width: '100%',
  minWidth: '48rem',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: tokens.fontSize.compact,
})
const head = style({
  position: 'sticky',
  insetBlockStart: 0,
  backgroundColor: tokens.color.card,
  padding: tokens.spacing['3'],
  fontWeight: tokens.fontWeight.medium,
})
const row = style({
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.line,
  verticalAlign: 'top',
})
const cell = style({ padding: tokens.spacing['3'] })
const asset = style({ display: 'block', fontWeight: tokens.fontWeight.medium })
const reviewDate = style({ display: 'block', color: tokens.color.gray10 })
const detail = style({ minWidth: '20rem', color: tokens.color.gray10 })
const empty = style({ padding: tokens.spacing['6'], color: tokens.color.gray10 })

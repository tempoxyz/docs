'use client'

import { useEffect, useMemo, useState } from 'react'
import { type PaymentRoute, paymentRoutes } from '../data/paymentRoutes'

export type PaymentRouteFilters = {
  sourceRail: string
  sourceCurrency: string
  destinationRail: string
  destinationCurrency: string
  provider: string
  category: string
}

const EMPTY_FILTERS: PaymentRouteFilters = {
  sourceRail: '',
  sourceCurrency: '',
  destinationRail: '',
  destinationCurrency: '',
  provider: '',
  category: '',
}

const PAGE_SIZE = 100

export function filterPaymentRoutes(
  routes: PaymentRoute[],
  filters: PaymentRouteFilters,
): PaymentRoute[] {
  return routes.filter(
    (route) =>
      (!filters.sourceRail || route.sourceRail === filters.sourceRail) &&
      (!filters.sourceCurrency || route.sourceCurrency === filters.sourceCurrency) &&
      (!filters.destinationRail || route.destinationRail === filters.destinationRail) &&
      (!filters.destinationCurrency || route.destinationCurrency === filters.destinationCurrency) &&
      (!filters.provider || route.provider === filters.provider) &&
      (!filters.category || route.category === filters.category),
  )
}

function uniqueValues(key: keyof PaymentRoute): string[] {
  return Array.from(
    new Set(
      paymentRoutes
        .map((route) => route[key])
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b))
}

const filterOptions = {
  sourceRail: uniqueValues('sourceRail'),
  sourceCurrency: uniqueValues('sourceCurrency'),
  destinationRail: uniqueValues('destinationRail'),
  destinationCurrency: uniqueValues('destinationCurrency'),
  provider: uniqueValues('provider'),
  category: uniqueValues('category'),
}

function Details({ route }: { route: PaymentRoute }) {
  const details = [
    route.region,
    route.minimum && `Minimum: ${route.minimum}`,
    route.limit && `Limit: ${route.limit}`,
    route.settlement && `Settlement: ${route.settlement}`,
    route.note,
  ].filter(Boolean)

  return details.length > 0 ? details.join(' · ') : 'Confirm with provider'
}

export function PaymentRoutesExplorer() {
  const [filters, setFilters] = useState<PaymentRouteFilters>(EMPTY_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const filteredRoutes = useMemo(() => filterPaymentRoutes(paymentRoutes, filters), [filters])
  const visibleRoutes = filteredRoutes.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filters])

  function updateFilter(key: keyof PaymentRouteFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="my-8 space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ['sourceRail', 'Source rail or chain'],
            ['sourceCurrency', 'Source currency'],
            ['destinationRail', 'Destination rail or chain'],
            ['destinationCurrency', 'Destination currency'],
            ['provider', 'Provider'],
            ['category', 'Route type'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-gray11">{label}</span>
            <select
              value={filters[key]}
              onChange={(event) => updateFilter(key, event.target.value)}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            >
              <option value="">All</option>
              {filterOptions[key].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-gray11 text-sm">
          {filteredRoutes.length.toLocaleString()} route
          {filteredRoutes.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          disabled={!hasFilters}
          className="rounded-md border border-gray6 px-3 py-1.5 text-gray11 text-sm hover:bg-gray3 hover:text-gray12 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset filters
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray6">
        <table className="min-w-[1100px] text-left text-sm">
          <thead className="bg-gray2 text-gray11">
            <tr>
              <th className="px-3 py-2 font-medium">Source rail / chain</th>
              <th className="px-3 py-2 font-medium">Source currency</th>
              <th className="px-3 py-2 font-medium">Destination rail / chain</th>
              <th className="px-3 py-2 font-medium">Destination currency</th>
              <th className="px-3 py-2 font-medium">Provider</th>
              <th className="px-3 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {visibleRoutes.map((route, index) => (
              <tr
                key={`${route.provider}-${route.sourceRail}-${route.sourceCurrency}-${route.destinationRail}-${route.destinationCurrency}-${route.region ?? ''}-${index}`}
                className="border-gray5 border-t align-top"
              >
                <td className="px-3 py-2 text-gray12">{route.sourceRail}</td>
                <td className="px-3 py-2 font-mono text-gray12">{route.sourceCurrency}</td>
                <td className="px-3 py-2 text-gray12">{route.destinationRail}</td>
                <td className="px-3 py-2 font-mono text-gray12">{route.destinationCurrency}</td>
                <td className="px-3 py-2">
                  <a href={route.providerUrl}>{route.provider}</a>
                </td>
                <td className="max-w-[360px] px-3 py-2 text-gray11">
                  <Details route={route} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoutes.length === 0 && (
          <p className="m-0 px-3 py-8 text-center text-gray11 text-sm">
            No routes match these filters.
          </p>
        )}
      </div>

      {visibleCount < filteredRoutes.length && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-md border border-gray6 px-4 py-2 text-gray11 text-sm hover:bg-gray3 hover:text-gray12"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { type PaymentRoute, paymentRoutes, providerReviewedAt } from '../data/paymentRoutes'
import {
  type RoutesApiRoute,
  routesApiReviewedLabel,
  routesApiRoutes,
  routesApiSource,
} from '../data/routesApiCatalog'

type ExplorerRoute = PaymentRoute | RoutesApiRoute
type Catalog = 'api' | 'providers'

export type PaymentRouteFilters = {
  sourceRail: string
  sourceCurrency: string
  destinationRail: string
  destinationCurrency: string
  provider: string
  category: string
  method: string
}

const EMPTY_FILTERS: PaymentRouteFilters = {
  sourceRail: '',
  sourceCurrency: '',
  destinationRail: '',
  destinationCurrency: '',
  provider: '',
  category: '',
  method: '',
}

const PAGE_SIZE = 100

export function filterPaymentRoutes(
  routes: ExplorerRoute[],
  filters: PaymentRouteFilters,
): ExplorerRoute[] {
  return routes.filter(
    (route) =>
      (!filters.sourceRail || route.sourceRail === filters.sourceRail) &&
      (!filters.sourceCurrency || route.sourceCurrency === filters.sourceCurrency) &&
      (!filters.destinationRail || route.destinationRail === filters.destinationRail) &&
      (!filters.destinationCurrency || route.destinationCurrency === filters.destinationCurrency) &&
      (!filters.provider || ('provider' in route && route.provider === filters.provider)) &&
      (!filters.category || ('category' in route && route.category === filters.category)) &&
      (!filters.method || ('methods' in route && route.methods.includes(filters.method))),
  )
}

function uniqueValues(routes: ExplorerRoute[], key: keyof PaymentRouteFilters): string[] {
  return Array.from(
    new Set(
      routes
        .flatMap((route) => {
          if (key === 'method') return 'methods' in route ? route.methods : []
          return key in route ? route[key as keyof typeof route] : []
        })
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b))
}

function Details({ route }: { route: PaymentRoute }) {
  const details = [
    route.region,
    route.minimum && `Minimum: ${route.minimum}`,
    route.limit && `Limit: ${route.limit}`,
    route.settlement && `Settlement: ${route.settlement}`,
    route.note,
    `Reviewed ${providerReviewedAt(route.provider)}`,
  ].filter(Boolean)

  return details.length > 0 ? details.join(' · ') : 'Confirm with provider'
}

export function PaymentRoutesExplorer() {
  const [catalog, setCatalog] = useState<Catalog>('api')
  const [includeTestnet, setIncludeTestnet] = useState(false)
  const [filters, setFilters] = useState<PaymentRouteFilters>(EMPTY_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const routes = useMemo(
    () =>
      catalog === 'providers'
        ? paymentRoutes
        : routesApiRoutes.filter((route) => includeTestnet || !route.testnet),
    [catalog, includeTestnet],
  )
  const filteredRoutes = useMemo(() => filterPaymentRoutes(routes, filters), [routes, filters])
  const visibleRoutes = filteredRoutes.slice(0, visibleCount)
  const filterFields: Array<[keyof PaymentRouteFilters, string]> = [
    ['sourceRail', catalog === 'api' ? 'Source chain' : 'Source rail or chain'],
    ['sourceCurrency', catalog === 'api' ? 'Source asset' : 'Source currency'],
    ['destinationRail', catalog === 'api' ? 'Destination chain' : 'Destination rail or chain'],
    ['destinationCurrency', catalog === 'api' ? 'Destination asset' : 'Destination currency'],
    ...(catalog === 'api'
      ? ([['method', 'Method']] as Array<[keyof PaymentRouteFilters, string]>)
      : ([
          ['provider', 'Provider'],
          ['category', 'Route type'],
        ] as Array<[keyof PaymentRouteFilters, string]>)),
  ]

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filters, catalog, includeTestnet])

  function updateFilter(key: keyof PaymentRouteFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="my-8 space-y-4">
      <label className="block max-w-sm space-y-1 text-sm">
        <span className="text-gray11">Catalog</span>
        <select
          value={catalog}
          onChange={(event) => {
            setCatalog(event.target.value as Catalog)
            setFilters(EMPTY_FILTERS)
          }}
          className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
        >
          <option value="api">Routes API</option>
          <option value="providers">Provider coverage</option>
        </select>
      </label>

      {catalog === 'api' ? (
        <div className="space-y-3 text-gray11 text-sm">
          <p className="m-0">
            Public Routes API catalog, checked {routesApiReviewedLabel} UTC.{' '}
            <a href={routesApiSource}>Check the current catalog</a> before requesting a quote.
            Availability and amounts depend on the quote. Provider attribution is not included in
            the public API catalog.
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeTestnet}
              onChange={(event) => {
                setIncludeTestnet(event.target.checked)
                setFilters(EMPTY_FILTERS)
              }}
            />
            Include testnet routes
          </label>
        </div>
      ) : (
        <p className="m-0 text-gray11 text-sm">
          These providers offer their own products and onboarding. These entries do not establish
          Routes API availability. Bridge, Due, and Fonbnk were reviewed on October 6, 2026. Other
          providers were last reviewed on August 22, 2026. Confirm current support with the
          provider.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filterFields.map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-gray11">{label}</span>
            <select
              value={filters[key]}
              onChange={(event) => updateFilter(key, event.target.value)}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            >
              <option value="">All</option>
              {uniqueValues(routes, key).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-gray11 text-sm" role="status">
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
        <table
          className={`${catalog === 'api' ? 'w-full min-w-[560px]' : 'min-w-[1100px]'} text-left text-sm`}
        >
          <thead className="bg-gray2 text-gray11">
            <tr>
              <th className="px-3 py-2 font-medium">
                {catalog === 'api' ? 'Source chain' : 'Source rail / chain'}
              </th>
              <th className="px-3 py-2 font-medium">
                {catalog === 'api' ? 'Source asset' : 'Source currency'}
              </th>
              <th className="px-3 py-2 font-medium">
                {catalog === 'api' ? 'Destination chain' : 'Destination rail / chain'}
              </th>
              <th className="px-3 py-2 font-medium">
                {catalog === 'api' ? 'Destination asset' : 'Destination currency'}
              </th>
              {catalog === 'providers' && <th className="px-3 py-2 font-medium">Provider</th>}
              <th className="px-3 py-2 font-medium">{catalog === 'api' ? 'Methods' : 'Details'}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRoutes.map((route, index) => (
              <tr
                key={
                  'id' in route
                    ? route.id
                    : `${route.provider}-${route.sourceRail}-${route.sourceCurrency}-${route.destinationRail}-${route.destinationCurrency}-${route.region ?? ''}-${index}`
                }
                className="border-gray5 border-t align-top"
              >
                <td className="px-3 py-2 text-gray12">{route.sourceRail}</td>
                <td className="px-3 py-2 font-mono text-gray12">{route.sourceCurrency}</td>
                <td className="px-3 py-2 text-gray12">{route.destinationRail}</td>
                <td className="px-3 py-2 font-mono text-gray12">{route.destinationCurrency}</td>
                {'provider' in route && (
                  <td className="px-3 py-2">
                    <a href={route.providerUrl}>{route.provider}</a>
                  </td>
                )}
                <td className="max-w-[360px] px-3 py-2 text-gray11">
                  {'methods' in route ? route.methods.join(', ') : <Details route={route} />}
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

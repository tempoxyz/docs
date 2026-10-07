import { describe, expect, it } from 'vitest'
import { paymentRoutes } from '../data/paymentRoutes'
import { mainnetRoutesApiRoutes, routesApiRoutes } from '../data/routesApiCatalog'
import { filterPaymentRoutes, type PaymentRouteFilters } from './PaymentRoutesExplorer'

const emptyFilters: PaymentRouteFilters = {
  sourceRail: '',
  sourceCurrency: '',
  destinationRail: '',
  destinationCurrency: '',
  provider: '',
  category: '',
  method: '',
}

describe('payment route explorer', () => {
  it('only contains routes into or out of Tempo', () => {
    expect(paymentRoutes.length).toBeGreaterThan(400)
    expect(
      paymentRoutes.every(
        (route) => route.sourceRail === 'Tempo' || route.destinationRail === 'Tempo',
      ),
    ).toBe(true)
  })

  it('filters by the requested route properties', () => {
    const routes = filterPaymentRoutes(paymentRoutes, {
      ...emptyFilters,
      sourceRail: 'ACH',
      sourceCurrency: 'USD',
      destinationRail: 'Tempo',
      provider: 'Bridge',
    })

    expect(routes.length).toBeGreaterThan(0)
    expect(
      routes.every(
        (route) =>
          route.sourceRail === 'ACH' &&
          route.sourceCurrency === 'USD' &&
          route.destinationRail === 'Tempo' &&
          'provider' in route &&
          route.provider === 'Bridge',
      ),
    ).toBe(true)
  })

  it('includes only providers with route-level public sources', () => {
    const providers = new Set(paymentRoutes.map((route) => route.provider))

    expect(providers).toEqual(
      new Set([
        'Bridge',
        'Bungee',
        'Due',
        'Fonbnk',
        'Kraken',
        'LayerZero / Stargate',
        'MoonPay',
        'OKX',
        'Relay',
      ]),
    )
  })

  it('keeps testnet and provider coverage out of the default API catalog', () => {
    const mainnet = mainnetRoutesApiRoutes()
    expect(mainnet).toHaveLength(22)
    expect(routesApiRoutes.filter((route) => route.testnet)).toHaveLength(2)
    expect(mainnet.every((route) => !route.testnet && !('provider' in route))).toBe(true)
    expect(new Set(routesApiRoutes.map((route) => route.id)).size).toBe(routesApiRoutes.length)
  })

  it('filters an API pair by assets and supported method', () => {
    const pair = filterPaymentRoutes(routesApiRoutes, {
      ...emptyFilters,
      sourceRail: 'Base',
      sourceCurrency: 'USDC',
      destinationRail: 'Tempo',
      destinationCurrency: 'USDC.e',
      method: 'Transfer',
    })
    expect(pair).toHaveLength(1)
    expect('methods' in pair[0] && pair[0].methods).toEqual(['Deposit address', 'Transfer'])

    expect(
      filterPaymentRoutes(routesApiRoutes, {
        ...emptyFilters,
        sourceRail: 'Polygon',
        method: 'Transfer',
      }),
    ).toEqual([])
  })

  it('excludes withdrawn provider coverage from the October refresh', () => {
    const due = paymentRoutes.filter((route) => route.provider === 'Due')
    expect(
      due.some((route) => [route.sourceCurrency, route.destinationCurrency].includes('BRL')),
    ).toBe(false)
    expect(due.some((route) => ['SGD', 'UYU'].includes(route.destinationCurrency))).toBe(false)
    const fonbnk = paymentRoutes.filter((route) => route.provider === 'Fonbnk')
    expect(fonbnk.some((route) => route.sourceCurrency === 'RWF')).toBe(false)
    expect(fonbnk.some((route) => route.limit)).toBe(false)
  })
})

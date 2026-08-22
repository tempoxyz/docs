import { describe, expect, it } from 'vitest'
import { paymentRoutes } from '../data/paymentRoutes'
import { filterPaymentRoutes, type PaymentRouteFilters } from './PaymentRoutesExplorer'

const emptyFilters: PaymentRouteFilters = {
  sourceRail: '',
  sourceCurrency: '',
  destinationRail: '',
  destinationCurrency: '',
  provider: '',
  category: '',
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
})

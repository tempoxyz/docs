import type { PaymentRoute } from '../data/paymentRoutes'

export type PaymentRouteFilters = Pick<
  PaymentRoute,
  'sourceRail' | 'sourceCurrency' | 'destinationRail' | 'destinationCurrency' | 'provider'
> & { category: PaymentRoute['category'] | '' }

export const emptyPaymentRouteFilters: PaymentRouteFilters = {
  sourceRail: '',
  sourceCurrency: '',
  destinationRail: '',
  destinationCurrency: '',
  provider: '',
  category: '',
}

export function filterPaymentRoutes(
  routes: PaymentRoute[],
  filters: PaymentRouteFilters,
): PaymentRoute[] {
  return routes.filter((route) =>
    (Object.keys(filters) as Array<keyof PaymentRouteFilters>).every(
      (key) => !filters[key] || route[key] === filters[key],
    ),
  )
}

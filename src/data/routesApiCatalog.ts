import snapshot from './routesApiSnapshot.json' with { type: 'json' }

export type RoutesApiRoute = (typeof snapshot.routes)[number]

// A public catalog snapshot keeps coverage readable without JavaScript or an API key.
// Refresh every page of /v1/routes and preserve the retrieval time when updating it.
export const routesApiRoutes: RoutesApiRoute[] = snapshot.routes
export const routesApiSource = snapshot.source
export const routesApiRetrievedAt = snapshot.retrievedAt
export const routesApiReviewedLabel = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
}).format(new Date(routesApiRetrievedAt))

export function mainnetRoutesApiRoutes(): RoutesApiRoute[] {
  return routesApiRoutes.filter((route) => !route.testnet)
}

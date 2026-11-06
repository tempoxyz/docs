export function resolveBaseUrl(): string {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return ''
  if (URL.canParse(process.env.VITE_BASE_URL ?? '')) {
    return (process.env.VITE_BASE_URL as string).replace(/\/$/, '')
  }
  if (process.env.VERCEL_ENV === 'production') return 'https://tempo.xyz/developers'
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl) return `https://${productionUrl}`
  return ''
}

/** Public origin of the docs pages: tempo.xyz/docs in production, the deployment elsewhere. */
export function resolveDocsSiteUrl(): string {
  const baseUrl = resolveBaseUrl()
  return baseUrl.replace(/\/developers$/, '')
}

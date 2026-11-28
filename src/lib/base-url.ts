import { deployEnvironment } from './deploy-environment'

export function resolveBaseUrl(): string {
  const environment = deployEnvironment()
  if (environment && environment !== 'production') return ''
  if (URL.canParse(process.env.VITE_BASE_URL ?? '')) {
    return (process.env.VITE_BASE_URL as string).replace(/\/$/, '')
  }
  if (environment === 'production') return 'https://tempo.com/developers'
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl) return `https://${productionUrl}`
  return ''
}

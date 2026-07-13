export const DEVELOPERS_BASE_PATH = '/developers'

function normalizedPath(path: string): string {
  if (path === '/') return '/'
  return path.startsWith('/') ? path : `/${path}`
}

export function developersPath(path: string): string {
  const normalized = normalizedPath(path)

  if (import.meta.env.VERCEL_ENV !== 'production') return normalized
  if (normalized === '/') return DEVELOPERS_BASE_PATH
  return `${DEVELOPERS_BASE_PATH}${normalized}`
}

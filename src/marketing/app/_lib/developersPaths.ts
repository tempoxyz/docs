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

/**
 * A same-origin path to this site's own API routes. Production serves the site both on
 * developers.tempo.xyz and under tempo.xyz/developers, so the browser uses the mount the current
 * page came from; server rendering falls back to the deployment's mount.
 */
export function developersApiPath(path: string): string {
  const normalized = normalizedPath(path)
  const mounted =
    typeof location === 'undefined'
      ? import.meta.env.VERCEL_ENV === 'production'
      : location.pathname === DEVELOPERS_BASE_PATH ||
        location.pathname.startsWith(`${DEVELOPERS_BASE_PATH}/`)
  return mounted ? `${DEVELOPERS_BASE_PATH}${normalized}` : normalized
}

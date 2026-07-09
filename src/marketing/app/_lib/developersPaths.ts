export const DEVELOPERS_BASE_PATH = '/developers'

export function developersPath(path: string): string {
  if (import.meta.env.DEV && (path === '/blog' || path.startsWith('/blog/'))) return path
  if (path === '/') return DEVELOPERS_BASE_PATH
  return `${DEVELOPERS_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}

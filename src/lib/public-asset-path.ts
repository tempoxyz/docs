/** Resolve a public asset within the same mount that Waku uses for page routes. */
export function publicAssetPath(
  assetPath: string,
  basePath: string = import.meta.env.WAKU_CONFIG_BASE_PATH ?? '/',
): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(assetPath)) return assetPath

  const path = `/${assetPath.replace(/^\/+/, '')}`
  const base = `/${basePath.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '')
  if (!base || path === base || path.startsWith(`${base}/`)) return path
  return `${base}${path}`
}

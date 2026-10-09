// Routing helpers remain independent of compiled UI styling.
const DEVELOPERS_BASE_PATH = '/developers'

export function normalizeDocsPath(pathname: string) {
  const path = pathname || '/'
  if (path === DEVELOPERS_BASE_PATH) return '/'
  if (path.startsWith(`${DEVELOPERS_BASE_PATH}/`)) {
    return path.slice(DEVELOPERS_BASE_PATH.length) || '/'
  }
  return path
}

export type SidebarNode = {
  text?: string
  link?: string
  collapsed?: boolean
  items?: SidebarNode[]
}

// The docs sidebar is configured in vocs.config.ts (keyed by path). Resolve the
// entry that best matches the current path so the mobile menu mirrors the
// desktop sidebar.
export function resolveSidebarItems(sidebar: unknown, pathname: string): SidebarNode[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar as SidebarNode[]
  if (typeof sidebar !== 'object') return []

  const path = normalizeDocsPath(pathname)
  const entries = sidebar as Record<string, SidebarNode[] | { items?: SidebarNode[] }>
  let bestKey: string | null = null
  for (const key of Object.keys(entries)) {
    if (path === key || path.startsWith(key === '/' ? '/' : `${key}/`)) {
      if (bestKey === null || key.length > bestKey.length) bestKey = key
    }
  }
  const entry = entries[bestKey ?? '/get-started'] ?? entries['/docs'] ?? Object.values(entries)[0]
  if (!entry) return []
  return Array.isArray(entry) ? entry : (entry.items ?? [])
}

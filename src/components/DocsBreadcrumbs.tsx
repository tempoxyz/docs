'use client'

import { MdxPageContext, useConfig } from 'vocs'
import { Link } from 'waku'
import ChevronRightIcon from '~icons/lucide/chevron-right'
import { getActiveDocsArea, getActiveDocsSection } from '../lib/docs-sections'
import { resolveSidebarItems, type SidebarNode } from '../lib/docs-sidebar'
import * as ui from './DocsBreadcrumbs.recipes'
import { usePathname } from './DocsHeader'

type Crumb = { label: string; href?: string }

function withoutTrailingSlash(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

/** The sidebar nodes from the top level down to the entry for this page. */
function sidebarTrail(nodes: SidebarNode[], pathname: string): SidebarNode[] | undefined {
  for (const node of nodes) {
    const link = node.link?.split('#')[0]
    if (link?.startsWith('/') && withoutTrailingSlash(link) === pathname) return [node]
    if (node.items?.length) {
      const trail = sidebarTrail(node.items, pathname)
      if (trail) return [node, ...trail]
    }
  }
}

const sameLabel = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Area › Section › Group(s) › Page, above the page title on every docs page except Home. */
export default function DocsBreadcrumbs() {
  const pathname = withoutTrailingSlash(usePathname())
  const config = useConfig()
  const { frontmatter } = MdxPageContext.use()
  if (pathname === '/') return null

  const area = getActiveDocsArea(pathname)
  const section = getActiveDocsSection(pathname)
  const trail = sidebarTrail(resolveSidebarItems(config?.sidebar, pathname), pathname) ?? []
  const page = trail.at(-1)?.text ?? (frontmatter?.title as string | undefined)

  const candidates: Crumb[] = [
    ...(area ? [{ label: area.label, href: area.href }] : []),
    ...(section ? [{ label: section.label, href: section.href }] : []),
    ...trail
      .slice(0, -1)
      .flatMap((node) => (node.text ? [{ label: node.text, href: node.link }] : [])),
  ]
  const crumbs: Crumb[] = []
  for (const crumb of candidates) {
    const previous = crumbs.at(-1)
    if (!previous || !sameLabel(previous.label, crumb.label)) crumbs.push(crumb)
  }
  // The page itself replaces an ancestor with the same name, so it stays the current crumb.
  if (page) {
    if (crumbs.at(-1) && sameLabel(crumbs.at(-1)?.label ?? '', page)) crumbs.pop()
    crumbs.push({ label: page })
  }
  if (crumbs.length < 2) return null

  return (
    <nav aria-label="Breadcrumb" className={`docs-breadcrumbs ${ui.nav().className}`}>
      <ol {...ui.list()}>
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1
          return (
            <li key={`${crumb.label}-${index}`} {...(current ? ui.currentItem() : ui.item())}>
              {index > 0 && (
                <ChevronRightIcon aria-hidden="true" width="12" height="12" {...ui.separator()} />
              )}
              {current ? (
                <span aria-current="page" {...ui.currentLabel()}>
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <Link to={crumb.href} {...ui.link()}>
                  {crumb.label}
                </Link>
              ) : (
                <span {...ui.label()}>{crumb.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

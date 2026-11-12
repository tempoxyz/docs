'use client'

import { useEffect, useRef } from 'react'
import { Link, useRouter } from 'waku'
import BookOpenIcon from '~icons/lucide/book-open'
import BracesIcon from '~icons/lucide/braces'
import CompassIcon from '~icons/lucide/compass'
import HandshakeIcon from '~icons/lucide/handshake'
import TerminalIcon from '~icons/lucide/terminal'
import {
  type DocsArea,
  type DocsSection,
  docsAreas,
  docsSections,
  docsUtilitySections,
  getActiveDocsArea,
  getActiveDocsSection,
  getDocsSectionById,
} from '../lib/docs-sections'
import { docsSectionNav as sectionSurface } from '../styles/surfaces.styles'
import { docsProductIcons } from './DocsHomeProductIcon'
import {
  docsAreaLink,
  docsAreaNav,
  docsSectionIcon,
  docsSectionNav,
  docsSectionNavScroll,
} from './DocsNavigation.styles'

export { docsSections, docsUtilitySections, getActiveDocsSection }

export const sectionIcons: Partial<Record<DocsSection['id'], typeof CompassIcon>> = {
  overview: CompassIcon,
  accounts: docsProductIcons.accounts,
  earn: docsProductIcons.earn,
  routes: docsProductIcons.routes,
  zones: docsProductIcons.zones,
  'machine-payments': docsProductIcons.agents,
  developers: docsProductIcons.network,
  api: BracesIcon,
  tools: TerminalIcon,
  resources: BookOpenIcon,
  ecosystem: HandshakeIcon,
}

export function areaSections(area: DocsArea) {
  return area.sections
    .map((id) => getDocsSectionById(id))
    .filter((section): section is DocsSection => Boolean(section))
}

/** The four tabs in the top bar: plain links, the current one on the chip. */
export function DocsAreaNav({ pathname }: { pathname: string }) {
  const activeArea = getActiveDocsArea(pathname)

  return (
    <nav aria-label="Documentation areas" className={`docs-area-nav ${docsAreaNav().className}`}>
      <ul>
        {docsAreas.map((area) => (
          <li key={area.id}>
            <Link
              to={area.href}
              className={`docs-area-link ${docsAreaLink().className}`}
              aria-current={activeArea?.id === area.id ? 'page' : undefined}
              unstable_prefetchOnEnter={{}}
              unstable_prefetchOnView={{}}
            >
              {area.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * The section tabs under the top bar (Desktop and up): the sections of the current tab, so
 * readers move between siblings (Accounts → Earn, API → SDKs & CLI). Home and Not found have none.
 */
export default function DocsSectionNav() {
  const { path } = useRouter()
  const navRef = useRef<HTMLElement | null>(null)
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)
  const activeSection = getActiveDocsSection(path ?? '/')
  const activeArea = getActiveDocsArea(path ?? '/')
  const sections = activeArea ? areaSections(activeArea) : []

  useEffect(() => {
    const nav = navRef.current
    const activeLink = activeLinkRef.current
    if (!nav || !activeLink) return
    const centeredLeft = activeLink.offsetLeft - nav.clientWidth / 2 + activeLink.offsetWidth / 2
    nav.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'instant' })
  }, [activeSection?.id])

  // Home and Not found keep an empty, hidden row so the shell's `:has(.docs-section-nav)` hooks still apply.
  if (!sections.length) return <div className="docs-section-nav" data-empty="" hidden />

  return (
    <div className={`docs-section-nav ${docsSectionNav().className} ${sectionSurface().className}`}>
      <nav
        ref={navRef}
        aria-label={`${activeArea?.label} sections`}
        className={`docs-section-nav-scroll ${docsSectionNavScroll().className}`}
      >
        <ul>
          {sections.map((section) => {
            const Icon = sectionIcons[section.id]
            const current = activeSection?.id === section.id
            return (
              <li key={section.id}>
                <Link
                  ref={(element) => {
                    if (current) activeLinkRef.current = element
                  }}
                  to={section.href}
                  unstable_prefetchOnEnter={{}}
                  unstable_prefetchOnView={{}}
                  aria-current={current ? 'page' : undefined}
                >
                  {Icon && (
                    <Icon
                      className={`docs-section-icon ${docsSectionIcon().className}`}
                      aria-hidden="true"
                      focusable="false"
                      width="16"
                      height="16"
                      strokeWidth="1.75"
                    />
                  )}
                  {section.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

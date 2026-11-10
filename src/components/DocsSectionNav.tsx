'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Link, useRouter } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import BookOpenIcon from '~icons/lucide/book-open'
import BracesIcon from '~icons/lucide/braces'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import CompassIcon from '~icons/lucide/compass'
import HandshakeIcon from '~icons/lucide/handshake'
import ServerIcon from '~icons/lucide/server'
import TerminalIcon from '~icons/lucide/terminal'
import {
  type DocsArea,
  type DocsSection,
  docsAreas,
  docsSections,
  docsUtilitySections,
  getActiveDocsSection,
  getDocsAreaForSection,
  getDocsSectionById,
} from '../lib/docs-sections'
import { docsSectionNav as sectionSurface } from '../styles/surfaces.styles'
import { docsProductIcons } from './DocsHomeProductIcon'
import {
  docsAreaLink,
  docsAreaMenuItem,
  docsAreaMenuItemDescription,
  docsAreaMenuItemLabel,
  docsAreaMenuPanel,
  docsAreaNav,
  docsReferenceMenu,
  docsResourceLinkLabel,
  docsResourceLinks,
  docsResourceLinkText,
  docsResourceLogo,
  docsSectionIcon,
  docsSectionNav,
  docsSectionNavDescription,
  docsSectionNavScroll,
} from './DocsNavigation.styles'
import { MercatorLogo, MppLogo, TempoMark } from './ToolLogos'

export { docsSections, docsUtilitySections, getActiveDocsSection }

export const sectionIcons: Partial<Record<DocsSection['id'], typeof CompassIcon>> = {
  overview: CompassIcon,
  accounts: docsProductIcons.accounts,
  earn: docsProductIcons.earn,
  routes: docsProductIcons.routes,
  zones: docsProductIcons.zones,
  'machine-payments': docsProductIcons.agents,
  developers: docsProductIcons.network,
  operate: ServerIcon,
  api: BracesIcon,
  tools: TerminalIcon,
  resources: BookOpenIcon,
  ecosystem: HandshakeIcon,
}

/** One line per section in the area menus. */
export const sectionDescriptions: Partial<Record<DocsSection['id'], string>> = {
  accounts: 'Stablecoin accounts with security rules built in',
  earn: 'Earning balances for stablecoins',
  routes: 'Deposits and transfers across networks',
  zones: 'Private zones on Tempo',
  'machine-payments': 'Charge for APIs and pay for services',
  api: 'Endpoints, authentication and conventions',
  tools: 'TypeScript, Rust, Go, Python, Foundry and the CLI',
  resources: 'Plan payment workflows and integrations',
  ecosystem: 'Wallets, ramps, bridges and infrastructure',
}

export const docsExternalTools = [
  { label: 'MPP', href: 'https://mpp.dev/', logo: MppLogo },
  { label: 'Mercator', href: 'https://mercator.sh/', logo: MercatorLogo },
  { label: 'Tempo Console', href: 'https://console.tempo.xyz/', logo: TempoMark },
  { label: 'Tempo Wallet', href: 'https://wallet.tempo.xyz/', logo: TempoMark },
]

export function areaSections(area: DocsArea) {
  return area.sections
    .map((id) => getDocsSectionById(id))
    .filter((section): section is DocsSection => Boolean(section))
}

export function DocsResourceLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav
      aria-label="External tools"
      className={`docs-resource-links ${docsResourceLinks().className}`}
    >
      {docsExternalTools.map((tool) => (
        <a
          key={tool.href}
          href={tool.href}
          aria-label={tool.label}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <span className={`docs-resource-link-label ${docsResourceLinkLabel().className}`}>
            <tool.logo
              className={`docs-resource-logo ${docsResourceLogo().className}`}
              aria-hidden="true"
              focusable="false"
            />
            <span className={`docs-resource-link-text ${docsResourceLinkText().className}`}>
              {tool.label}
            </span>
            <ArrowUpRightIcon aria-hidden="true" width="14" height="14" />
          </span>
        </a>
      ))}
    </nav>
  )
}

/** A disclosure menu in the global nav: a trigger and a panel of links. */
export function DocsNavMenu({
  label,
  ariaLabel,
  active = false,
  align = 'start',
  children,
}: {
  label: React.ReactNode
  ariaLabel?: string
  active?: boolean
  align?: 'start' | 'end'
  children: (close: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const { path } = useRouter()

  useEffect(() => {
    setOpen(false)
  }, [path])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  return (
    // biome-ignore lint/a11y/useSemanticElements: This groups a navigation disclosure, not form controls.
    <div
      ref={ref}
      role="group"
      className={`docs-nav-menu ${docsReferenceMenu().className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          setOpen(false)
          buttonRef.current?.focus()
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`docs-area-link ${docsAreaLink().className}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={active ? 'true' : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDownIcon aria-hidden="true" width="14" height="14" />
      </button>
      <div
        id={panelId}
        hidden={!open}
        data-align={align}
        className={`docs-area-menu-panel ${docsAreaMenuPanel().className}`}
      >
        {children(() => setOpen(false))}
      </div>
    </div>
  )
}

function AreaMenuItem({
  section,
  active,
  onNavigate,
}: {
  section: DocsSection
  active: boolean
  onNavigate: () => void
}) {
  const Icon = sectionIcons[section.id]
  return (
    <Link
      to={section.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`docs-area-menu-item ${docsAreaMenuItem().className}`}
      unstable_prefetchOnEnter={{}}
    >
      {Icon && (
        <Icon
          className={`docs-section-icon ${docsSectionIcon().className}`}
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          strokeWidth="1.75"
        />
      )}
      <span className={docsAreaMenuItemLabel().className}>
        {section.label}
        {sectionDescriptions[section.id] && (
          <span className={docsAreaMenuItemDescription().className}>
            {sectionDescriptions[section.id]}
          </span>
        )}
      </span>
    </Link>
  )
}

/** The six documentation areas in the global nav. Multi-section areas open a menu. */
export function DocsAreaNav({ pathname }: { pathname: string }) {
  const activeSection = getActiveDocsSection(pathname)
  const activeArea = getDocsAreaForSection(activeSection?.id)

  return (
    <nav aria-label="Documentation areas" className={`docs-area-nav ${docsAreaNav().className}`}>
      <ul>
        {docsAreas.map((area) => {
          const sections = areaSections(area)
          const active = activeArea?.id === area.id
          return (
            <li key={area.id}>
              {sections.length > 1 ? (
                <DocsNavMenu label={area.label} active={active}>
                  {(close) =>
                    sections.map((section) => (
                      <AreaMenuItem
                        key={section.id}
                        section={section}
                        active={activeSection?.id === section.id}
                        onNavigate={close}
                      />
                    ))
                  }
                </DocsNavMenu>
              ) : (
                <Link
                  to={area.href}
                  className={`docs-area-link ${docsAreaLink().className}`}
                  aria-current={active ? 'page' : undefined}
                  unstable_prefetchOnEnter={{}}
                  unstable_prefetchOnView={{}}
                >
                  {area.label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * The second row: the sections inside the current area, so readers can move between sibling
 * sections (Accounts → Earn, Tempo API → SDKs & CLI). Home lists the six areas instead.
 */
export default function DocsSectionNav() {
  const { path } = useRouter()
  const navRef = useRef<HTMLElement | null>(null)
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)
  const activeSection = getActiveDocsSection(path ?? '/')
  const activeArea = getDocsAreaForSection(activeSection?.id)
  const items = activeArea
    ? areaSections(activeArea).map((section) => ({
        id: section.id,
        label: section.label,
        href: section.href,
        Icon: sectionIcons[section.id],
        current: activeSection?.id === section.id,
      }))
    : docsAreas.map((area) => ({
        id: area.id,
        label: area.label,
        href: area.href,
        Icon: sectionIcons[area.sections[0] as DocsSection['id']],
        current: false,
      }))

  useEffect(() => {
    const nav = navRef.current
    const activeLink = activeLinkRef.current
    if (!nav || !activeLink) return
    const centeredLeft = activeLink.offsetLeft - nav.clientWidth / 2 + activeLink.offsetWidth / 2
    nav.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'instant' })
  }, [activeSection?.id])

  return (
    <div
      className={`docs-section-nav  ${docsSectionNav().className} ${sectionSurface().className}`}
    >
      <nav
        ref={navRef}
        aria-label={activeArea ? `${activeArea.label} sections` : 'Documentation areas'}
        className={`docs-section-nav-scroll ${docsSectionNavScroll().className}`}
      >
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                ref={(element) => {
                  if (item.current) activeLinkRef.current = element
                }}
                to={item.href}
                unstable_prefetchOnEnter={{}}
                unstable_prefetchOnView={{}}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.Icon && (
                  <item.Icon
                    className={`docs-section-icon ${docsSectionIcon().className}`}
                    aria-hidden="true"
                    focusable="false"
                    width="16"
                    height="16"
                    strokeWidth="1.75"
                  />
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {activeArea && (
        <p className={`docs-section-nav-description ${docsSectionNavDescription().className}`}>
          {activeArea.description}
        </p>
      )}
    </div>
  )
}

'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Link, useRouter } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import BracesIcon from '~icons/lucide/braces'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import CodeIcon from '~icons/lucide/code-xml'
import CompassIcon from '~icons/lucide/compass'
import ScanSearchIcon from '~icons/lucide/scan-search'
import TerminalIcon from '~icons/lucide/terminal'
import {
  type DocsSection,
  docsSections,
  docsUtilitySections,
  getActiveDocsSection,
} from '../lib/docs-sections'
import { docsSectionNav as sectionSurface } from '../styles/surfaces.styles'
import { docsProductIcons } from './DocsHomeProductIcon'
import {
  docsApiMenuItem,
  docsApiMenuMobile,
  docsReferenceMenu,
  docsReferencePanel,
  docsReferenceTrigger,
  docsResourceLinkLabel,
  docsResourceLinks,
  docsResourceLinkText,
  docsResourceLogo,
  docsSectionIcon,
  docsSectionNav,
  docsSectionNavScroll,
  docsSectionUtilities,
  docsSectionUtilityLink,
} from './DocsNavigation.styles'
import { MercatorLogo, MppLogo, TempoMark } from './ToolLogos'

export { docsSections, docsUtilitySections, getActiveDocsSection }

const sectionIcons: Partial<Record<DocsSection['id'], typeof CompassIcon>> = {
  overview: CompassIcon,
  accounts: docsProductIcons.accounts,
  earn: docsProductIcons.earn,
  routes: docsProductIcons.routes,
  zones: docsProductIcons.zones,
  'machine-payments': docsProductIcons.agents,
  developers: docsProductIcons.network,
}

export const docsExternalTools = [
  { label: 'MPP', href: 'https://mpp.dev/', logo: MppLogo },
  { label: 'Mercator', href: 'https://mercator.sh/', logo: MercatorLogo },
  { label: 'Tempo Console', href: 'https://console.tempo.xyz/', logo: TempoMark },
  { label: 'Tempo Wallet', href: 'https://wallet.tempo.xyz/', logo: TempoMark },
]

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

export function DocsApiDropdown({
  active,
  mobile = false,
  onNavigate,
}: {
  active: boolean
  mobile?: boolean
  onNavigate?: () => void
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
      className={
        mobile
          ? `docs-reference-menu docs-api-menu-mobile ${docsReferenceMenu().className} ${docsApiMenuMobile().className}`
          : `docs-reference-menu ${docsReferenceMenu().className}`
      }
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
        className={`docs-reference-trigger ${docsReferenceTrigger().className}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={active ? 'page' : undefined}
        onClick={() => setOpen(!open)}
      >
        APIs & SDKs <ChevronDownIcon aria-hidden="true" width="14" height="14" />
      </button>
      <nav
        id={panelId}
        aria-label="APIs & SDKs"
        hidden={!open}
        className={`docs-reference-panel docs-resource-links ${docsReferencePanel().className} ${docsResourceLinks().className}`}
      >
        {[
          { label: 'Overview', href: '/docs/tools', icon: CompassIcon },
          { label: 'API reference', href: '/docs/api', icon: BracesIcon },
          { label: 'SDKs', href: '/docs/tools#sdks', icon: CodeIcon },
          { label: 'CLI', href: '/docs/cli', icon: TerminalIcon },
        ].map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
          >
            <span className={`docs-api-menu-item ${docsApiMenuItem().className}`}>
              <item.icon aria-hidden="true" width="18" height="18" />
              {item.label}
            </span>
          </Link>
        ))}
        <a
          href="https://explore.tempo.xyz"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setOpen(false)
            onNavigate?.()
          }}
        >
          <span className={`docs-api-menu-item ${docsApiMenuItem().className}`}>
            <ScanSearchIcon aria-hidden="true" width="18" height="18" />
            Explorer
            <ArrowUpRightIcon aria-hidden="true" width="14" height="14" />
          </span>
        </a>
      </nav>
    </div>
  )
}

export default function DocsSectionNav() {
  const { path } = useRouter()
  const navRef = useRef<HTMLElement | null>(null)
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)
  const activeSection = getActiveDocsSection(path ?? '/')
  const activeLabel = activeSection?.label ?? null

  useEffect(() => {
    if (!activeLabel || !docsSections.some((section) => section.id === activeSection?.id)) return
    const nav = navRef.current
    const activeLink = activeLinkRef.current
    if (!nav || !activeLink) return
    const centeredLeft = activeLink.offsetLeft - nav.clientWidth / 2 + activeLink.offsetWidth / 2
    nav.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'instant' })
  }, [activeLabel, activeSection?.id])

  return (
    <div
      className={`docs-section-nav  ${docsSectionNav().className} ${sectionSurface().className}`}
    >
      <nav
        ref={navRef}
        aria-label="Documentation sections"
        className={`docs-section-nav-scroll ${docsSectionNavScroll().className}`}
      >
        <ul>
          {docsSections.map((item) => {
            const Icon = sectionIcons[item.id]
            return (
              <li key={item.id}>
                <Link
                  ref={(element) => {
                    if (activeSection?.id === item.id) activeLinkRef.current = element
                  }}
                  to={item.href}
                  unstable_prefetchOnEnter
                  unstable_prefetchOnView
                  aria-current={activeSection?.id === item.id ? 'page' : undefined}
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
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className={`docs-section-utilities ${docsSectionUtilities().className}`}>
        {docsUtilitySections.map((section) =>
          section.id === 'tools' ? (
            <DocsApiDropdown key={section.id} active={activeSection?.id === section.id} />
          ) : (
            <Link
              key={section.id}
              to={section.href}
              className={`docs-section-utility-link ${docsSectionUtilityLink().className}`}
              aria-current={activeSection?.id === section.id ? 'page' : undefined}
              unstable_prefetchOnEnter
              unstable_prefetchOnView
            >
              {section.label}
            </Link>
          ),
        )}
      </div>
    </div>
  )
}

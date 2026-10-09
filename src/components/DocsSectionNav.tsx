'use client'

import { useEffect, useRef } from 'react'
import { Link, useRouter } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'

import { docsSections, docsUtilitySections, getActiveDocsSection } from '../lib/docs-sections'
import { MercatorLogo, MppLogo, TempoMark } from './ToolLogos'

export { docsSections, docsUtilitySections, getActiveDocsSection }

export const docsExternalTools = [
  { label: 'MPP', href: 'https://mpp.dev/', logo: MppLogo },
  { label: 'Mercator', href: 'https://mercator.sh/', logo: MercatorLogo },
  { label: 'Tempo Console', href: 'https://console.tempo.xyz/', logo: TempoMark },
  { label: 'Tempo Wallet', href: 'https://wallet.tempo.xyz/', logo: TempoMark },
]

export function DocsResourceLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="External tools" className="docs-resource-links">
      {docsExternalTools.map((tool) => (
        <a
          key={tool.href}
          href={tool.href}
          aria-label={tool.label}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          <span className="docs-resource-link-label">
            <tool.logo className="docs-resource-logo" aria-hidden="true" focusable="false" />
            <span className="docs-resource-link-text">{tool.label}</span>
            <ArrowUpRightIcon aria-hidden="true" width="14" height="14" />
          </span>
        </a>
      ))}
    </nav>
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
    <div className="docs-section-nav">
      <nav ref={navRef} aria-label="Documentation sections" className="docs-section-nav-scroll">
        <ul>
          {docsSections.map((item) => (
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
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="docs-section-utilities">
        {docsUtilitySections.map((section) => (
          <Link
            key={section.id}
            to={section.href}
            className="docs-section-utility-link"
            aria-current={activeSection?.id === section.id ? 'page' : undefined}
            unstable_prefetchOnEnter
            unstable_prefetchOnView
          >
            {section.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

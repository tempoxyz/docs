'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import ChevronDownIcon from '~icons/lucide/chevron-down'

import { docsSections, getActiveDocsSection, specificationsSection } from '../lib/docs-sections'
import { MercatorLogo, MppLogo, TempoMark } from './ToolLogos'

export { docsSections, getActiveDocsSection, specificationsSection }

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

function DocsToolsMenu({ route }: { route: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => setOpen(false), [route])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: Event) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 800px)')
    const onResize = () => {
      if (!desktop.matches) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onResize)
    }
  }, [open])

  const focusFirstLink = () =>
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus())

  return (
    <div ref={menuRef} className="docs-reference-menu">
      <button
        ref={buttonRef}
        type="button"
        disabled={!mounted}
        aria-expanded={open}
        aria-controls="docs-reference-panel"
        className="docs-reference-trigger"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            focusFirstLink()
          }
        }}
      >
        Tools
        <ChevronDownIcon
          aria-hidden="true"
          width="14"
          height="14"
          className={open ? 'rotate-180' : undefined}
        />
      </button>
      {open ? (
        <div id="docs-reference-panel" className="docs-reference-panel">
          <DocsResourceLinks onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
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
        <DocsToolsMenu route={path ?? '/'} />
        <Link
          to={specificationsSection.href}
          className="docs-section-utility-link"
          aria-current={
            activeSection?.id === 'protocol' || activeSection?.id === 'changelog'
              ? 'page'
              : undefined
          }
          unstable_prefetchOnEnter
          unstable_prefetchOnView
        >
          {specificationsSection.label}
        </Link>
      </div>
    </div>
  )
}

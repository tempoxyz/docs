'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useActiveSidebarAnchor, useConfig } from 'vocs'
import { Link } from 'waku'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import { getActiveDocsArea, getActiveDocsSection } from '../lib/docs-sections'
import { normalizeDocsPath } from '../lib/docs-sidebar'
import { resolveSidebarItems, SidebarNodes, usePathname } from './DocsHeader'
import { areaSections } from './DocsSectionNav'
import * as ui from './DocsSidebarDrawer.recipes'

function collectSidebarLinks(nodes: ReturnType<typeof resolveSidebarItems>): string[] {
  return nodes.flatMap((node) => [
    ...(node.link ? [node.link] : []),
    ...collectSidebarLinks(node.items ?? []),
  ])
}

/** The sidebar label of the current page, for the page bar's "Section / Page". */
function activePageLabel(
  nodes: ReturnType<typeof resolveSidebarItems>,
  pathname: string,
): string | undefined {
  for (const node of nodes) {
    const link = node.link?.split('#')[0]
    if (link?.startsWith('/') && normalizeDocsPath(link).replace(/\/+$/, '') === pathname)
      return node.text
    const child = activePageLabel(node.items ?? [], pathname)
    if (child) return child
  }
}

/**
 * The page bar below Desktop and its drawer.
 *
 * Injects a "Section / Page" trigger into the sticky outline row (Vocs'
 * `[data-v-outline-mobile]` bar), which becomes the page bar: its own
 * "On this page" button is hidden below Desktop. The trigger opens a drawer with
 * the current tab's sections, then the section's sidebar. Pages without an
 * outline get a standalone page bar in the same position.
 */
export default function DocsSidebarDrawer() {
  const pathname = usePathname()
  const config = useConfig()
  const items = resolveSidebarItems(config?.sidebar, pathname)
  const links = useMemo(() => collectSidebarLinks(items), [items])
  const activeAnchor = useActiveSidebarAnchor(links)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dialogId = useId()
  const titleId = useId()

  // Mount a portal host inside the outline row, re-attaching whenever the route
  // changes (Vocs re-creates the row per page).
  useEffect(() => {
    if (pathname === '/') return
    let span: HTMLElement | null = null

    const attach = () => {
      // The row itself, not its inner div: that div holds Vocs' "On this page" button, which the
      // page bar hides below Desktop.
      const row = document.querySelector<HTMLElement>('[data-v-outline-mobile]')
      const main = document.querySelector('[data-layout] > [data-v-main]')
      const target = row ?? (main?.querySelector('.tempo-docs-home, .docs-not-found') ? null : main)
      if (span?.isConnected && span.parentElement === target) return
      span?.remove()
      span = null
      if (!target) {
        setHost(null)
        return
      }
      span = document.createElement('span')
      span.className = ui.docsPageBarHost().className
      span.dataset.docsSidebarToggle = ''
      if (!row) span.dataset.docsSidebarFallback = ''
      target.prepend(span)
      setHost(span)
    }

    attach()
    // Keep observing: a client navigation can replace the row after its pathname
    // updates, including when moving between pages within the same docs layout.
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      span?.remove()
      setHost(null)
    }
  }, [pathname])

  // Close on route change.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Keep keyboard focus in the modal and return it to the trigger on dismissal.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    const desktop = window.matchMedia('(min-width: 1080px)')
    const focusableElements = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          // Closed <details> descendants can retain client rects but cannot receive focus.
          element.checkVisibility({ visibilityProperty: true }) &&
          !element.closest('[inert]'),
      )
    const focusFirst = () => (focusableElements()[0] ?? panel).focus()
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !panel.contains(event.target)) focusFirst()
    }
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        // Release this modal before Vocs opens search and takes keyboard focus.
        event.preventDefault()
        event.stopImmediatePropagation()
        setOpen(false)
        requestAnimationFrame(() => {
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'k',
              code: 'KeyK',
              bubbles: true,
              cancelable: true,
              metaKey: event.metaKey,
              ctrlKey: event.ctrlKey,
            }),
          )
        })
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        setOpen(false)
      }
      if (event.key !== 'Tab') return
      const elements = focusableElements()
      const first = elements[0]
      const last = elements.at(-1)
      if (!first || !last) {
        event.preventDefault()
        panel.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === panel)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === panel)
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    focusFirst()
    closeOnDesktop()
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('focusin', onFocus)
    desktop.addEventListener('change', closeOnDesktop)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('focusin', onFocus)
      desktop.removeEventListener('change', closeOnDesktop)
      document.body.style.overflow = prevOverflow
      // Activation may not focus the trigger, and the outline can replace its
      // portal host. Restore the current button rather than a captured element.
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  if (pathname === '/' || items.length === 0) return null

  const section = getActiveDocsSection(pathname)
  const area = getActiveDocsArea(pathname)
  const sections = area ? areaSections(area) : []
  const pageLabel = activePageLabel(items, normalizeDocsPath(pathname).replace(/\/+$/, '') || '/')

  const toggle = host
    ? createPortal(
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close docs navigation' : 'Open docs navigation'}
          aria-expanded={open}
          aria-controls={dialogId}
          aria-haspopup="dialog"
          {...ui.docsSidebarDrawerButton()}
        >
          <span {...ui.docsPageBarSection()}>{section?.label ?? 'Docs'}</span>
          {pageLabel ? (
            <>
              <span aria-hidden="true" {...ui.docsPageBarSeparator()}>
                /
              </span>
              <span {...ui.docsPageBarPage()}>{pageLabel}</span>
            </>
          ) : null}
          <ChevronDownIcon aria-hidden="true" width="16" height="16" {...ui.docsPageBarChevron()} />
        </button>,
        host,
      )
    : null

  return (
    <>
      {toggle}
      <div {...ui.docsSidebarDrawerLayout()} aria-hidden={!open} inert={!open}>
        {/* Backdrop */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss. */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape handled globally. */}
        <div onClick={() => setOpen(false)} {...ui.docsSidebarDrawerLayout3()} />
        {/* Panel */}
        <div
          ref={panelRef}
          id={dialogId}
          role="dialog"
          aria-modal={open ? true : undefined}
          aria-labelledby={titleId}
          tabIndex={-1}
          {...ui.docsSidebarDrawerLayout6()}
        >
          <div {...ui.docsSidebarDrawerLayout9()}>
            <span id={titleId} {...ui.docsSidebarDrawerText()}>
              {area?.label ?? 'Docs'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close docs navigation"
              {...ui.docsSidebarDrawerButton2()}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <title>Close</title>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div {...ui.docsSidebarDrawerLayout10()}>
            {sections.length > 1 ? (
              <nav aria-label={`${area?.label} sections`} {...ui.docsDrawerSections()}>
                {sections.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={item.id === section?.id ? 'page' : undefined}
                    {...ui.docsDrawerSectionLink()}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}
            <SidebarNodes
              nodes={items}
              pathname={pathname}
              activeAnchor={activeAnchor}
              depth={0}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  )
}

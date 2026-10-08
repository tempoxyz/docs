'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useActiveSidebarAnchor, useConfig } from 'vocs'
import { useRouter } from 'waku'
import { resolveSidebarItems, SidebarNodes, usePathname } from './DocsHeader'

function collectSidebarLinks(nodes: ReturnType<typeof resolveSidebarItems>): string[] {
  return nodes.flatMap((node) => [
    ...(node.link ? [node.link] : []),
    ...collectSidebarLinks(node.items ?? []),
  ])
}

/**
 * Mobile-only docs sidebar drawer.
 *
 * Injects a hamburger toggle into the sticky "On this page" outline row (Vocs'
 * `[data-v-outline-mobile]` bar) so the docs sidebar stays reachable while
 * scrolling, then slides the sidebar tree in from the left. Pages without an
 * outline get a standalone menu row in the same position.
 */
export default function DocsSidebarDrawer() {
  const pathname = usePathname()
  const { hash } = useRouter()
  const config = useConfig()
  const items = resolveSidebarItems(config?.sidebar, pathname)
  const links = useMemo(() => collectSidebarLinks(items), [items])
  const activeAnchor = useActiveSidebarAnchor(links, pathname, hash)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dialogId = useId()
  const titleId = useId()

  // Mount a portal host inside the outline row, re-attaching whenever the route
  // changes (Vocs re-creates the row per page).
  useEffect(() => {
    if (pathname === '/') return
    let span: HTMLElement | null = null

    const attach = () => {
      const row = document.querySelector('[data-v-outline-mobile] > div')
      const main = document.querySelector('[data-layout] > [data-v-main]')
      const target = row ?? (main?.querySelector('.tempo-docs-home') ? null : main)
      if (span?.isConnected && span.parentElement === target) return
      span?.remove()
      span = null
      if (!target) {
        setHost(null)
        return
      }
      span = document.createElement('span')
      span.dataset.docsSidebarToggle = ''
      if (row) span.style.marginRight = '0.5rem'
      else span.dataset.docsSidebarFallback = ''
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
    const previousFocus = document.activeElement
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
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [open])

  if (pathname === '/' || items.length === 0) return null

  const toggle = host
    ? createPortal(
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close docs navigation' : 'Open docs navigation'}
          aria-expanded={open}
          aria-controls={dialogId}
          aria-haspopup="dialog"
          className="flex min-h-9 items-center gap-1.5 rounded-md font-sans text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 min-[1080px]:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
            <title>Docs navigation</title>
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>Menu</span>
        </button>,
        host,
      )
    : null

  return (
    <>
      {toggle}
      <div
        className={`fixed inset-0 z-[70] min-[1080px]:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
        inert={!open}
      >
        {/* Backdrop */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss. */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape handled globally. */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Panel */}
        <div
          ref={panelRef}
          id={dialogId}
          role="dialog"
          aria-modal={open ? true : undefined}
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`absolute top-0 left-0 flex h-full w-[82%] max-w-[320px] flex-col border-line border-r bg-background transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-line border-b px-5 py-4">
            <span id={titleId} className="font-sans text-[15px] text-foreground tracking-[0]">
              Documentation
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close docs navigation"
              className="grid size-10 place-items-center rounded-lg text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
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
          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-3">
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

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useConfig } from 'vocs'
import { resolveSidebarItems, SidebarNodes, usePathname } from './DocsHeader'

/**
 * Mobile-only docs sidebar drawer.
 *
 * Injects a hamburger toggle into the sticky "On this page" outline row (Vocs'
 * `[data-v-outline-mobile]` bar) so the docs sidebar stays reachable while
 * scrolling, then slides the sidebar tree in from the left. On pages without an
 * outline row the full-screen menu's "Docs" section remains the fallback.
 */
export default function DocsSidebarDrawer() {
  const pathname = usePathname()
  const config = useConfig()
  const items = resolveSidebarItems(config?.sidebar, pathname)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)

  // Mount a portal host inside the outline row, re-attaching whenever the route
  // changes (Vocs re-creates the row per page).
  useEffect(() => {
    let span: HTMLElement | null = null

    const attach = () => {
      const row = document.querySelector('[data-v-outline-mobile] > div')
      if (!row || span) return Boolean(span)
      span = document.createElement('span')
      span.dataset.docsSidebarToggle = ''
      span.style.display = 'inline-flex'
      span.style.marginRight = '0.5rem'
      row.prepend(span)
      setHost(span)
      return true
    }

    if (attach()) {
      return () => {
        span?.remove()
        setHost(null)
      }
    }

    const observer = new MutationObserver(() => {
      if (attach()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      span?.remove()
      setHost(null)
    }
  }, [])

  // Close on route change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: close drawer when the path changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (items.length === 0) return null

  const toggle = host
    ? createPortal(
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open docs navigation"
          aria-expanded={open}
          className="flex items-center gap-1.5 font-sans text-foreground/70 transition-colors hover:text-foreground"
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
        className={`fixed inset-0 z-[60] lg:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss. */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape handled globally. */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Panel */}
        <div
          className={`absolute top-0 left-0 flex h-full w-[82%] max-w-[320px] flex-col border-line border-r bg-background transition-transform duration-200 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-line border-b px-5 py-4">
            <span className="font-sans text-[15px] text-foreground tracking-[0]">
              Documentation
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close docs navigation"
              className="grid size-8 place-items-center text-foreground/70 transition-colors hover:text-foreground"
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
              depth={0}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  )
}

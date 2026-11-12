'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, Link as WakuLink } from 'waku'
import { cx as composeStyles } from 'zyzz'
import { normalizeDocsPath, type SidebarNode } from '../lib/docs-sidebar'

export { normalizeDocsPath, resolveSidebarItems } from '../lib/docs-sidebar'

import { DOCS_SEARCH_PARAM } from '../lib/docs-search'
import { docsAreas } from '../lib/docs-sections'
import { navActiveSquare } from '../styles/surfaces.styles'
import * as ui from './DocsHeader.recipes'
import { DocsLockup } from './DocsLockup'
import {
  docsHeaderActions,
  docsHeaderGetKey,
  docsHeaderIconButton,
  docsHeaderKbd,
  docsHeaderLeft,
  docsHeaderLogo,
  docsHeaderMenuButton,
  docsHeaderMobileAreaGroup,
  docsHeaderMobileAreaLabel,
  docsHeaderMobileBody,
  docsHeaderMobileDialog,
  docsHeaderMobileGetKey,
  docsHeaderMobileLink,
  docsHeaderMobileSearch,
  docsHeaderMobileSections,
  docsHeaderMobileTheme,
  docsHeaderMobileTop,
  docsHeaderNav,
  docsHeaderSearchField,
  docsHeaderSearchLabel,
  docsHeaderWordmark,
  docsSiteHeader,
} from './DocsNavigation.styles'
import { areaSections, DocsAreaNav, getActiveDocsSection } from './DocsSectionNav'
import { HeadingAnchorFeedback } from './HeadingAnchorFeedback'
import { SearchDialogMotion } from './SearchDialogMotion'
import { SmoothCorners } from './SmoothCorners'

/** Tempo Console. This host forwards to developers.tempo.xyz/console once the console moves there. */
const CONSOLE_URL = 'https://console.tempo.xyz'
/** Console session lookup, proxied by this host; its cookie is scoped to `/console` so docs pages never see it. */
const CONSOLE_ME_PATH = '/console/api/v1/me'

/** Email of the signed-in console user, or undefined while signed out or off the console's host. */
function useConsoleEmail() {
  const [email, setEmail] = useState<string | undefined>()
  useEffect(() => {
    // The tempo.xyz/developers mount is a different origin from the console, so it never has a session.
    if (window.location.hostname === 'tempo.xyz') return
    const controller = new AbortController()
    fetch(CONSOLE_ME_PATH, { credentials: 'same-origin', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((body: unknown) => {
        if (body && typeof body === 'object' && 'email' in body && typeof body.email === 'string')
          setEmail(body.email)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])
  return email
}

function isExternal(href: string) {
  return !href.startsWith('/') && !href.startsWith('#')
}

export function usePathname() {
  const { path } = useRouter()
  const [pathname, setPathname] = useState(() => normalizeDocsPath(path ?? '/'))

  useLayoutEffect(() => {
    const update = () => setPathname(normalizeDocsPath(window.location.pathname))
    update()
    window.addEventListener('popstate', update)
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('hashchange', update)
    }
  }, [])

  useEffect(() => {
    if (path) setPathname(normalizeDocsPath(path))
  }, [path])

  return pathname
}

function Anchor({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a {...props}>{children}</a>
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
  return (
    <WakuLink {...props} to={href} unstable_prefetchOnEnter={{}} unstable_prefetchOnView={{}}>
      {children}
    </WakuLink>
  )
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 17 17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ActiveSquare({ activeKey }: { activeKey: string }) {
  return (
    <svg
      key={activeKey}
      viewBox="0 0 11 11"
      aria-hidden="true"
      {...ui.activeSquareIcon({ className: `nav-active-square ${navActiveSquare().className}` })}
    >
      {[0, 4, 8].flatMap((y) =>
        [0, 4, 8].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={3} height={3} fill="currentColor" />
        )),
      )}
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={` ${ui.searchIconIcon().className} ${className ?? ''}`}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

// The custom DocsHeader replaces Vocs' default top nav, whose hidden
// `[data-v-gutter-top]` container still mounts Vocs' built-in `<Search />`
// (it owns a global Cmd/Ctrl+K listener and the search dialog). Rather than
// importing that internal, unexported component, we re-expose the affordance by
// dispatching the same shortcut Vocs already handles. See src/styles/globals.ts
// where the gutter is hidden, and node_modules/vocs Search.tsx for the listener.
//
// Returns true when Vocs handled the shortcut (it calls `preventDefault`, so
// `dispatchEvent` returns false). The shortcut *toggles* the dialog, so callers
// must only dispatch once per intended open.
function dispatchDocsSearchShortcut() {
  if (typeof document === 'undefined') return false
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    bubbles: true,
    cancelable: true,
    // Vocs checks `metaKey || ctrlKey`, so set both and skip platform detection.
    metaKey: true,
    ctrlKey: true,
  })
  return !document.dispatchEvent(event)
}

function openDocsSearch() {
  if (!dispatchDocsSearchShortcut() && import.meta.env.DEV) {
    console.warn(
      'Vocs search did not handle Cmd/Ctrl+K. Verify the hidden Vocs top-nav search is still mounted (showTopNav/showSearch).',
    )
  }
}

// Used when arriving from the marketing site via `?search` (see lib/docs-search):
// the Vocs Search instance may not have attached its keydown listener yet on the
// first paint, so retry across a few frames until the dialog opens. We stop on
// the first success to avoid the toggle re-closing it.
function openDocsSearchWhenReady(attempt = 0) {
  if (dispatchDocsSearchShortcut()) return
  if (attempt >= 30) {
    if (import.meta.env.DEV) {
      console.warn('Vocs search did not open after navigation; the search instance never mounted.')
    }
    return
  }
  requestAnimationFrame(() => openDocsSearchWhenReady(attempt + 1))
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...composeStyles(ui.chevronIcon(), !!open && ui.chevronIcon2())}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function sidebarLinkIsActive(pathname: string, link: string, activeAnchor: string | null) {
  if (isExternal(link)) return false
  const [target, fragment] = link.split('#')
  const targetPath = normalizeDocsPath(target?.split('?')[0] || pathname).replace(/\/+$/, '')
  if (normalizeDocsPath(pathname).replace(/\/+$/, '') !== targetPath) return false
  if (!fragment) return activeAnchor === null

  try {
    return decodeURIComponent(fragment) === activeAnchor
  } catch {
    return fragment === activeAnchor
  }
}

function nodeContainsActive(
  node: SidebarNode,
  pathname: string,
  activeAnchor: string | null,
): boolean {
  if (node.link && sidebarLinkIsActive(pathname, node.link, activeAnchor)) return true
  return Boolean(node.items?.some((child) => nodeContainsActive(child, pathname, activeAnchor)))
}

function SidebarLeaf({
  node,
  pathname,
  activeAnchor,
  depth,
  onNavigate,
}: {
  node: SidebarNode
  pathname: string
  activeAnchor: string | null
  depth: number
  onNavigate: () => void
}) {
  const active = node.link ? sidebarLinkIsActive(pathname, node.link, activeAnchor) : false
  const external = node.link ? isExternal(node.link) : false
  return (
    <Anchor
      href={node.link ?? '#'}
      onClick={onNavigate}
      aria-current={active ? (node.link?.includes('#') ? 'location' : 'page') : undefined}
      {...ui.sidebarLeafAnchorAppearance({
        value0: depth > 1 ? `${(depth - 1) * 12 + 8}px` : '8px',
        className: ` ${ui.anchor2().className} ${
          active ? ui.anchor3().className : ui.anchor4().className
        }`,
      })}
    >
      {active ? <ActiveSquare activeKey={`${pathname}#${activeAnchor ?? ''}`} /> : null}
      {node.text}
      {external ? <ArrowUpRight className={ui.arrowUpRight2().className} /> : null}
    </Anchor>
  )
}

function SidebarDisclosure({
  node,
  pathname,
  activeAnchor,
  depth,
  onNavigate,
}: {
  node: SidebarNode
  pathname: string
  activeAnchor: string | null
  depth: number
  onNavigate: () => void
}) {
  const containsActivePage = nodeContainsActive(node, pathname, activeAnchor)
  const [open, setOpen] = useState(() => !node.collapsed || containsActivePage)

  // Match the desktop sidebar: reveal newly selected pages while preserving
  // groups the reader has opened themselves.
  useEffect(() => {
    if (containsActivePage) setOpen(true)
  }, [containsActivePage])

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      {...ui.sidebarDisclosureDetailsAppearance({
        value0: depth > 1 ? `${(depth - 1) * 12}px` : '0px',
        className: ui.sidebarDisclosureDetails({ className: 'group/sb' }).className,
      })}
    >
      <summary {...ui.sidebarDisclosureSummary()}>
        {node.text}
        <Chevron open={open} />
      </summary>
      <div {...ui.sidebarDisclosureLayout()}>
        <SidebarNodes
          // The summary only toggles, so a group with its own page lists that page first.
          nodes={
            node.link
              ? [{ text: 'Overview', link: node.link }, ...(node.items ?? [])]
              : (node.items ?? [])
          }
          pathname={pathname}
          activeAnchor={activeAnchor}
          depth={depth + 1}
          onNavigate={onNavigate}
        />
      </div>
    </details>
  )
}

export function SidebarNodes({
  nodes,
  pathname,
  activeAnchor,
  depth,
  onNavigate,
}: {
  nodes: SidebarNode[]
  pathname: string
  activeAnchor: string | null
  depth: number
  onNavigate: () => void
}) {
  return (
    <>
      {nodes.map((node, i) => {
        const key = `${node.text ?? node.link ?? 'node'}-${i}`
        const hasChildren = Array.isArray(node.items) && node.items.length > 0

        // Leaf link.
        if (!hasChildren) {
          return (
            <SidebarLeaf
              key={key}
              node={node}
              pathname={pathname}
              activeAnchor={activeAnchor}
              depth={depth}
              onNavigate={onNavigate}
            />
          )
        }

        // Non-collapsible section (e.g. "Build on Tempo"): a heading + children.
        if (node.collapsed === undefined) {
          return (
            <div
              key={key}
              className={
                depth === 0 ? ui.sidebarNodesLayout().className : ui.sidebarNodesLayout2().className
              }
            >
              <p
                {...(depth === 0 && nodes.length === 1
                  ? ui.sidebarNodesTitle()
                  : ui.sidebarNodesDescription())}
              >
                {node.text}
              </p>
              <div
                className={
                  depth > 0
                    ? ui.sidebarNodesLayout3().className
                    : ui.sidebarNodesLayout4().className
                }
              >
                <SidebarNodes
                  nodes={node.items ?? []}
                  pathname={pathname}
                  activeAnchor={activeAnchor}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          )
        }

        return (
          <SidebarDisclosure
            key={key}
            node={node}
            pathname={pathname}
            activeAnchor={activeAnchor}
            depth={depth}
            onNavigate={onNavigate}
          />
        )
      })}
    </>
  )
}

export default function DocsHeader() {
  const pathname = usePathname()
  const activeSection = getActiveDocsSection(pathname)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const email = useConsoleEmail()
  const mobileDialogRef = useRef<HTMLDialogElement | null>(null)
  const mobileCloseRef = useRef<HTMLButtonElement | null>(null)
  // Get API key opens Console, which signs in; once signed in, the button names Console itself.
  const consoleLabel = email ? 'Console' : 'Get API key'
  const consoleTitle = email ? { title: `Signed in as ${email}` } : {}

  const close = () => setOpen(false)

  const openSearch = () => {
    mobileDialogRef.current?.close()
    close()
    requestAnimationFrame(openDocsSearch)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close the menu after navigation, including browser back/forward.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const dialog = mobileDialogRef.current
    if (!dialog) return
    if (!open) {
      dialog.close()
      return
    }
    dialog.showModal()
    mobileCloseRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // A resized desktop viewport must not retain an invisible modal.
    const desktop = window.matchMedia('(min-width: 1080px)')
    const onResize = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      desktop.removeEventListener('change', onResize)
      dialog.close()
    }
  }, [open])

  // Open search when arriving from the website with ?search=1.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has(DOCS_SEARCH_PARAM)) return
    params.delete(DOCS_SEARCH_PARAM)
    const query = params.toString()
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    )
    openDocsSearchWhenReady()
  }, [])

  const brand = (
    <WakuLink
      to="/"
      onClick={close}
      aria-label="Tempo Developers"
      className={`docs-header-logo ${docsHeaderLogo().className}`}
    >
      <DocsLockup className={docsHeaderWordmark().className} />
    </WakuLink>
  )

  return (
    <header className={`docs-site-header ${docsSiteHeader().className}`}>
      <SmoothCorners />
      <HeadingAnchorFeedback />
      <SearchDialogMotion />
      <nav
        className={`docs-header-nav ${docsHeaderNav().className}`}
        aria-label="Developer navigation"
      >
        <div className={`docs-header-left ${docsHeaderLeft().className}`}>
          {brand}
          <DocsAreaNav pathname={pathname} />
        </div>
        <div className={`docs-header-actions ${docsHeaderActions().className}`}>
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            title="Search documentation (⌘K)"
            disabled={!mounted}
            className={`docs-header-search ${docsHeaderSearchField().className}`}
          >
            <SearchIcon />
            <span className={docsHeaderSearchLabel().className}>Search docs</span>
            <kbd className={docsHeaderKbd().className}>⌘K</kbd>
          </button>
          {/* Absolute: the docs are also mounted at tempo.xyz/developers, where relative links miss the console. */}
          <a
            href={CONSOLE_URL}
            className={`docs-header-get-key ${docsHeaderGetKey().className}`}
            {...consoleTitle}
          >
            {consoleLabel}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            disabled={!mounted}
            aria-expanded={open}
            aria-controls="docs-mobile-navigation"
            className={`docs-header-icon-button ${docsHeaderIconButton().className} ${docsHeaderMenuButton().className}`}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      <dialog
        ref={mobileDialogRef}
        id="docs-mobile-navigation"
        className={`docs-header-mobile-dialog ${docsHeaderMobileDialog().className}`}
        aria-label="Documentation navigation"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault()
            event.stopPropagation()
            openSearch()
          }
        }}
      >
        <div className={`docs-header-mobile-top ${docsHeaderMobileTop().className}`}>
          {brand}
          <button
            type="button"
            ref={mobileCloseRef}
            onClick={close}
            aria-label="Close menu"
            className={`docs-header-icon-button ${docsHeaderIconButton().className}`}
          >
            <CloseIcon />
          </button>
        </div>
        <div className={`docs-header-mobile-body ${docsHeaderMobileBody().className}`}>
          <button
            type="button"
            onClick={openSearch}
            className={`docs-header-mobile-search ${docsHeaderMobileSearch().className}`}
          >
            <SearchIcon /> Search docs
          </button>
          <nav
            aria-label="All documentation areas"
            className={`docs-header-mobile-sections ${docsHeaderMobileSections().className}`}
          >
            {docsAreas.map((area) => {
              const sections = areaSections(area)
              if (!sections.length)
                return (
                  <WakuLink
                    key={area.id}
                    to={area.href}
                    onClick={close}
                    aria-current={pathname === area.href ? 'page' : undefined}
                    className={docsHeaderMobileLink().className}
                  >
                    {area.label}
                  </WakuLink>
                )
              return (
                <div key={area.id} className={docsHeaderMobileAreaGroup().className}>
                  <p className={docsHeaderMobileAreaLabel().className}>{area.label}</p>
                  {sections.map((section) => (
                    <WakuLink
                      key={section.id}
                      to={section.href}
                      onClick={close}
                      aria-current={activeSection?.id === section.id ? 'page' : undefined}
                      className={docsHeaderMobileLink().className}
                    >
                      {section.label}
                    </WakuLink>
                  ))}
                </div>
              )
            })}
          </nav>
          <a
            href={CONSOLE_URL}
            className={`docs-header-mobile-get-key ${docsHeaderMobileGetKey().className}`}
            {...consoleTitle}
          >
            {consoleLabel}
          </a>
          <ThemeSelect />
        </div>
      </dialog>
    </header>
  )
}

function ThemeSelect() {
  const [theme, setTheme] = useState('system')
  useEffect(() => {
    const sync = () => setTheme(localStorage.getItem('vocs-theme') ?? 'system')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-vocs-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <label className={`docs-header-mobile-theme ${docsHeaderMobileTheme().className}`}>
      <span>Appearance</span>
      <select
        aria-label="Color theme"
        value={theme}
        onChange={(event) => {
          const selected = event.target.value
          const label = selected.charAt(0).toUpperCase() + selected.slice(1)
          const control = document.querySelector<HTMLElement>(
            `[data-v-sidebar-footer-content] [role="radio"][aria-label="${label} theme"]`,
          )
          if (control) control.click()
          else {
            localStorage.setItem('vocs-theme', selected)
            const resolved =
              selected === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light'
                : selected
            document.documentElement.dataset.vocsTheme = resolved
            document.documentElement.style.colorScheme = resolved
          }
          setTheme(selected)
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}

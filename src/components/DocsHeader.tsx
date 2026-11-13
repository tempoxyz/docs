'use client'

import { Button, Kbd, Menu } from '@tempoxyz/ds'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useRouter, Link as WakuLink } from 'waku'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import { DOCS_SEARCH_PARAM } from '../lib/docs-search'
import { docsResourceSections, docsSections, getActiveDocsSection } from '../lib/docs-sections'
import { normalizeDocsPath } from '../lib/docs-sidebar'
import { DocsLockup } from './DocsLockup'
import DocsMenuDrawer from './DocsMenuDrawer'
import {
  docsHeaderActions,
  docsHeaderGetKey,
  docsHeaderKbd,
  docsHeaderLeft,
  docsHeaderLogo,
  docsHeaderNav,
  docsHeaderSearchField,
  docsHeaderSearchLabel,
  docsHeaderWordmark,
  docsProductChevron,
  docsProductLink,
  docsProductNav,
  docsSiteHeader,
} from './DocsNavigation.styles'
import { HeadingAnchorFeedback } from './HeadingAnchorFeedback'
import { RouterLink } from './RouterLink'
import { SearchDialogMotion } from './SearchDialogMotion'
import { SmoothCorners } from './SmoothCorners'

export { normalizeDocsPath, resolveSidebarItems } from '../lib/docs-sidebar'

/** Tempo Console. This host forwards to developers.tempo.xyz/console once the console moves there. */
export const CONSOLE_URL = 'https://console.tempo.xyz'
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

export function SearchIcon() {
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

export function openDocsSearch() {
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

/** The products as plain links, then Resources, the only menu in the bar. */
function DocsProductNav({ pathname }: { pathname: string }) {
  const active = getActiveDocsSection(pathname)
  const inResources = docsResourceSections.some((section) => section.id === active?.id)

  return (
    <nav aria-label="Products" className={`docs-product-nav ${docsProductNav().className}`}>
      <ul>
        {docsSections.map((section) => (
          <li key={section.id}>
            <WakuLink
              to={section.href}
              aria-current={active?.id === section.id ? 'page' : undefined}
              className={docsProductLink().className}
              unstable_prefetchOnEnter={{}}
              unstable_prefetchOnView={{}}
            >
              {section.label}
            </WakuLink>
          </li>
        ))}
        <li>
          <Menu.Root>
            <Menu.Trigger
              className={`docs-resources-trigger ${docsProductLink().className}`}
              data-active={inResources ? '' : undefined}
            >
              Resources
              <ChevronDownIcon
                aria-hidden="true"
                width="16"
                height="16"
                className={docsProductChevron().className}
              />
            </Menu.Trigger>
            <Menu.Popup align="start">
              {docsResourceSections.map((section) => (
                <Menu.LinkItem
                  key={section.id}
                  closeOnClick
                  aria-current={active?.id === section.id ? 'page' : undefined}
                  render={<RouterLink to={section.href} />}
                >
                  {section.label}
                </Menu.LinkItem>
              ))}
            </Menu.Popup>
          </Menu.Root>
        </li>
      </ul>
    </nav>
  )
}

export default function DocsHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const email = useConsoleEmail()
  // Get API key opens Console, which signs in; once signed in, the button names Console itself.
  const consoleLabel = email ? 'Console' : 'Get API key'
  const consoleTitle = email ? `Signed in as ${email}` : undefined

  useEffect(() => {
    setMounted(true)
  }, [])

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

  return (
    <header className={`docs-site-header ${docsSiteHeader().className}`}>
      <SmoothCorners />
      <HeadingAnchorFeedback />
      <SearchDialogMotion />
      <div className={`docs-header-nav ${docsHeaderNav().className}`}>
        <div className={`docs-header-left ${docsHeaderLeft().className}`}>
          <WakuLink
            to="/"
            aria-label="Tempo Developers"
            className={`docs-header-logo ${docsHeaderLogo().className}`}
          >
            <DocsLockup className={docsHeaderWordmark().className} />
          </WakuLink>
          <DocsProductNav pathname={pathname} />
        </div>
        <div className={`docs-header-actions ${docsHeaderActions().className}`}>
          <button
            type="button"
            onClick={openDocsSearch}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            title="Search documentation (⌘K)"
            disabled={!mounted}
            className={`docs-header-search ${docsHeaderSearchField().className}`}
          >
            <SearchIcon />
            <span className={docsHeaderSearchLabel().className}>Search docs</span>
            <Kbd mod size="small" className={docsHeaderKbd().className}>
              K
            </Kbd>
          </button>
          <span className={`docs-header-get-key ${docsHeaderGetKey().className}`}>
            {/* Absolute: the docs are also mounted at tempo.xyz/developers, where relative links miss the console. */}
            <Button.Link href={CONSOLE_URL} variant="primary" size="small" title={consoleTitle}>
              {consoleLabel}
            </Button.Link>
          </span>
          <DocsMenuDrawer
            pathname={pathname}
            consoleHref={CONSOLE_URL}
            consoleLabel={consoleLabel}
            consoleTitle={consoleTitle}
            disabled={!mounted}
            onSearch={openDocsSearch}
          />
        </div>
      </div>
    </header>
  )
}

'use client'

import { Button, Drawer, SidebarMenu } from '@tempoxyz/ds'
import { type ComponentType, type SVGProps, useEffect, useState } from 'react'
import { useConfig } from 'vocs'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import BookOpenIcon from '~icons/lucide/book-open'
import CompassIcon from '~icons/lucide/compass'
import HandshakeIcon from '~icons/lucide/handshake'
import MenuIcon from '~icons/lucide/menu'
import SearchIcon from '~icons/lucide/search'
import TerminalIcon from '~icons/lucide/terminal'
import {
  type DocsSection,
  docsResourceSections,
  docsSections,
  getActiveDocsSection,
} from '../lib/docs-sections'
import { normalizeDocsPath, resolveSidebarItems, type SidebarNode } from '../lib/docs-sidebar'
import { docsProductIcons } from './DocsHomeProductIcon'
import { DocsLockup } from './DocsLockup'
import {
  docsHeaderMenuButton,
  docsHeaderWordmark,
  docsMenuDrawerDivider,
  docsMenuDrawerFooter,
  docsMenuDrawerPopup,
  docsMenuDrawerSearch,
  docsMenuDrawerTheme,
  docsMenuDrawerTitle,
} from './DocsNavigation.styles'
import { RouterLink } from './RouterLink'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const sectionIcons: Partial<Record<DocsSection['id'], Icon>> = {
  overview: CompassIcon,
  accounts: docsProductIcons.accounts,
  earn: docsProductIcons.earn,
  routes: docsProductIcons.routes,
  zones: docsProductIcons.zones,
  'machine-payments': docsProductIcons.agents,
  developers: docsProductIcons.network,
  resources: BookOpenIcon,
  ecosystem: HandshakeIcon,
  tools: TerminalIcon,
}

function isExternal(href: string) {
  return !href.startsWith('/') && !href.startsWith('#')
}

function isCurrentPage(pathname: string, link: string) {
  const target = normalizeDocsPath(link.split('#')[0]?.split('?')[0] || '/').replace(/\/+$/, '')
  return normalizeDocsPath(pathname).replace(/\/+$/, '') === (target || '/')
}

function containsCurrentPage(node: SidebarNode, pathname: string): boolean {
  if (node.link && !isExternal(node.link) && isCurrentPage(pathname, node.link)) return true
  return Boolean(node.items?.some((child) => containsCurrentPage(child, pathname)))
}

function SectionItem({ section, current }: { section: DocsSection; current: boolean }) {
  const Icon = sectionIcons[section.id]
  return (
    <SidebarMenu.Item active={current} render={<RouterLink to={section.href} />}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {section.label}
    </SidebarMenu.Item>
  )
}

function PageItem({ node, pathname }: { node: SidebarNode; pathname: string }) {
  const link = node.link ?? '#'
  if (isExternal(link))
    return (
      <SidebarMenu.Item href={link} target="_blank" rel="noopener noreferrer">
        {node.text}
        <ArrowUpRightIcon aria-hidden="true" />
      </SidebarMenu.Item>
    )
  return (
    <SidebarMenu.Item active={isCurrentPage(pathname, link)} render={<RouterLink to={link} />}>
      {node.text}
    </SidebarMenu.Item>
  )
}

/**
 * The section's sidebar as DS SidebarMenu parts: labelled groups, page items, and submenus for
 * collapsible entries. A submenu's trigger only toggles, so an entry with its own page lists it
 * first as Overview.
 */
function SectionPages({ nodes, pathname }: { nodes: SidebarNode[]; pathname: string }) {
  return nodes.map((node, index) => {
    const key = `${node.text ?? node.link ?? 'node'}-${index}`
    if (!node.items?.length) return <PageItem key={key} node={node} pathname={pathname} />
    const overview = node.link ? (
      <PageItem node={{ text: 'Overview', link: node.link }} pathname={pathname} />
    ) : null
    if (node.collapsed === undefined)
      return (
        <SidebarMenu.Group key={key} aria-label={node.text ? undefined : 'Pages'}>
          {node.text ? <SidebarMenu.GroupLabel>{node.text}</SidebarMenu.GroupLabel> : null}
          {overview}
          <SectionPages nodes={node.items} pathname={pathname} />
        </SidebarMenu.Group>
      )
    return (
      <SidebarMenu.Submenu
        key={key}
        defaultOpen={!node.collapsed || containsCurrentPage(node, pathname)}
      >
        <SidebarMenu.SubmenuTrigger>{node.text}</SidebarMenu.SubmenuTrigger>
        <SidebarMenu.SubmenuPanel>
          {overview}
          <SectionPages nodes={node.items} pathname={pathname} />
        </SidebarMenu.SubmenuPanel>
      </SidebarMenu.Submenu>
    )
  })
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
    <label className={`docs-menu-theme ${docsMenuDrawerTheme().className}`}>
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

/**
 * The menu below 1200px, where the products leave the top bar: a DS Drawer with the products,
 * Resources, then the current section's pages, Get API key and the theme.
 */
export default function DocsMenuDrawer({
  pathname,
  consoleHref,
  consoleLabel,
  consoleTitle,
  disabled,
  onSearch,
}: {
  pathname: string
  consoleHref: string
  consoleLabel: string
  consoleTitle?: string
  disabled?: boolean
  onSearch: () => void
}) {
  const [open, setOpen] = useState(false)
  const config = useConfig()
  const active = getActiveDocsSection(pathname)
  const pages = pathname === '/' ? [] : resolveSidebarItems(config?.sidebar, pathname)

  // Close after navigation, including browser back and forward.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // A widened viewport shows the products in the bar, so it must not keep the drawer open.
  useEffect(() => {
    if (!open) return
    const wide = window.matchMedia('(min-width: 1200px)')
    const close = () => {
      if (wide.matches) setOpen(false)
    }
    close()
    wide.addEventListener('change', close)
    return () => wide.removeEventListener('change', close)
  }, [open])

  return (
    <span className={`docs-menu ${docsHeaderMenuButton().className}`}>
      <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="left">
        <Drawer.Trigger
          disabled={disabled}
          render={<Button variant="tertiary" size="small" shape="icon" aria-label="Open menu" />}
        >
          <MenuIcon aria-hidden="true" width="20" height="20" />
        </Drawer.Trigger>
        <Drawer.Popup closeButton className={`docs-menu-drawer ${docsMenuDrawerPopup().className}`}>
          <Drawer.Title
            aria-label="Tempo Developers menu"
            className={docsMenuDrawerTitle().className}
          >
            <DocsLockup className={docsHeaderWordmark().className} />
          </Drawer.Title>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              requestAnimationFrame(onSearch)
            }}
            className={docsMenuDrawerSearch().className}
          >
            <SearchIcon aria-hidden="true" width="16" height="16" />
            Search docs
          </button>
          <SidebarMenu.Root size="small" aria-label="Products">
            <SidebarMenu.Group aria-label="Products">
              {docsSections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  current={active?.id === section.id}
                />
              ))}
            </SidebarMenu.Group>
            <SidebarMenu.Group>
              <SidebarMenu.GroupLabel>Resources</SidebarMenu.GroupLabel>
              {docsResourceSections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  current={active?.id === section.id}
                />
              ))}
            </SidebarMenu.Group>
          </SidebarMenu.Root>
          {pages.length > 0 ? (
            <>
              <hr className={docsMenuDrawerDivider().className} />
              <SidebarMenu.Root size="small" aria-label={`${active?.label ?? 'Section'} pages`}>
                <SectionPages nodes={pages} pathname={pathname} />
              </SidebarMenu.Root>
            </>
          ) : null}
          <div className={docsMenuDrawerFooter().className}>
            {/* Absolute: the docs are also mounted at tempo.xyz/developers, where relative links miss the console. */}
            <Button.Link href={consoleHref} variant="primary" size="medium" title={consoleTitle}>
              {consoleLabel}
            </Button.Link>
            <ThemeSelect />
          </div>
        </Drawer.Popup>
      </Drawer.Root>
    </span>
  )
}

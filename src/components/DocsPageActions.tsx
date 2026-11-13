'use client'

import { Breadcrumbs, Button, Menu, SplitButton } from '@tempoxyz/ds'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useConfig } from 'vocs'
import BotIcon from '~icons/lucide/bot'
import CheckIcon from '~icons/lucide/check'
import CopyIcon from '~icons/lucide/copy'
import FileTextIcon from '~icons/lucide/file-text'
import SparklesIcon from '~icons/lucide/sparkles'
import GitHubIcon from '~icons/simple-icons/github'
import { getActiveDocsSection } from '../lib/docs-sections'
import { normalizeDocsPath, resolveSidebarItems, type SidebarNode } from '../lib/docs-sidebar'
import { publicAssetPath } from '../lib/public-asset-path'
import { usePathname } from './DocsHeader'
import * as ui from './DocsPageActions.recipes'
import { docsPageActions, docsPageHeader } from './DocsPageActions.styles'
import { RouterLink } from './RouterLink'

type CopyState = 'idle' | 'copied' | 'error'

/**
 * The sidebar label of the current page, for the breadcrumb's last item. A generic "Overview"
 * takes its group's name instead, such as Earn API.
 */
function activePageLabel(
  nodes: SidebarNode[],
  pathname: string,
  group?: string,
): string | undefined {
  for (const node of nodes) {
    const link = node.link?.split('#')[0]
    if (link?.startsWith('/') && normalizeDocsPath(link).replace(/\/+$/, '') === pathname)
      return node.text === 'Overview' && group ? group : node.text
    const child = activePageLabel(node.items ?? [], pathname, node.text)
    if (child) return child
  }
}

/** Below Tablet the actions keep only their icons, so the header row stays one line. */
function useCompact() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(width < 768px)')
    const update = () => setCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return compact
}

/** Ask AI: opens this page in ChatGPT or Claude. ⌘I toggles it, in place of Vocs' docked field. */
function AskAiMenu({ pathname, compact }: { pathname: string; compact: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Capture runs before Vocs' own window listener, whose field is hidden (see globals.ts).
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'i') return
      event.preventDefault()
      event.stopImmediatePropagation()
      setOpen((value) => !value)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  const providers = useMemo(() => {
    if (typeof window === 'undefined') return []
    const pageUrl = `${window.location.origin}${pathname}`
    const query = encodeURIComponent(
      `Please research and analyze this page: ${pageUrl} so I can ask you questions about it. Once you have read it, prompt me with any questions I have. Do not post content from the page in your response. Any of my follow up questions must reference the site I gave you.`,
    )
    return [
      { name: 'Ask ChatGPT', href: `https://chatgpt.com?hints=search&q=${query}` },
      { name: 'Ask Claude', href: `https://claude.ai/new?q=${query}` },
    ]
  }, [pathname])

  return (
    <Menu.Root open={open} onOpenChange={setOpen}>
      <Menu.Trigger
        render={
          <Button
            variant="secondary"
            size="small"
            shape={compact ? 'icon' : undefined}
            aria-label={compact ? 'Ask AI' : undefined}
          />
        }
      >
        <SparklesIcon aria-hidden="true" width="16" height="16" />
        {compact ? null : 'Ask AI'}
      </Menu.Trigger>
      <Menu.Popup align="end">
        {providers.map((provider) => (
          <Menu.LinkItem
            key={provider.name}
            href={provider.href}
            target="_blank"
            rel="noopener noreferrer"
            closeOnClick
          >
            {provider.name}
          </Menu.LinkItem>
        ))}
      </Menu.Popup>
    </Menu.Root>
  )
}

/**
 * The page's header row, above the H1, including after client navigation: the Section / Page
 * breadcrumb, Ask AI, and Copy page with its menu (View as Markdown, Connect your agent).
 */
export default function DocsPageActions({ openApi = false }: { openApi?: boolean }) {
  const pathname = usePathname()
  const config = useConfig()
  const compact = useCompact()
  const isApiArticle = pathname === '/docs/api' || pathname.startsWith('/docs/api/')
  const isDocsArticle =
    (pathname.startsWith('/docs/') ||
      pathname === '/get-started' ||
      pathname.startsWith('/get-started/')) &&
    openApi === isApiArticle
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [state, setState] = useState<CopyState>('idle')
  const marker = useRef<HTMLSpanElement>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markdownPath = publicAssetPath(`/assets/md${pathname.replace(/\/$/, '')}.md`)
  const section = getActiveDocsSection(pathname)
  const current = normalizeDocsPath(pathname).replace(/\/+$/, '') || '/'
  const pageLabel = activePageLabel(resolveSidebarItems(config?.sidebar, pathname), current)

  useEffect(() => {
    setState('idle')
    if (!isDocsArticle) return
    const article = marker.current?.closest('article[data-v-content]')
    const observedRoot = openApi ? document.body : article
    if (!observedRoot) return
    let element: HTMLElement | null = null
    const attach = () => {
      if (!marker.current?.isConnected) return
      // Vocs' OpenAPI renderer bypasses the MDX wrapper. Target only its page
      // container with an H1, never a standalone playground in another guide.
      const content = openApi
        ? document.querySelector(
            'article[data-v-content] > [data-v-openapi]:has(h1), article[data-v-content] > [data-v-openapi-guide]:has(h1)',
          )
        : article
      const heading = content?.querySelector('h1')
      if (!content || !heading || content.querySelector('.tempo-docs-home')) return
      // The row spans the content column, so it goes before the H1's top-level block, such as a
      // product hero that sets the H1 beside an illustration.
      let anchor: Element = heading
      while (anchor.parentElement && anchor.parentElement !== content) anchor = anchor.parentElement
      if (element?.isConnected && element.nextElementSibling === anchor) return
      element?.remove()
      element = document.createElement('div')
      element.className = 'docs-page-header-host'
      anchor.before(element)
      setHost(element)
    }
    attach()
    const observer = new MutationObserver(attach)
    observer.observe(observedRoot, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      element?.remove()
      setHost(null)
    }
  }, [pathname, isDocsArticle, openApi])

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    [],
  )

  const copyPage = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
    try {
      const response = await fetch(markdownPath)
      if (!response.ok) throw new Error('Could not load page Markdown')
      const markdown = await response.text()
      if (/^\s*<!doctype html/i.test(markdown)) throw new Error('Markdown unavailable')
      await navigator.clipboard.writeText(markdown)
      setState('copied')
      resetTimer.current = setTimeout(() => setState('idle'), 1200)
    } catch {
      setState('error')
    }
  }

  if (!isDocsArticle) return null

  return (
    <>
      <span ref={marker} hidden />
      {host &&
        createPortal(
          <div className={`docs-page-header ${docsPageHeader().className}`}>
            <Breadcrumbs>
              {section ? (
                <Breadcrumbs.Item current={!pageLabel} render={<RouterLink to={section.href} />}>
                  {section.label}
                </Breadcrumbs.Item>
              ) : null}
              {pageLabel ? <Breadcrumbs.Item current>{pageLabel}</Breadcrumbs.Item> : null}
            </Breadcrumbs>
            <div className={`docs-page-actions ${docsPageActions().className}`}>
              <AskAiMenu pathname={pathname} compact={compact} />
              <SplitButton.Root aria-label="Copy page" variant="secondary" size="small">
                <SplitButton.Action
                  onClick={copyPage}
                  aria-label={compact ? 'Copy page' : undefined}
                >
                  {state === 'copied' ? (
                    <CheckIcon aria-hidden="true" width="16" height="16" />
                  ) : (
                    <CopyIcon aria-hidden="true" width="16" height="16" />
                  )}
                  {compact ? null : 'Copy page'}
                </SplitButton.Action>
                <Menu.Root>
                  <SplitButton.Trigger aria-label="More page options" />
                  <Menu.Popup align="end">
                    <Menu.LinkItem
                      href={markdownPath}
                      target="_blank"
                      rel="noreferrer"
                      closeOnClick
                    >
                      <FileTextIcon aria-hidden="true" width="16" height="16" />
                      View as Markdown
                    </Menu.LinkItem>
                    <Menu.LinkItem
                      closeOnClick
                      render={<RouterLink to="/docs/guide/using-tempo-with-ai" />}
                    >
                      <BotIcon aria-hidden="true" width="16" height="16" />
                      Connect your agent
                    </Menu.LinkItem>
                    {pathname.replace(/\/$/, '') === '/docs/earn' && (
                      <Menu.LinkItem
                        href="https://github.com/tempoxyz/earn"
                        target="_blank"
                        rel="noreferrer"
                        closeOnClick
                      >
                        <GitHubIcon aria-hidden="true" width="16" height="16" />
                        View Earn on GitHub
                      </Menu.LinkItem>
                    )}
                  </Menu.Popup>
                </Menu.Root>
              </SplitButton.Root>
              <span role="status" className={ui.docsPageActionsText().className}>
                {state === 'error'
                  ? 'Could not copy. Open View as Markdown to select the page text.'
                  : state === 'copied'
                    ? 'Page Markdown copied to clipboard.'
                    : ''}
              </span>
            </div>
          </div>,
          host,
        )}
    </>
  )
}

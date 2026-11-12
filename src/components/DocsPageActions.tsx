'use client'

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'waku'
import BotIcon from '~icons/lucide/bot'
import CheckIcon from '~icons/lucide/check'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import CopyIcon from '~icons/lucide/copy'
import FileTextIcon from '~icons/lucide/file-text'
import GitHubIcon from '~icons/simple-icons/github'
import { publicAssetPath } from '../lib/public-asset-path'
import { CopyButton, type CopyButtonState } from './CopyButton'
import { CopyIconSwap } from './CopyIconSwap'
import { usePathname } from './DocsHeader'
import * as ui from './DocsPageActions.recipes'
import {
  docsPageActions,
  docsPageActionsMenu,
  docsPageActionsSplit,
} from './DocsPageActions.styles'

/** One Copy page split button on the H1's row, including after client navigation. */
export default function DocsPageActions({ openApi = false }: { openApi?: boolean }) {
  const pathname = usePathname()
  const isApiArticle = pathname === '/docs/api' || pathname.startsWith('/docs/api/')
  const isDocsArticle =
    (pathname.startsWith('/docs/') ||
      pathname === '/get-started' ||
      pathname.startsWith('/get-started/')) &&
    openApi === isApiArticle
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [state, setState] = useState<CopyButtonState>('idle')
  const [open, setOpen] = useState(false)
  const marker = useRef<HTMLSpanElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const copyButton = useRef<HTMLButtonElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const markdownPath = publicAssetPath(`/assets/md${pathname.replace(/\/$/, '')}.md`)

  useEffect(() => {
    setState('idle')
    setOpen(false)
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
      if (!heading || content?.querySelector('.tempo-docs-home')) return
      // The host floats at the end of the H1's first line, so it sits just before the H1.
      if (element?.isConnected && element.nextElementSibling === heading) return
      element?.remove()
      element = document.createElement('div')
      element.className = 'docs-page-actions-host'
      heading.before(element)
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

  // The menu closes on an outside press or Escape, which returns focus to its trigger.
  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const loadMarkdown = async () => {
    const response = await fetch(markdownPath)
    if (!response.ok) throw new Error('Could not load page Markdown')
    const markdown = await response.text()
    if (/^\s*<!doctype html/i.test(markdown)) throw new Error('Markdown unavailable')
    return markdown
  }

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const index = items.indexOf(document.activeElement as HTMLElement)
    const next =
      event.key === 'ArrowDown'
        ? items[(index + 1) % items.length]
        : event.key === 'ArrowUp'
          ? items[(index - 1 + items.length) % items.length]
          : event.key === 'Home'
            ? items[0]
            : event.key === 'End'
              ? items[items.length - 1]
              : undefined
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  const close = () => setOpen(false)

  if (!isDocsArticle) return null

  return (
    <>
      <span ref={marker} hidden />
      {host &&
        createPortal(
          <div ref={root} className={`docs-page-actions ${docsPageActions().className}`}>
            <div className={docsPageActionsSplit().className}>
              <CopyButton
                key={pathname}
                ref={copyButton}
                text={loadMarkdown}
                label="Copy page"
                icon={
                  <CopyIconSwap
                    copied={state === 'copied'}
                    copyIcon={<CopyIcon width="16" height="16" />}
                    checkIcon={<CheckIcon width="16" height="16" />}
                  />
                }
                resetAfter={1200}
                onStateChange={setState}
              />
              <button
                ref={trigger}
                type="button"
                aria-label="More page options"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => setOpen((value) => !value)}
              >
                <ChevronDownIcon aria-hidden="true" width="16" height="16" />
              </button>
            </div>
            {open && (
              <div
                ref={menu}
                id={menuId}
                role="menu"
                aria-label="Page options"
                className={docsPageActionsMenu().className}
                onKeyDown={moveFocus}
              >
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    close()
                    copyButton.current?.click()
                  }}
                >
                  <CopyIcon aria-hidden="true" width="16" height="16" />
                  Copy page
                </button>
                <a
                  href={markdownPath}
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={close}
                >
                  <FileTextIcon aria-hidden="true" width="16" height="16" />
                  View as Markdown
                </a>
                <Link
                  to="/docs/guide/using-tempo-with-ai"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={close}
                >
                  <BotIcon aria-hidden="true" width="16" height="16" />
                  Connect your agent
                </Link>
                {pathname.replace(/\/$/, '') === '/docs/earn' && (
                  <a
                    href="https://github.com/tempoxyz/earn"
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={close}
                  >
                    <GitHubIcon aria-hidden="true" width="16" height="16" />
                    View Earn on GitHub
                  </a>
                )}
              </div>
            )}
            <span role="status" className={ui.docsPageActionsText().className}>
              {state === 'error'
                ? 'Could not copy. Open View as Markdown to select the page text.'
                : state === 'copied'
                  ? 'Page Markdown copied to clipboard.'
                  : ''}
            </span>
          </div>,
          host,
        )}
    </>
  )
}

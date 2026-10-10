'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'waku'
import CheckIcon from '~icons/lucide/check'
import CopyIcon from '~icons/lucide/copy'
import DownloadIcon from '~icons/lucide/download'
import ExternalLinkIcon from '~icons/lucide/external-link'
import { publicAssetPath } from '../lib/public-asset-path'
import { CopyIconSwap } from './CopyIconSwap'
import { usePathname } from './DocsHeader'
import * as ui from './DocsPageActions.recipes'
import { docsPageActions, docsPageActionsError } from './DocsPageActions.styles'

/** Place page tools after the article introduction, including after client navigation. */
export default function DocsPageActions({ openApi = false }: { openApi?: boolean }) {
  const pathname = usePathname()
  const isApiArticle = pathname === '/docs/api' || pathname.startsWith('/docs/api/')
  const isDocsArticle =
    (pathname.startsWith('/docs/') ||
      pathname === '/get-started' ||
      pathname.startsWith('/get-started/')) &&
    openApi === isApiArticle
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const request = useRef(0)
  const marker = useRef<HTMLSpanElement>(null)
  const markdownPath = publicAssetPath(`/assets/md${pathname.replace(/\/$/, '')}.md`)

  useEffect(() => {
    setState('idle')
    request.current += 1
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
      const introduction =
        heading.closest('.docs-product-overview, [data-v-openapi-header]') ??
        (heading.nextElementSibling?.matches('p') ? heading.nextElementSibling : heading)
      if (element?.isConnected && element.previousElementSibling === introduction) return
      element?.remove()
      element = document.createElement('div')
      element.className = 'docs-page-actions-host'
      introduction.after(element)
      setHost(element)
    }
    attach()
    const observer = new MutationObserver(attach)
    observer.observe(observedRoot, { childList: true, subtree: true })
    return () => {
      request.current += 1
      observer.disconnect()
      element?.remove()
      setHost(null)
    }
  }, [pathname, isDocsArticle, openApi])

  // Like every copy control, the confirmation exits after a short hold.
  useEffect(() => {
    if (state !== 'copied') return
    const timer = window.setTimeout(() => setState('idle'), 1200)
    return () => window.clearTimeout(timer)
  }, [state])

  const copyPage = async () => {
    const currentRequest = ++request.current
    setState('copying')
    try {
      const response = await fetch(markdownPath)
      if (!response.ok) throw new Error('Could not load page Markdown')
      const markdown = await response.text()
      if (/^\s*<!doctype html/i.test(markdown)) throw new Error('Markdown unavailable')
      await navigator.clipboard.writeText(markdown)
      if (currentRequest === request.current) setState('copied')
    } catch {
      if (currentRequest === request.current) setState('error')
    }
  }

  if (!isDocsArticle) return null

  return (
    <>
      <span ref={marker} hidden />
      {host &&
        createPortal(
          <nav
            aria-label="Page tools"
            className={`docs-page-actions ${docsPageActions().className}`}
          >
            <button type="button" onClick={copyPage} disabled={state === 'copying'}>
              <CopyIconSwap
                copied={state === 'copied'}
                copyIcon={<CopyIcon width="14" height="14" />}
                checkIcon={<CheckIcon width="14" height="14" />}
              />
              {state === 'copied' ? 'Copied' : state === 'copying' ? 'Copying…' : 'Copy for agent'}
            </button>
            <a href={markdownPath} target="_blank" rel="noreferrer" title="View Markdown">
              <ExternalLinkIcon aria-hidden="true" width="14" height="14" />
              <span className="docs-page-action-label">View Markdown</span>
            </a>
            <Link
              to="/docs/guide/using-tempo-with-ai#install-tempo-plugins"
              title="Install agent tools"
            >
              <DownloadIcon aria-hidden="true" width="14" height="14" />
              <span className="docs-page-action-label">Install agent tools</span>
            </Link>
            <span
              role="status"
              className={
                state === 'error'
                  ? `docs-page-actions-error ${docsPageActionsError().className}`
                  : ui.docsPageActionsText().className
              }
            >
              {state === 'error'
                ? 'Could not copy. Open View Markdown to select the page text.'
                : state === 'copied'
                  ? 'Page Markdown copied to clipboard.'
                  : ''}
            </span>
          </nav>,
          host,
        )}
    </>
  )
}

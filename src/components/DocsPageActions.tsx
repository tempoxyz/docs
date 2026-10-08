'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'waku'
import CopyIcon from '~icons/lucide/copy'
import DownloadIcon from '~icons/lucide/download'
import ExternalLinkIcon from '~icons/lucide/external-link'
import { publicAssetPath } from '../lib/public-asset-path'
import { usePathname } from './DocsHeader'
import './DocsPageActions.css'

/** Place page tools after the article introduction, including after client navigation. */
export default function DocsPageActions() {
  const pathname = usePathname()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const request = useRef(0)
  const markdownPath = publicAssetPath(`/assets/md${pathname.replace(/\/$/, '')}.md`)

  useEffect(() => {
    setState('idle')
    request.current += 1
    if (pathname === '/' || pathname === '/docs') return
    let element: HTMLElement | null = null
    const attach = () => {
      const article = document.querySelector('article[data-v-content]')
      const heading = article?.querySelector('h1')
      if (!heading || article?.querySelector('.tempo-docs-home')) return
      const introduction =
        heading.closest('.docs-product-overview') ??
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
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      request.current += 1
      observer.disconnect()
      element?.remove()
      setHost(null)
    }
  }, [pathname])

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

  if (!host || pathname === '/' || pathname === '/docs') return null
  return createPortal(
    <nav aria-label="Page tools" className="docs-page-actions">
      <button type="button" onClick={copyPage} disabled={state === 'copying'}>
        <CopyIcon aria-hidden="true" width="14" height="14" />
        {state === 'copied' ? 'Copied' : state === 'copying' ? 'Copying…' : 'Copy for agent'}
      </button>
      <a href={markdownPath} target="_blank" rel="noreferrer">
        <ExternalLinkIcon aria-hidden="true" width="14" height="14" /> View Markdown
      </a>
      <Link to="/docs/guide/using-tempo-with-ai#install-tempo-plugins">
        <DownloadIcon aria-hidden="true" width="14" height="14" /> Install agent tools
      </Link>
      <span role="status" className={state === 'error' ? 'docs-page-actions-error' : 'sr-only'}>
        {state === 'error'
          ? 'Could not copy. Open View Markdown to select the page text.'
          : state === 'copied'
            ? 'Page Markdown copied to clipboard.'
            : ''}
      </span>
    </nav>,
    host,
  )
}

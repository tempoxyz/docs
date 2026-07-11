'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'
import {
  markPostHogReady,
  trackDocsCopyCode,
  trackDocsCtaClick,
  trackDocsSearchResultClick,
} from '../lib/posthog'
import { classifyStrategicCta, sanitizePostHogCapture } from '../lib/posthog-analytics'

const POSTHOG_UI_HOST = 'https://us.posthog.com'

function eventTargetElement(event: Event) {
  return event.target instanceof Element ? event.target : null
}

function codeLanguage(button: HTMLButtonElement) {
  const container = button.closest('pre') ?? button.parentElement
  const code = container?.querySelector('code')
  const explicit = code?.getAttribute('data-language') ?? container?.getAttribute('data-language')
  if (explicit) return explicit.toLowerCase().slice(0, 32)

  const languageClass = [...(code?.classList ?? [])].find((name) => name.startsWith('language-'))
  return languageClass?.slice('language-'.length, 32).toLowerCase()
}

function copyMetadata(button: HTMLButtonElement) {
  const label = button.getAttribute('aria-label')?.toLowerCase() ?? ''
  const isAgentInstall = label.startsWith('copy tempo')
  const isShell = button.hasAttribute('data-v-shell-copy') || label.includes('command')
  const isOpenApiCopy =
    button.hasAttribute('data-v-openapi-action') &&
    (label.includes('copy') || button.textContent?.trim().toLowerCase() === 'copy')
  const isCodeCopy = label === 'copy code'

  if (!isAgentInstall && !isShell && !isOpenApiCopy && !isCodeCopy) return null

  return {
    copyType: isAgentInstall || isShell ? ('command' as const) : ('code' as const),
    copySource: isAgentInstall
      ? 'agent_install'
      : isShell
        ? 'shell'
        : isOpenApiCopy
          ? 'openapi'
          : 'code_block',
    language: codeLanguage(button),
  }
}

function findVocsSearchInput() {
  return document.querySelector<HTMLInputElement>(
    '[role="combobox"][aria-controls="search-results"]',
  )
}

function vocsSearchResultMetadata(anchor: HTMLAnchorElement) {
  const results = anchor.closest('#search-results')
  if (!results) return null

  const options = [...results.querySelectorAll<HTMLElement>('[role="option"]')]
  const option = anchor.closest<HTMLElement>('[role="option"]')
  const rank = option ? options.indexOf(option) + 1 : 0
  const url = new URL(anchor.href, window.location.origin)
  return {
    queryLength: findVocsSearchInput()?.value.trim().length ?? 0,
    resultPath: url.pathname,
    resultRank: Math.max(rank, 0),
    resultType: url.hash ? 'section' : 'page',
  }
}

function PostHogInitializer({ site }: { site: string }) {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    if (!posthogKey) return

    const registerHumanContext = () => {
      posthog.register({ site, traffic_type: 'human' })
      markPostHogReady()
    }

    if (posthog.__loaded) {
      registerHumanContext()
    } else {
      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: POSTHOG_UI_HOST,
        defaults: '2026-05-30',
        capture_pageview: 'history_change',
        capture_pageleave: 'if_capture_pageview',
        enable_heatmaps: true,
        capture_dead_clicks: true,
        cross_subdomain_cookie: true,
        secure_cookie: true,
        person_profiles: 'identified_only',
        autocapture: {
          dom_event_allowlist: ['click', 'submit'],
          element_allowlist: ['a', 'button', 'form'],
          css_selector_ignorelist: [
            '.ph-no-capture',
            '[data-ph-no-autocapture]',
            '[data-ph-sensitive]',
            'input',
            'textarea',
            'select',
            '[contenteditable="true"]',
          ],
          element_attribute_ignorelist: [
            'value',
            'data-value',
            'data-secret',
            'data-private',
            'aria-valuetext',
          ],
          capture_copied_text: false,
        },
        mask_all_text: true,
        session_recording: {
          maskAllInputs: true,
        },
        enable_recording_console_log: false,
        before_send: sanitizePostHogCapture,
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
        loaded: registerHumanContext,
      })
    }

    let lastSearchSelection = ''
    let lastSearchSelectionAt = 0

    const captureSearchResult = (anchor: HTMLAnchorElement) => {
      const metadata = vocsSearchResultMetadata(anchor)
      if (!metadata) return false

      const selectionKey = `${metadata.resultPath}:${metadata.resultRank}`
      const now = Date.now()
      if (selectionKey === lastSearchSelection && now - lastSearchSelectionAt < 500) return true

      lastSearchSelection = selectionKey
      lastSearchSelectionAt = now
      trackDocsSearchResultClick(metadata)
      return true
    }

    const handleClick = (event: MouseEvent) => {
      const target = eventTargetElement(event)
      if (!target) return

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (anchor) {
        if (captureSearchResult(anchor)) return

        const cta = classifyStrategicCta(anchor.href, window.location.pathname)
        if (cta) trackDocsCtaClick(cta)
      }

      const button = target.closest<HTMLButtonElement>('button')
      if (!button) return
      const metadata = copyMetadata(button)
      if (metadata) trackDocsCopyCode(metadata)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      const target = eventTargetElement(event)
      if (!(target instanceof HTMLInputElement)) return
      if (target.getAttribute('aria-controls') !== 'search-results') return

      const results = document.getElementById('search-results')
      const option = results?.querySelector<HTMLElement>(
        '[role="option"][aria-selected="true"], [role="option"][data-selected="true"], [role="option"]',
      )
      const anchor =
        option instanceof HTMLAnchorElement
          ? option
          : option?.querySelector<HTMLAnchorElement>('a[href]')
      if (anchor) captureSearchResult(anchor)
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [site])

  return null
}

export default function PostHogSetup({ site = 'docs' }: { site?: string }) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return null
  return <PostHogInitializer site={site} />
}

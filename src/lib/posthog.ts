'use client'

import posthog from 'posthog-js'
import {
  classifyAnalyticsPage,
  getAnalyticsPageSection,
  normalizeAnalyticsPath,
  sanitizeAnalyticsUrl,
} from './posthog-analytics'

export const POSTHOG_EVENTS = {
  PAGE_VIEW: 'docs_page_view',
  INTERNAL_LINK_CLICK: 'docs_internal_link_click',
  EXTERNAL_LINK_CLICK: 'docs_external_link_click',
  NAVIGATION_LINK_CLICK: 'docs_navigation_link_click',
  BUTTON_CLICK: 'docs_button_click',
  CTA_CLICK: 'docs_cta_click',
  COPY_CODE: 'docs_copy_code',
  DEMO_START: 'docs_demo_start',
  DEMO_STEP_COMPLETE: 'docs_demo_step_complete',
  DEMO_SOURCE_CLICK: 'docs_demo_source_click',
  SEARCH_OPENED: 'docs_search_opened',
  SEARCH_RESULT_CLICK: 'docs_search_result_click',
  CODE_EXAMPLE_VIEW: 'docs_code_example_view',
  CODE_EXAMPLE_COPY: 'docs_code_example_copy',
  FEEDBACK_SUBMITTED: 'docs_feedback_submitted',
  FEEDBACK_HELPFUL: 'docs_feedback_helpful',
  FEEDBACK_NOT_HELPFUL: 'docs_feedback_not_helpful',
} as const

export const POSTHOG_PROPERTIES = {
  SITE: 'site',
  PAGE_PATH: 'page_path',
  PAGE_TYPE: 'page_type',
  PAGE_SECTION: 'page_section',
  PAGE_TITLE: 'page_title',
  LINK_URL: 'link_url',
  LINK_TEXT: 'link_text',
  BUTTON_TEXT: 'button_text',
  BUTTON_VARIANT: 'button_variant',
  EXTERNAL_DOMAIN: 'external_domain',
  CODE_LANGUAGE: 'code_language',
  COPY_TYPE: 'copy_type',
  COPY_SOURCE: 'copy_source',
  DEMO_NAME: 'demo_name',
  DEMO_STEP: 'demo_step',
  DEMO_STEP_NAME: 'demo_step_name',
  QUERY_LENGTH: 'query_length',
  RESULT_PATH: 'result_path',
  RESULT_RANK: 'result_rank',
  RESULT_TYPE: 'result_type',
  SEARCH_SOURCE: 'search_source',
  FEEDBACK_HELPFUL: 'feedback_helpful',
  FEEDBACK_CATEGORY: 'feedback_category',
  FEEDBACK_PAGE_URL: 'feedback_page_url',
} as const

type EventProperties = Record<string, unknown>
type PendingEvent = { event: string; properties: EventProperties }

const pendingEvents: PendingEvent[] = []
const maxPendingEvents = 50
let posthogReady = false

function currentPageContext(): EventProperties {
  if (typeof window === 'undefined') return {}

  const pagePath = normalizeAnalyticsPath(window.location.pathname)
  return {
    [POSTHOG_PROPERTIES.PAGE_PATH]: pagePath,
    [POSTHOG_PROPERTIES.PAGE_TYPE]: classifyAnalyticsPage(pagePath),
    [POSTHOG_PROPERTIES.PAGE_SECTION]: getAnalyticsPageSection(pagePath),
    [POSTHOG_PROPERTIES.PAGE_TITLE]: typeof document === 'undefined' ? undefined : document.title,
  }
}

export function captureDocsEvent(event: string, properties: EventProperties = {}) {
  if (typeof window === 'undefined') return

  const payload = { ...currentPageContext(), ...properties }
  if (posthogReady && posthog.__loaded) {
    posthog.capture(event, payload)
    return
  }

  if (pendingEvents.length >= maxPendingEvents) pendingEvents.shift()
  pendingEvents.push({ event, properties: payload })
}

/** Called after PostHog has registered the human site context. */
export function markPostHogReady() {
  posthogReady = true
  for (const pending of pendingEvents.splice(0)) {
    posthog.capture(pending.event, pending.properties)
  }
}

export function trackDocsSearchOpened(source: 'header' | 'keyboard' | 'marketing') {
  captureDocsEvent(POSTHOG_EVENTS.SEARCH_OPENED, {
    [POSTHOG_PROPERTIES.SEARCH_SOURCE]: source,
  })
}

export function trackDocsSearchResultClick(properties: {
  queryLength: number
  resultPath: string
  resultRank: number
  resultType: string
}) {
  captureDocsEvent(POSTHOG_EVENTS.SEARCH_RESULT_CLICK, {
    [POSTHOG_PROPERTIES.QUERY_LENGTH]: Math.max(0, properties.queryLength),
    [POSTHOG_PROPERTIES.RESULT_PATH]: normalizeAnalyticsPath(properties.resultPath),
    [POSTHOG_PROPERTIES.RESULT_RANK]: properties.resultRank,
    [POSTHOG_PROPERTIES.RESULT_TYPE]: properties.resultType,
  })
}

export function trackDocsCopyCode(properties: {
  copyType: 'code' | 'command'
  copySource: string
  language?: string | undefined
}) {
  captureDocsEvent(POSTHOG_EVENTS.COPY_CODE, {
    [POSTHOG_PROPERTIES.COPY_TYPE]: properties.copyType,
    [POSTHOG_PROPERTIES.COPY_SOURCE]: properties.copySource,
    [POSTHOG_PROPERTIES.CODE_LANGUAGE]: properties.language,
  })
}

export function trackDocsCtaClick(properties: {
  ctaId: string
  destinationCategory: string
  conversionIntent?: string | undefined
}) {
  captureDocsEvent(POSTHOG_EVENTS.CTA_CLICK, {
    cta_id: properties.ctaId,
    destination_category: properties.destinationCategory,
    conversion_intent: properties.conversionIntent,
  })
}

function safeLinkLabel(value?: string) {
  return value?.trim().slice(0, 80) || undefined
}

export function usePostHogTracking() {
  return {
    posthog,
    trackPageView: (path: string, title?: string) => {
      captureDocsEvent(POSTHOG_EVENTS.PAGE_VIEW, {
        [POSTHOG_PROPERTIES.PAGE_PATH]: normalizeAnalyticsPath(path),
        [POSTHOG_PROPERTIES.PAGE_TITLE]: title || document.title,
      })
    },

    trackInternalLinkClick: (url: string, linkText?: string) => {
      captureDocsEvent(POSTHOG_EVENTS.INTERNAL_LINK_CLICK, {
        [POSTHOG_PROPERTIES.LINK_URL]: sanitizeAnalyticsUrl(url),
        [POSTHOG_PROPERTIES.LINK_TEXT]: safeLinkLabel(linkText),
      })
    },

    trackExternalLinkClick: (url: string, linkText?: string) => {
      try {
        const parsedUrl = new URL(url)
        captureDocsEvent(POSTHOG_EVENTS.EXTERNAL_LINK_CLICK, {
          [POSTHOG_PROPERTIES.LINK_URL]: sanitizeAnalyticsUrl(url),
          [POSTHOG_PROPERTIES.LINK_TEXT]: safeLinkLabel(linkText),
          [POSTHOG_PROPERTIES.EXTERNAL_DOMAIN]: parsedUrl.hostname,
        })
      } catch {
        // Invalid URL, skip tracking.
      }
    },

    trackButtonClick: (
      buttonText: string,
      variant?: string,
      additionalProps?: Record<string, unknown>,
    ) => {
      captureDocsEvent(POSTHOG_EVENTS.BUTTON_CLICK, {
        [POSTHOG_PROPERTIES.BUTTON_TEXT]: safeLinkLabel(buttonText),
        [POSTHOG_PROPERTIES.BUTTON_VARIANT]: variant,
        ...additionalProps,
      })
    },

    trackCTAClick: (ctaText: string, destination?: string) => {
      captureDocsEvent(POSTHOG_EVENTS.CTA_CLICK, {
        [POSTHOG_PROPERTIES.BUTTON_TEXT]: safeLinkLabel(ctaText),
        [POSTHOG_PROPERTIES.LINK_URL]: destination ? sanitizeAnalyticsUrl(destination) : undefined,
      })
    },

    // The copied value is intentionally ignored. Code, commands, wallet
    // addresses, and transaction hashes must never be sent to PostHog.
    trackCopy: (type: 'code' | 'command', _content: string, language?: string) => {
      trackDocsCopyCode({
        copyType: type,
        copySource: 'interactive_demo',
        language,
      })
    },

    trackDemo: (
      action: 'start' | 'step_complete' | 'source_click',
      demoName?: string,
      step?: number,
      stepName?: string,
      sourceUrl?: string,
    ) => {
      const eventNameMap = {
        start: POSTHOG_EVENTS.DEMO_START,
        step_complete: POSTHOG_EVENTS.DEMO_STEP_COMPLETE,
        source_click: POSTHOG_EVENTS.DEMO_SOURCE_CLICK,
      }

      captureDocsEvent(eventNameMap[action], {
        [POSTHOG_PROPERTIES.DEMO_NAME]: demoName,
        [POSTHOG_PROPERTIES.DEMO_STEP]: step,
        [POSTHOG_PROPERTIES.DEMO_STEP_NAME]: stepName,
        [POSTHOG_PROPERTIES.LINK_URL]: sourceUrl ? sanitizeAnalyticsUrl(sourceUrl) : undefined,
      })
    },

    // Queries are reduced to length only. Search terms can contain secrets or
    // customer information and are intentionally not retained.
    trackSearch: (query: string, _resultTitle?: string, resultUrl?: string) => {
      if (resultUrl) {
        trackDocsSearchResultClick({
          queryLength: query.trim().length,
          resultPath: new URL(resultUrl, window.location.origin).pathname,
          resultRank: 0,
          resultType: 'unknown',
        })
      } else {
        trackDocsSearchOpened('header')
      }
    },
  }
}

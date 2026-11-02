'use client'

import { useEffect } from 'react'

const HOLD_MS = 1200

/** Hold the heading anchor's check for about 1.2s after Vocs copies the link.
 * Vocs marks a successful copy with data-copied; styles in styles/headingAnchors.ts. */
export function HeadingAnchorFeedback() {
  useEffect(() => {
    const timers = new Map<Element, number>()
    const observer = new MutationObserver((records) => {
      for (const { target } of records) {
        if (!(target instanceof HTMLElement) || target.dataset.copied !== 'true') continue
        window.clearTimeout(timers.get(target))
        target.dataset.tempoCopied = ''
        timers.set(
          target,
          window.setTimeout(() => {
            delete target.dataset.tempoCopied
            timers.delete(target)
          }, HOLD_MS),
        )
      }
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-copied'],
      subtree: true,
    })
    return () => {
      observer.disconnect()
      for (const timer of timers.values()) window.clearTimeout(timer)
    }
  }, [])

  return null
}

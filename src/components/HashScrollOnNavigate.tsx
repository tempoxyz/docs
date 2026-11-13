'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'waku'

const SETTLE_MS = 4000

function targetFor(hash: string) {
  const raw = hash.replace(/^#/, '')
  if (!raw) return null
  let id = raw
  try {
    id = decodeURIComponent(raw)
  } catch {}
  return document.getElementById(id) ?? document.getElementById(raw)
}

/**
 * Align the URL's heading after a client-side navigation to another page.
 *
 * Waku and Vocs scroll to the hash in the commit that changes the route, but a
 * docs page's content streams in after that commit. The heading is missing then,
 * so the router scrolls to the top and nothing retries. This waits for the
 * heading to mount, aligns it below the sticky header (scroll-padding-top), and
 * keeps it aligned while demos above it finish rendering. It stops at the first
 * user scroll input, on back/forward navigation, or after SETTLE_MS.
 */
export function HashScrollOnNavigate() {
  const { path, hash } = useRouter()
  const previousPath = useRef<string | null>(null)
  const popstate = useRef(false)

  useEffect(() => {
    const onPopstate = () => {
      popstate.current = true
    }
    window.addEventListener('popstate', onPopstate)
    return () => window.removeEventListener('popstate', onPopstate)
  }, [])

  useEffect(() => {
    const pathChanged = previousPath.current !== null && previousPath.current !== path
    previousPath.current = path
    const wasPopstate = popstate.current
    popstate.current = false
    // A full page load is handled by the browser, a same-page hash by Vocs, and
    // back/forward by Vocs' scroll restoration.
    if (!pathChanged || wasPopstate) return
    const currentHash = hash || window.location.hash
    if (!currentHash || currentHash === '#') return

    let done = false
    let frame = 0
    const align = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (done) return
        const target = targetFor(currentHash)
        if (!target) return
        const padding =
          Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
        const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
        if (Math.abs(target.getBoundingClientRect().top - padding - margin) > 1)
          target.scrollIntoView({ block: 'start', behavior: 'instant' })
      })
    }
    const stop = () => {
      if (done) return
      done = true
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      observer.disconnect()
      resizeObserver.disconnect()
      for (const event of userEvents) window.removeEventListener(event, stop)
    }

    const observer = new MutationObserver(align)
    observer.observe(document.body, { childList: true, subtree: true })
    const resizeObserver = new ResizeObserver(align)
    resizeObserver.observe(document.body)
    const userEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
    for (const event of userEvents) window.addEventListener(event, stop, { passive: true })
    const timer = setTimeout(stop, SETTLE_MS)
    align()

    return stop
  }, [path, hash])

  return null
}

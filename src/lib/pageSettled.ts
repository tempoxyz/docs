'use client'

import { useEffect, useState } from 'react'

const pageSettledDelayMs = 4_000

export function onPageSettled(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  let cancelled = false
  let timeoutId: number | undefined
  let idleId: number | undefined

  const run = () => {
    if (cancelled) return
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(callback, { timeout: 2_000 })
      return
    }
    callback()
  }

  const schedule = () => {
    timeoutId = window.setTimeout(run, pageSettledDelayMs)
  }

  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })

  return () => {
    cancelled = true
    window.removeEventListener('load', schedule)
    if (timeoutId) window.clearTimeout(timeoutId)
    if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
  }
}

export function usePageSettled() {
  const [settled, setSettled] = useState(false)

  useEffect(() => onPageSettled(() => setSettled(true)), [])

  return settled
}

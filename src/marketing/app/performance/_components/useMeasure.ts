'use client'

import { useEffect, useRef, useState } from 'react'

// Tracks the rendered width of a container so charts can draw at native pixel
// size (crisp text, pixel-perfect tooltips) instead of scaling a fixed viewBox.
export default function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { ref, width }
}

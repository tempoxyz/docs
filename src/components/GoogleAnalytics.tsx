'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function GoogleAnalyticsInit({ id }: { id: string }) {
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') return

    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      // biome-ignore lint/complexity/noArguments: gtag API requires arguments object
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', id)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)
  }, [id])

  return null
}

export default function GoogleAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (!id) return null
  return <GoogleAnalyticsInit id={id} />
}

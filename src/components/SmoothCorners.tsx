'use client'

import { useEffect } from 'react'

/**
 * Ari's 100% smoothing, reduced when the shortest side cannot fit the corner.
 * Ported from tempo.xyz SmoothCorners. Elements opt in by setting --corner-radius
 * (registered non-inheriting in styles/smoothCorners.ts); pills (>= 999px) keep
 * plain round ends. Native corner-shape where supported, an SVG clip otherwise.
 */
export function SmoothCorners() {
  useEffect(() => {
    const native = CSS.supports('corner-shape', 'superellipse(2)')
    const elements = new Set<HTMLElement>()
    const pending = new Set<HTMLElement>()
    let frame = 0

    function update(element: HTMLElement) {
      // Read the authored colors/background, not the SVG fallback's overrides.
      element.removeAttribute('data-smooth-corners')
      const style = getComputedStyle(element)
      const radius = Number.parseFloat(style.getPropertyValue('--corner-radius'))
      if (!(radius > 0) || radius >= 999) {
        restore(element)
        return
      }

      const extra = (axis: 'Width' | 'Height') => {
        if (style.boxSizing === 'border-box') return 0
        return axis === 'Width'
          ? Number.parseFloat(style.paddingLeft) +
              Number.parseFloat(style.paddingRight) +
              Number.parseFloat(style.borderLeftWidth) +
              Number.parseFloat(style.borderRightWidth)
          : Number.parseFloat(style.paddingTop) +
              Number.parseFloat(style.paddingBottom) +
              Number.parseFloat(style.borderTopWidth) +
              Number.parseFloat(style.borderBottomWidth)
      }
      // Layout dimensions, not getBoundingClientRect: artwork can be scaled.
      const width = Number.parseFloat(style.width) + extra('Width')
      const height = Number.parseFloat(style.height) + extra('Height')
      if (!(width > 0 && height > 0)) return
      const budget = Math.min(width, height) / 2
      const r = Math.min(radius, budget)
      const smoothing = Math.max(0, Math.min(1, budget / r - 1))
      const curvature = 1 + smoothing
      const cornerRadius = curvature * r

      if (native) {
        element.style.setProperty('--smooth-radius', `${cornerRadius}px`)
        element.style.setProperty('--smooth-shape', `superellipse(${curvature})`)
        element.dataset.smoothCorners = 'native'
        return
      }

      // A clip path would also cut the shadow, so shadowed surfaces (dialogs,
      // popovers) keep their plain CSS radius in the fallback.
      if (style.boxShadow !== 'none') {
        restore(element)
        return
      }

      const path = superellipse(width, height, cornerRadius, curvature)
      const borderWidth = Number.parseFloat(style.borderTopWidth)
      const borderColor = style.borderTopColor
      const background = style.backgroundImage
      // The fallback ring is inset, so use the foreground that contrasts with
      // the element's fill rather than the exterior outline color.
      const focusColor = style.color
      if (style.position === 'static') element.dataset.smoothStatic = ''
      const image = (d: string, color: string, stroke: number) =>
        `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}"/></svg>`,
        )}")`
      element.style.setProperty('--smooth-path', `path("${path}")`)
      element.style.setProperty('--smooth-background', background)
      element.style.setProperty('--smooth-border-width', `${borderWidth}px`)
      element.style.setProperty(
        '--smooth-border',
        borderWidth ? image(path, borderColor, borderWidth * 2) : 'none',
      )
      if (width > 8 && height > 8)
        element.style.setProperty(
          '--smooth-focus',
          image(
            superellipse(width, height, Math.max(0, cornerRadius - 3), curvature, 3),
            focusColor,
            2,
          ),
        )
      element.dataset.smoothCorners = 'svg'
    }

    function flush() {
      frame = 0
      for (const element of pending) if (element.isConnected) update(element)
      pending.clear()
      for (const element of elements) {
        if (element.isConnected) continue
        observer.unobserve(element)
        restore(element)
        elements.delete(element)
      }
    }

    function queue(element: HTMLElement) {
      pending.add(element)
      if (!frame) frame = requestAnimationFrame(flush)
    }

    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) queue(target as HTMLElement)
    })

    function discover(root: Element) {
      for (const element of [root, ...root.querySelectorAll('*')]) {
        if (!(element instanceof HTMLElement)) continue
        if (elements.has(element)) {
          queue(element)
          continue
        }
        const radius = Number.parseFloat(
          getComputedStyle(element).getPropertyValue('--corner-radius'),
        )
        if (!(radius > 0) || radius >= 999) continue
        elements.add(element)
        observer.observe(element, { box: 'border-box' })
        queue(element)
      }
    }

    // Client navigation, portals (search, menus) and late demos all enter here.
    const mutations = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) if (node instanceof Element) discover(node)
      if (!frame) frame = requestAnimationFrame(flush)
    })
    mutations.observe(document.body, { childList: true, subtree: true })
    discover(document.body)
    // Breakpoints can add or remove --corner-radius, so a resize rediscovers.
    let resizeFrame = 0
    const resize = () => {
      if (resizeFrame) return
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0
        discover(document.body)
      })
    }
    // The SVG fallback paints the border and focus ring in captured colors, so a
    // theme change (Vocs toggles attributes on <html>, or the OS scheme) repaints.
    const repaint = () => {
      for (const element of elements) queue(element)
    }
    const theme = new MutationObserver(repaint)
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-vocs-theme'],
    })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', repaint)
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return
      discover(event.target)
      if (elements.has(event.target)) queue(event.target)
    }
    window.addEventListener('resize', resize)
    document.addEventListener('focusin', focus)
    document.addEventListener('focusout', focus)

    function restore(element: HTMLElement) {
      element.removeAttribute('data-smooth-corners')
      element.removeAttribute('data-smooth-static')
      for (const name of [
        'radius',
        'shape',
        'path',
        'background',
        'border',
        'border-width',
        'focus',
      ])
        element.style.removeProperty(`--smooth-${name}`)
    }

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      mutations.disconnect()
      theme.disconnect()
      scheme.removeEventListener('change', repaint)
      window.removeEventListener('resize', resize)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('focusout', focus)
      for (const element of elements) restore(element)
    }
  }, [])

  return null
}

/** CSS superellipse(K) uses |x|^(2^K) + |y|^(2^K) = 1, not Figma's curve.
 * https://drafts.csswg.org/css-borders-4/#corner-shape
 */
function superellipse(width: number, height: number, radius: number, curvature: number, inset = 0) {
  const r = Math.min(radius, (width - 2 * inset) / 2, (height - 2 * inset) / 2)
  const power = 2 / 2 ** curvature
  const points: string[] = []
  const corners = [
    [width - inset - r, inset + r, 1, -1],
    [width - inset - r, height - inset - r, 1, 1],
    [inset + r, height - inset - r, -1, 1],
    [inset + r, inset + r, -1, -1],
  ] as const
  // 32 segments per quadrant keep the error below a pixel at our design radii.
  for (const [corner, [cx, cy, sx, sy]] of corners.entries())
    for (let i = 0; i <= 32; i++) {
      const angle = ((corner % 2 ? 32 - i : i) * Math.PI) / 64
      const x = cx + sx * r * Math.sin(angle) ** power
      const y = cy + sy * r * Math.cos(angle) ** power
      points.push(`${points.length ? 'L' : 'M'}${x.toFixed(3)} ${y.toFixed(3)}`)
    }
  return `${points.join('')}Z`
}

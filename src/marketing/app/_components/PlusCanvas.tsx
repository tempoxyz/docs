'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import type { DotPattern, LitCell } from './dotPatterns'

// Same grid + interaction model as DotCanvas, but each cell is painted as a "+"
// glyph instead of a circle. Geometry from Figma (node 561:2991): 4px squares
// on an 18px pitch.
const DOT_SIZE = 14
const GAP = 3
const PITCH = DOT_SIZE + GAP
// Faint base-grid opacity over the panel surface. Tunable.
const BASE_ALPHA = 0.2
// Cursor spotlight: half-size (CSS px) of the square region that lights up.
const CURSOR_RADIUS = 0
// Follow lag (ms) — higher trails the cursor more smoothly.
const CURSOR_RESPONSE_MS = 100
// #d9d9d9 — cursor and default pattern color.
const BRIGHT_RGB = '125, 125, 125'
// Per-cell crossfade duration when the pattern changes.
const MORPH_MS = 500

function readVar(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

function lerp(a: number, b: number, m: number): number {
  return a + (b - a) * m
}

function blendRgb(a: string, b: string, m: number): string {
  const pa = a.split(',').map((s) => Number.parseFloat(s))
  const pb = b.split(',').map((s) => Number.parseFloat(s))
  return `${Math.round(lerp(pa[0], pb[0], m))}, ${Math.round(lerp(pa[1], pb[1], m))}, ${Math.round(lerp(pa[2], pb[2], m))}`
}

type Props = {
  className?: string
  pattern?: DotPattern
  // Overlays anchored to the dot grid. The container exposes --dot-off-x/y
  // (the grid's centering offsets) so children can align to exact cells.
  children?: ReactNode
}

export default function PlusCanvas({ className, pattern, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Read the latest pattern from the loop without re-running the effect.
  const patternRef = useRef(pattern)
  // Restart the pattern's reveal animation when it re-enters the viewport.
  const revealRef = useRef(true)

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const baseRgb = readVar(container, '--canvas-dot-rgb', '125, 125, 125')

    let w = 0
    let h = 0
    // Centering offset so the grid block sits centered in the container instead
    // of left/top-anchored with leftover space (most visible on mobile widths).
    let offX = 0
    let offY = 0
    const cursor = { x: -9999, y: -9999, active: false }

    const gridSize = () => ({
      cols: Math.floor(w / PITCH),
      rows: Math.floor(h / PITCH),
    })

    const recomputeOffset = () => {
      const { cols, rows } = gridSize()
      // Center the dot field itself (first dot's left edge → last dot's right
      // edge), not the cell block, so the trailing cell gap doesn't pile up as
      // extra padding on the right/bottom.
      offX = (w - ((cols - 1) * PITCH + DOT_SIZE)) / 2
      offY = (h - ((rows - 1) * PITCH + DOT_SIZE)) / 2
    }

    // Paint a single "+" centered in the cell at the cell's top-left pixel.
    // fillStyle must be set by the caller. The plus is two bars sharing the
    // cell's full extent, with a thinner arm so the cross reads clearly.
    const PLUS_ARM = Math.max(1, Math.round(DOT_SIZE / 20))
    const fillDot = (x: number, y: number) => {
      const off = (DOT_SIZE - PLUS_ARM) / 2
      // Vertical bar.
      ctx.fillRect(x + off, y, PLUS_ARM, DOT_SIZE)
      // Horizontal bar.
      ctx.fillRect(x, y + off, DOT_SIZE, PLUS_ARM)
    }

    const drawBase = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = `rgba(${baseRgb}, ${BASE_ALPHA})`
      const { cols, rows } = gridSize()
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          fillDot(offX + c * PITCH, offY + r * PITCH)
        }
      }
    }

    const drawCell = (col: number, row: number, color: string, alpha: number) => {
      if (alpha <= 0.001) return
      ctx.fillStyle = `rgba(${color}, ${alpha})`
      fillDot(offX + col * PITCH, offY + row * PITCH)
    }

    const drawPattern = (pat: DotPattern, t: number, mult: number) => {
      const { cols, rows } = gridSize()
      for (const cell of pat({ t, cols, rows })) {
        drawCell(cell.col, cell.row, cell.color ?? BRIGHT_RGB, cell.alpha * mult)
      }
    }

    // Per-cell morph: shared cells lerp; cells only in `from` fade out; cells
    // only in `to` fade in.
    const drawMorph = (from: DotPattern, fromT: number, to: DotPattern, toT: number, m: number) => {
      const { cols, rows } = gridSize()
      const fromMap = new Map<string, LitCell>()
      for (const c of from({ t: fromT, cols, rows })) {
        fromMap.set(`${c.col},${c.row}`, c)
      }
      const toMap = new Map<string, LitCell>()
      for (const c of to({ t: toT, cols, rows })) {
        toMap.set(`${c.col},${c.row}`, c)
      }
      const keys = new Set([...fromMap.keys(), ...toMap.keys()])
      for (const key of keys) {
        const f = fromMap.get(key)
        const tc = toMap.get(key)
        let color: string
        let alpha: number
        if (f && tc) {
          color = blendRgb(f.color ?? BRIGHT_RGB, tc.color ?? BRIGHT_RGB, m)
          alpha = lerp(f.alpha, tc.alpha, m)
        } else if (f) {
          color = f.color ?? BRIGHT_RGB
          alpha = f.alpha * (1 - m)
        } else if (tc) {
          color = tc.color ?? BRIGHT_RGB
          alpha = tc.alpha * m
        } else {
          continue
        }
        const [col, row] = key.split(',').map(Number)
        drawCell(col, row, color, alpha)
      }
    }

    const drawCursor = () => {
      if (!cursor.active) return
      const { cols, rows } = gridSize()
      for (let r = 0; r < rows; r++) {
        const y = offY + r * PITCH
        const dy = y + DOT_SIZE / 2 - cursor.y
        if (Math.abs(dy) > CURSOR_RADIUS) continue
        for (let c = 0; c < cols; c++) {
          const x = offX + c * PITCH
          const dx = x + DOT_SIZE / 2 - cursor.x
          const dist = Math.hypot(dx, dy)
          if (dist > CURSOR_RADIUS) continue
          // Smooth radial falloff: full glow at the center, fading to 0 at the edge.
          const f = 1 - dist / CURSOR_RADIUS
          const alpha = f * f
          if (alpha <= 0.001) continue
          ctx.fillStyle = `rgba(${BRIGHT_RGB}, ${alpha})`
          fillDot(x, y)
        }
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = container.clientWidth
      h = container.clientHeight
      if (w === 0 || h === 0) return
      recomputeOffset()
      container.style.setProperty('--dot-off-x', `${offX}px`)
      container.style.setProperty('--dot-off-y', `${offY}px`)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduced) {
        drawBase()
        if (patternRef.current) drawPattern(patternRef.current, 9999, 1)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    if (reduced) {
      drawBase()
      if (patternRef.current) drawPattern(patternRef.current, 9999, 1)
      return () => ro.disconnect()
    }

    let visible = true
    const io = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry?.isIntersecting ?? true
        if (nowVisible && !visible) revealRef.current = true
        visible = nowVisible
      },
      { rootMargin: '200px' },
    )
    io.observe(container)

    const target = { x: -9999, y: -9999, active: false }
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
      if (inside) {
        target.x = x
        target.y = y
        if (!target.active) {
          cursor.x = x
          cursor.y = y
        }
        target.active = true
      } else {
        target.active = false
      }
    }
    const onLeave = () => {
      target.active = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', onLeave)

    let raf = 0
    let last = 0
    let t0 = performance.now()
    let shown = patternRef.current
    let from: DotPattern | null = null
    let fromT = 0
    let morphStart = -1

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) {
        last = now
        return
      }

      if (revealRef.current) {
        t0 = now
        revealRef.current = false
      }

      // Pattern changed → start a per-cell morph from the outgoing pattern.
      const cur = patternRef.current
      if (cur !== shown) {
        from = shown ?? null
        fromT = (now - t0) / 1000
        morphStart = now
        t0 = now
        shown = cur
      }

      const dt = last ? Math.min(now - last, 100) : 16
      last = now
      const damping = 1 - Math.exp(-dt / CURSOR_RESPONSE_MS)
      cursor.x += (target.x - cursor.x) * damping
      cursor.y += (target.y - cursor.y) * damping
      cursor.active = target.active

      const tNew = (now - t0) / 1000
      const m = morphStart < 0 ? 1 : Math.min((now - morphStart) / MORPH_MS, 1)

      drawBase()
      if (m < 1 && (from || cur)) {
        if (from && cur) drawMorph(from, fromT, cur, tNew, m)
        else if (from) drawPattern(from, fromT, 1 - m)
        else if (cur) drawPattern(cur, tNew, m)
      } else if (cur) {
        drawPattern(cur, tNew, 1)
      }
      drawCursor()

      if (m >= 1) {
        from = null
        morphStart = -1
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {children}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { THEMES } from './MermaidDiagram'
import * as ui from './StaticMermaidDiagram.recipes'

const FONT_FAMILY =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

let idCounter = 0

export function StaticMermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () =>
      setIsDark(
        document.documentElement.style.colorScheme === 'dark' ||
          document.documentElement.classList.contains('dark'),
      )
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false

    async function renderChart() {
      const { default: mermaid } = await import('mermaid')
      if (cancelled) return

      const th = isDark ? THEMES.dark : THEMES.light

      const nodeBg = isDark ? '#27272a' : th.actorFill
      const nodeBorder = isDark ? '#52525b' : th.actorStroke
      const clusterBg = isDark ? '#3f3f46' : th.blockHeaderBg
      const clusterBorder = isDark ? '#52525b' : th.blockStroke

      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          fontFamily: FONT_FAMILY,
          fontSize: '14px',
          primaryColor: clusterBg,
          primaryTextColor: th.text,
          primaryBorderColor: clusterBorder,
          lineColor: th.line,
          secondaryColor: nodeBg,
          tertiaryColor: clusterBg,
          mainBkg: nodeBg,
          nodeBorder,
          clusterBkg: clusterBg,
          clusterBorder,
          titleColor: th.text,
          edgeLabelBackground: nodeBg,
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          padding: 12,
          nodeSpacing: 40,
          rankSpacing: 40,
        },
      })

      const id = `static-mermaid-${++idCounter}`
      try {
        const { svg } = await mermaid.render(id, chart.trim())
        if (cancelled || !el) return
        el.innerHTML = svg
      } catch (err) {
        console.error('StaticMermaidDiagram:', err)
      }
    }

    renderChart()
    return () => {
      cancelled = true
    }
  }, [chart, isDark])

  return (
    <div {...ui.staticMermaidDiagramLayoutAppearance({ className: 'mermaid-diagram' })}>
      <div ref={containerRef} {...ui.staticMermaidDiagramLayoutAppearance2()} />
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { estW, LAYOUT, THEMES, type ThemeColors } from './MermaidDiagram'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlowNode {
  id: string
  label: string
}

interface FlowEdge {
  from: string
  to: string
  label: string
}

interface ParsedFlowchart {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// ---------------------------------------------------------------------------
// Parser — handles `flowchart TD` blocks
// ---------------------------------------------------------------------------

function parseFlowchart(source: string): ParsedFlowchart {
  const lines = source
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('%%'))
  const nodes = new Map<string, FlowNode>()
  const edges: FlowEdge[] = []

  const ensureNode = (id: string, label?: string) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, label: label ?? id })
    } else if (label) {
      const existing = nodes.get(id)
      if (existing) existing.label = label
    }
  }

  // Extract id and optional label: id["label"] or just id
  const parseNodeRef = (raw: string): { id: string; label?: string } => {
    const m = raw.match(/^(\w+)\["(.+?)"\]$/)
    if (m) return { id: m[1], label: m[2] }
    return { id: raw.trim() }
  }

  for (const line of lines) {
    if (/^flowchart/i.test(line)) continue

    // Edge: from -->|"label"| to  OR  from --> to
    const mEdge = line.match(/^(.+?)\s*-->(?:\|"(.+?)"\|)?\s*(.+)$/)
    if (mEdge) {
      const fromRef = parseNodeRef(mEdge[1].trim())
      const toRef = parseNodeRef(mEdge[3].trim())
      ensureNode(fromRef.id, fromRef.label)
      ensureNode(toRef.id, toRef.label)
      edges.push({ from: fromRef.id, to: toRef.id, label: mEdge[2] ?? '' })
      continue
    }

    // Standalone node definition: id["label"]
    const mNode = line.match(/^(\w+)\["(.+?)"\]$/)
    if (mNode) {
      ensureNode(mNode[1], mNode[2])
    }
  }

  return { nodes: Array.from(nodes.values()), edges }
}

// ---------------------------------------------------------------------------
// Layout constants for flowchart
// ---------------------------------------------------------------------------

const FLOW = {
  nodeH: 36,
  nodePadX: 24,
  nodeGapY: 40,
  arrowSize: 7,
}

// ---------------------------------------------------------------------------
// SVG renderer
// ---------------------------------------------------------------------------

function renderFlowchart(parsed: ParsedFlowchart, th: ThemeColors): string {
  const L = LAYOUT
  const F = FLOW
  const o: string[] = []

  // Measure node widths
  const nodeW = parsed.nodes.map((n) => estW(n.label, L.actorFontSize) + F.nodePadX * 2)
  const maxW = Math.max(...nodeW)

  // Use uniform width for clean vertical alignment
  const uniformW = maxW

  // Account for edge labels rendered to the right of center
  const maxLabelW = parsed.edges.reduce(
    (max, e) => (e.label ? Math.max(max, estW(e.label, L.labelFontSize)) : max),
    0,
  )

  // Center x
  const padding = L.padding
  const cx = padding + uniformW / 2
  const totalW = Math.max(uniformW + padding * 2, cx + uniformW / 2 + 10 + maxLabelW + padding)

  // Compute node y positions
  const nodeY: number[] = []
  let y = padding
  for (let i = 0; i < parsed.nodes.length; i++) {
    nodeY.push(y)
    if (i < parsed.nodes.length - 1) {
      y += F.nodeH + F.nodeGapY
    }
  }
  const totalH = y + F.nodeH + padding

  const nodeIdx = new Map<string, number>()
  for (let i = 0; i < parsed.nodes.length; i++) {
    nodeIdx.set(parsed.nodes[i].id, i)
  }

  o.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">`,
  )
  o.push(`<style>text{font-family:${L.fontFamily}}</style>`)

  // Edges (draw before nodes so lines go behind)
  for (const e of parsed.edges) {
    const fi = nodeIdx.get(e.from)
    const ti = nodeIdx.get(e.to)
    if (fi === undefined || ti === undefined) continue

    const fromY = nodeY[fi] + F.nodeH
    const toY = nodeY[ti]
    const sz = F.arrowSize

    // Vertical line
    o.push(
      `<line x1="${cx}" y1="${fromY}" x2="${cx}" y2="${toY - sz}" stroke="${th.line}" stroke-width="${L.messageStroke}"/>`,
    )

    // Arrow
    o.push(
      `<polygon points="${cx},${toY} ${cx - sz / 2},${toY - sz} ${cx + sz / 2},${toY - sz}" fill="${th.line}" stroke="${th.line}" stroke-width="1" stroke-linejoin="round"/>`,
    )

    // Edge label
    if (e.label) {
      const midY = (fromY + toY) / 2
      o.push(
        `<text x="${cx + 10}" y="${midY}" text-anchor="start" dy="0.35em" font-size="${L.labelFontSize}" font-weight="${L.labelFontWeight}" fill="${th.textMuted}">${esc(e.label)}</text>`,
      )
    }
  }

  // Nodes
  for (let i = 0; i < parsed.nodes.length; i++) {
    const n = parsed.nodes[i]
    const nw = uniformW
    const nx = cx - nw / 2
    const ny = nodeY[i]

    o.push(
      `<rect x="${nx}" y="${ny}" width="${nw}" height="${F.nodeH}" rx="4" fill="${th.actorFill}" stroke="${th.actorStroke}" stroke-width="1"/>`,
    )
    o.push(
      `<text x="${cx}" y="${ny + F.nodeH / 2}" text-anchor="middle" dy="0.35em" font-size="${L.actorFontSize}" font-weight="${L.actorFontWeight}" fill="${th.text}">${esc(n.label)}</text>`,
    )
  }

  o.push('</svg>')
  return o.join('\n')
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// React component
// ---------------------------------------------------------------------------

export function StaticMermaidDiagram({ chart }: { chart: string }) {
  const svgRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
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
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const el = svgRef.current
    if (!el) return
    const parsed = parseFlowchart(chart)
    const th = isDark ? THEMES.dark : THEMES.light
    el.innerHTML = renderFlowchart(parsed, th)
    const svg = el.querySelector('svg')
    if (svg) {
      svg.style.maxWidth = '100%'
      svg.style.height = 'auto'
      svg.style.display = 'block'
      svg.style.margin = '0 auto'
    }
  }, [chart, isDark, mounted])

  return (
    <div
      className="mermaid-diagram"
      style={{
        margin: '2rem 0',
        padding: '1.5rem 1rem',
        borderRadius: '12px',
        overflow: 'hidden',
        overflowX: 'auto',
        minHeight: '100px',
        position: 'relative',
      }}
    >
      <div ref={svgRef}>
        {!mounted && <div className="text-gray10 text-sm">Loading diagram...</div>}
      </div>
    </div>
  )
}
